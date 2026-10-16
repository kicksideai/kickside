local eligibility = require("credential_eligibility")
-- Whole-set replacement and provider-sourced group reconciliation.
local sql = require("sql")
local time = require("time")
local funcs = require("funcs")
local registry = require("registry")
local consts = require("user_consts")
local session_index = require("session_index")
local support = require("user_groups_support")
local user_repo_support = require("user_repo_support")
local default_groups = require("default_groups")
local bot_accounts = require("bot_accounts_repo")
local get_db = user_repo_support.get_db
local find_user = user_repo_support.find_user
local resolve_user_id = support.resolve_user_id
local page = support.page
local M = {}

local MEMBERSHIP_EFFECT = "kickside.security.binding:classify_membership_effect"

local function group_set(rows)
    local groups, seen = {}, {}
    for _, row in ipairs(rows or {}) do
        local group_id = type(row) == "table" and row.group_id or row
        if type(group_id) == "string" and group_id ~= "" and not seen[group_id] then
            seen[group_id] = true
            groups[#groups + 1] = group_id
        end
    end
    table.sort(groups)
    return groups, seen
end

local function replacement_groups(group_ids)
    local desired, seen = {}, {}
    for _, group_id in ipairs(consts.with_baseline_group(consts.get_config(), group_ids)) do
        if group_id and group_id ~= "" then
            if seen[group_id] then
                return nil, consts.ERROR.INVALID_FIELD_VALUE .. "duplicate group_id"
            end
            seen[group_id] = true
            desired[#desired + 1] = group_id
        end
    end
    table.sort(desired)
    return desired, nil
end

local function same_groups(before, after)
    if #before ~= #after then return false end
    for i, group_id in ipairs(before) do
        if after[i] ~= group_id then return false end
    end
    return true
end

local function read_groups_in(executor, user_id)
    local rows, err = sql.builder.select("group_id", "source")
        :from("app_user_groups")
        :where("user_id = ?", user_id)
        :run_with(executor):query()
    if err then return nil, consts.ERROR.DB_OPERATION_FAILED .. ": " .. tostring(err) end
    local sources = {}
    for _, row in ipairs(rows) do sources[row.group_id] = row.source end
    return group_set(rows), nil, sources
end

local function same_sources(before, after)
    for group, source in pairs(before) do
        if after[group] ~= source then return false end
    end
    for group in pairs(after) do if before[group] == nil then return false end end
    return true
end

local function classify_membership_effect(before_groups, after_groups)
    local request = { before_groups = before_groups, after_groups = after_groups }
    local result, err = funcs.call(MEMBERSHIP_EFFECT, request)
    if err or type(result) ~= "table" then return nil, tostring(err or "membership effect unavailable") end
    if result.effect ~= "unchanged" and result.effect ~= "allow_only" and result.effect ~= "reduction" then
        return nil, "membership effect unavailable"
    end
    if type(result.revision) ~= "string" or result.revision == "" then
        return nil, "membership effect revision unavailable"
    end
    return result, nil
end

local function registry_revision()
    local version, err = registry.current_version()
    if err or not version then return nil, tostring(err or "registry version unavailable") end
    return tostring(version:id()), nil
end

-- preflight_membership_change reads membership and Security policy effects before
-- opening a Users transaction. The provider call is never made under an account
-- lock. prepare receives the read-only DB handle and must return the effective
-- after set and a write context.
function M.preflight_membership_change(db, user_id, prepare)
    local before_groups, before_err, before_sources = read_groups_in(db, user_id)
    if before_err then return nil, before_err end
    local after_groups, context, prepare_err = prepare(db, before_groups, before_sources)
    if prepare_err then return nil, prepare_err end
    after_groups = group_set(after_groups)
    local decision, decision_err = classify_membership_effect(before_groups, after_groups)
    if decision_err then return nil, decision_err end
    return { before_groups = before_groups, before_sources = before_sources, after_groups = after_groups, context = context,
        effect = decision.effect, revision = decision.revision }, nil
end

-- apply_membership_change_in applies a previously classified change after taking
-- the existing account lock. It rejects a changed membership observation or
-- registry revision so callers retry from preflight; no provider call runs in
-- the transaction.
function M.apply_membership_change_in(tx, user_id, preflight, write)
    local locked, lock_err = session_index.lock_accounts(tx, { user_id })
    if lock_err then return nil, lock_err end
    if not locked[1] then return nil, consts.ERROR.USER_NOT_FOUND end

    local before_groups, before_err, before_sources = read_groups_in(tx, user_id)
    if before_err then return nil, before_err end
    if not same_groups(before_groups, preflight.before_groups)
        or not same_sources(before_sources, preflight.before_sources) then
        return nil, support.membership_conflict()
    end
    local before_revision, revision_err = registry_revision()
    if revision_err then return nil, revision_err end
    if before_revision ~= preflight.revision then
        return nil, support.membership_conflict()
    end
    local write_result, write_err = write(preflight.context)
    if write_err then return nil, write_err end
    local invalidated = { revoked = 0 }
    if preflight.effect == "reduction" then
        local invalidate_err
        invalidated, invalidate_err = session_index.invalidate_user_in(tx, user_id, {revoke_delegations = true})
        if invalidate_err then return nil, invalidate_err end
    end
    local after_revision, after_revision_err = registry_revision()
    if after_revision_err then return nil, after_revision_err end
    if after_revision ~= preflight.revision then
        return nil, support.membership_conflict()
    end
    local account, account_err = bot_accounts.find_in(tx, user_id)
    if account_err then return nil, account_err end
    if account and bot_accounts.is_bot(account) then
        local after_groups, groups_err, after_sources = read_groups_in(tx, user_id)
        if groups_err then return nil, groups_err end
        if not same_groups(before_groups, after_groups) or not same_sources(before_sources, after_sources) then
            local _, audit_err = bot_accounts.record_in(tx, user_id, "groups", {
                before_groups = before_groups, after_groups = after_groups,
                before_sources = before_sources, after_sources = after_sources, membership_effect = preflight.effect,
            })
            if audit_err then return nil, audit_err end
        end
    end
    return { result = write_result, effect = preflight.effect, before_groups = before_groups,
        after_groups = preflight.after_groups, sessions_revoked = invalidated.revoked }, nil
end

-- Enrolls every existing account into group_id once per enrollment_id. The
-- enrollment claim comes first, so a concurrent replay waits for it and then
-- reports the committed enrollment. The account locks follow in the shared
-- order, so an account deleted concurrently is skipped rather than referenced.
function M.initialize_default_group(group_id, enrollment_id)
    if type(group_id) ~= "string" or group_id == "" then return nil, "group_id is required" end
    if type(enrollment_id) ~= "string" or enrollment_id == "" then return nil, "enrollment_id is required" end
    local db, db_err = get_db()
    if db_err then return nil, db_err end
    local tx, tx_err = db:begin()
    if tx_err or not tx then
        db:release()
        return nil, "group enrollment transaction failed: " .. tostring(tx_err)
    end
    local function fail(err)
        tx:rollback()
        db:release()
        return nil, "group enrollment failed: " .. tostring(err)
    end
    local now = time.now():utc():format_rfc3339()
    local claimed, claim_err = tx:execute([[
        INSERT INTO app_user_group_enrollments (enrollment_id, group_id, created_at) VALUES ($1,$2,$3)
        ON CONFLICT (enrollment_id) DO NOTHING
    ]], { enrollment_id, group_id, now })
    if claim_err then return fail(claim_err) end
    if claimed.rows_affected == 0 then
        local rows, read_err = tx:query("SELECT group_id FROM app_user_group_enrollments WHERE enrollment_id=$1", { enrollment_id })
        if read_err then return fail(read_err) end
        if not rows[1] or rows[1].group_id ~= group_id then return fail("an enrollment cannot change its group_id") end
        local _, commit_err = tx:commit()
        if commit_err then return fail(commit_err) end
        db:release()
        return { initialized = false, groups_added = 0 }, nil
    end
    local accounts, accounts_err = tx:query("SELECT user_id FROM app_users WHERE NOT " .. user_repo_support.BOT_ACCOUNT_PREDICATE)
    if accounts_err then return fail(accounts_err) end
    local ids = {}
    for _, account in ipairs(accounts or {}) do ids[#ids + 1] = account.user_id end
    local locked, lock_err = session_index.lock_accounts(tx, ids)
    if lock_err then return fail(lock_err) end
    local added = 0
    for _, account in ipairs(locked) do
        local inserted, insert_err = tx:execute([[
            INSERT INTO app_user_groups (user_id, group_id, source, created_at) VALUES ($1,$2,$3,$4)
            ON CONFLICT (user_id, group_id) DO NOTHING
        ]], { account.user_id, group_id, enrollment_id, now })
        if insert_err then return fail(insert_err) end
        added = added + inserted.rows_affected
    end
    local _, commit_err = tx:commit()
    if commit_err then return fail(commit_err) end
    db:release()
    return { initialized = true, groups_added = added }, nil
end

function M.preflight_replace(db, user_id, group_ids)
    if type(group_ids) ~= "table" then
        return nil, consts.ERROR.INVALID_FIELD_VALUE .. "group_ids must be an array"
    end
    local desired, desired_err = replacement_groups(group_ids)
    if desired_err then return nil, desired_err end
    return M.preflight_membership_change(db, user_id, function()
        return desired, nil, nil
    end)
end

function M.replace_in(executor, user_id, group_ids, preflight)
    if not executor then return nil, consts.ERROR.DB_CONNECTION_FAILED end
    if not user_id or user_id == "" then
        return nil, consts.ERROR.MISSING_REQUIRED_FIELD .. "user_id"
    end

    if not group_ids or type(group_ids) ~= "table" then
        return nil, consts.ERROR.INVALID_FIELD_VALUE .. "group_ids must be an array"
    end
    if type(preflight) ~= "table" then return nil, "membership change must be classified before its transaction" end
    group_ids = preflight.after_groups

    local change, change_err = M.apply_membership_change_in(executor, user_id, preflight, function()
        local delete_result, delete_err = sql.builder.delete("app_user_groups")
            :where("user_id = ?", user_id)
            :run_with(executor):exec()
        if delete_err then return nil, consts.ERROR.DB_OPERATION_FAILED .. ": " .. tostring(delete_err) end

        local groups_added = 0
        for _, group_id in ipairs(group_ids) do
            local result, insert_err = sql.builder.insert("app_user_groups")
                :set_map({
                    user_id = user_id,
                    group_id = group_id,
                    source = "manual",
                    created_at = time.now():utc():format_rfc3339()
                }):run_with(executor):exec()
            if insert_err then return nil, consts.ERROR.DB_OPERATION_FAILED .. ": " .. tostring(insert_err) end
            groups_added = groups_added + result.rows_affected
        end
        return {
            user_id = user_id,
            groups_removed = delete_result.rows_affected,
            groups_added = groups_added,
            security_groups = group_ids,
        }, nil
    end)
    if change_err then return nil, change_err end
    change.result.membership_effect = change.effect
    change.result.sessions_revoked = change.sessions_revoked
    return change.result, nil
end

-- New accounts have no bearer sessions to preserve or revoke. Keep their initial
-- group insertion in the creating transaction without invoking the Security
-- classifier under that transaction.
function M.replace_new_in(executor, user_id, group_ids)
    if type(group_ids) ~= "table" then
        return nil, consts.ERROR.INVALID_FIELD_VALUE .. "group_ids must be an array"
    end
    local desired, desired_err = replacement_groups(group_ids)
    if desired_err then return nil, desired_err end
    local deleted, delete_err = sql.builder.delete("app_user_groups")
        :where("user_id = ?", user_id):run_with(executor):exec()
    if delete_err then return nil, consts.ERROR.DB_OPERATION_FAILED .. ": " .. tostring(delete_err) end
    local added = 0
    for _, group_id in ipairs(desired) do
        local inserted, insert_err = sql.builder.insert("app_user_groups")
            :set_map({ user_id = user_id, group_id = group_id, source = "manual",
                created_at = time.now():utc():format_rfc3339() }):run_with(executor):exec()
        if insert_err then return nil, consts.ERROR.DB_OPERATION_FAILED .. ": " .. tostring(insert_err) end
        added = added + inserted.rows_affected
    end
    return { user_id = user_id, groups_removed = deleted.rows_affected, groups_added = added,
        security_groups = desired, membership_effect = "unchanged" }, nil
end

function M.set_user_groups(user_id, group_ids)
    return support.retry_membership_change(function()
        if not user_id or user_id == "" then
            return nil, consts.ERROR.MISSING_REQUIRED_FIELD .. "user_id"
        end
        if not group_ids or type(group_ids) ~= "table" then
            return nil, consts.ERROR.INVALID_FIELD_VALUE .. "group_ids must be an array"
        end

        local db, err = get_db()
        if err then return nil, err end
        local resolved, resolve_err = resolve_user_id(db, user_id)
        if resolve_err then db:release(); return nil, resolve_err end

        local preflight, preflight_err = M.preflight_replace(db, resolved, group_ids)
        if preflight_err then db:release(); return nil, preflight_err end
        local tx, tx_err = db:begin()
        if tx_err or not tx then
            db:release()
            return nil, consts.ERROR.DB_OPERATION_FAILED .. ": " .. tostring(tx_err)
        end
        local result, replace_err = M.replace_in(tx, resolved, group_ids, preflight)
        if replace_err then
            tx:rollback(); db:release()
            return nil, replace_err
        end
        local _, commit_err = tx:commit()
        if commit_err then
            tx:rollback(); db:release()
            return nil, consts.ERROR.DB_OPERATION_FAILED .. ": " .. tostring(commit_err)
        end
        db:release()
        return result, nil
    end)
end

-- read_sourced_state resolves an identifier to the canonical user_id and reads the
-- rows needed to reconcile a single source: `sourced` is the group ids currently
-- owned by `source`, and `present` is the set of every group id the user holds
-- under any source. The reconciliation policy consumes this snapshot to decide the
-- add/remove plan; this op only reads rows.
function M.read_sourced_state(identifier, source)
    local db, err = get_db()
    if err then
        return nil, err
    end

    local resolved, resolve_err = resolve_user_id(db, identifier)
    if resolve_err then
        db:release()
        return nil, resolve_err
    end
    local user_id = resolved

    local sourced_rows, e1 = sql.builder.select("group_id")
        :from("app_user_groups")
        :where("user_id = ? AND source = ?", user_id, source)
        :run_with(db):query()
    if e1 then
        db:release()
        return nil, consts.ERROR.DB_OPERATION_FAILED .. ": " .. e1
    end

    local all_rows, e2 = sql.builder.select("group_id")
        :from("app_user_groups")
        :where("user_id = ?", user_id)
        :run_with(db):query()
    if e2 then
        db:release()
        return nil, consts.ERROR.DB_OPERATION_FAILED .. ": " .. e2
    end

    db:release()

    local sourced = {}
    for _, row in ipairs(sourced_rows) do
        sourced[#sourced + 1] = row.group_id
    end

    local present = {}
    for _, row in ipairs(all_rows) do
        present[row.group_id] = true
    end

    return { user_id = user_id, sourced = sourced, present = present }
end

local function sourced_plan(source, before_groups, sources, to_add, to_remove, defaults)
        local _, present = group_set(before_groups)
        local _, default_set = group_set(defaults)
        local remove_set, add_set = {}, {}
        for group_id in pairs(default_set) do
            if not present[group_id] then add_set[group_id] = "manual" end
        end
        for _, group_id in ipairs(to_remove or {}) do
            if sources[group_id] == source and not default_set[group_id] then remove_set[group_id] = true end
        end
        for _, group_id in ipairs(to_add or {}) do
            if not present[group_id] and not add_set[group_id] then add_set[group_id] = source end
        end
        local after = {}
        for _, group_id in ipairs(before_groups) do
            if not remove_set[group_id] then after[#after + 1] = group_id end
        end
        for group_id in pairs(add_set) do after[#after + 1] = group_id end
        local removes, adds = {}, {}
        for group_id in pairs(remove_set) do removes[#removes + 1] = group_id end
        for group_id in pairs(add_set) do adds[#adds + 1] = group_id end
        table.sort(removes)
        table.sort(adds)
        return after, { adds = adds, removes = removes, add_sources = add_set }, nil
    end

local function write_sourced_in(executor, user_id, source, plan)
    for _, group_id in ipairs(plan.removes) do
        local _, err = sql.builder.delete("app_user_groups")
            :where("user_id = ? AND group_id = ? AND source = ?", user_id, group_id, source)
            :run_with(executor):exec()
        if err then return nil, consts.ERROR.DB_OPERATION_FAILED .. ": " .. tostring(err) end
    end
    for _, group_id in ipairs(plan.adds) do
        local _, err = sql.builder.insert("app_user_groups")
            :set_map({user_id = user_id, group_id = group_id, source = plan.add_sources[group_id],
                created_at = time.now():utc():format_rfc3339()})
            :run_with(executor):exec()
        if err then return nil, consts.ERROR.DB_OPERATION_FAILED .. ": " .. tostring(err) end
    end
    return {groups_added = #plan.adds, groups_removed = #plan.removes}, nil
end

-- write_sourced_plan applies a reconciliation plan for a single source in one
-- transaction: it deletes each (user, group) row owned by `source`, then inserts
-- each desired group under `source`. It decides nothing -- the caller supplies the
-- exact groups to remove and add. Returns { groups_added, groups_removed }.
function M.write_sourced_plan(user_id, source, to_add, to_remove)
    return support.retry_membership_change(function()
        local db, err = get_db()
        if err then
            return nil, err
        end

        local preflight, preflight_err = M.preflight_membership_change(db, user_id, function(_, before_groups, sources)
            return sourced_plan(source, before_groups, sources, to_add, to_remove)
        end)
        if preflight_err then db:release(); return nil, preflight_err end

        local tx, terr = db:begin()
        if terr then
            db:release()
            return nil, consts.ERROR.DB_OPERATION_FAILED .. ": " .. terr
        end

        local change, change_err = M.apply_membership_change_in(tx, user_id, preflight, function(plan_result)
            return write_sourced_in(tx, user_id, source, plan_result)
        end)
        if change_err then
            tx:rollback()
            db:release()
            return nil, change_err
        end


        local ok, cerr = tx:commit()
        if cerr then
            db:release()
            return nil, consts.ERROR.DB_OPERATION_FAILED .. ": " .. cerr
        end

        db:release()

        return {
            groups_added = change.result.groups_added,
            groups_removed = change.result.groups_removed,
            sessions_revoked = change.sessions_revoked,
            membership_effect = change.effect,
        }
    end)
end

-- Completes an SSO-created pending account in one Users-owned transaction. The
-- default membership, provider-sourced memberships, and activation state either
-- commit together or remain pending for a later retry. Replaying after an
-- ambiguous commit is safe: membership inserts are computed from current rows.
function M.complete_passwordless_provisioning(identifier, default_group, source, group_ids)
    return support.retry_membership_change(function()
        if not identifier or identifier == "" then
            return nil, consts.ERROR.MISSING_REQUIRED_FIELD .. "identifier"
        end
        if not source or source == "" then
            return nil, consts.ERROR.MISSING_REQUIRED_FIELD .. "source"
        end
        if type(group_ids) ~= "table" then
            return nil, consts.ERROR.INVALID_FIELD_VALUE .. "group_ids must be an array"
        end

        local defaults, defaults_err = default_groups.resolve(default_group)
        if defaults_err then return nil, defaults_err end
        defaults = consts.with_baseline_group(consts.get_config(), defaults)
        local desired, wanted = {}, {}
        for _, group_id in ipairs(group_ids) do
            if type(group_id) == "string" and group_id ~= "" and not wanted[group_id] then
                wanted[group_id] = true
                desired[#desired + 1] = group_id
            end
        end

        local db, db_err = get_db()
        if db_err then return nil, db_err end
        local normalized = type(identifier) == "string" and identifier:lower() or identifier
        local user, user_err = find_user(db, identifier, normalized, {"user_id", "password_hash", "status"})
        if user_err or not user then db:release(); return nil, user_err or consts.ERROR.USER_NOT_FOUND end
        local preflight, preflight_err = M.preflight_membership_change(db, user.user_id, function(_, before_groups, sources)
            local removals = {}
            for group, owner in pairs(sources) do
                if owner == source and not wanted[group] then removals[#removals + 1] = group end
            end
            return sourced_plan(source, before_groups, sources, desired, removals, defaults)
        end)
        if preflight_err then db:release(); return nil, preflight_err end
        local tx, tx_err = db:begin()
        if tx_err or not tx then db:release(); return nil, consts.ERROR.DB_OPERATION_FAILED .. ": " .. tostring(tx_err) end
        local function fail(err)
            tx:rollback(); db:release()
            return nil, err
        end
        local change, change_err = M.apply_membership_change_in(tx, user.user_id, preflight, function(plan)
            local current, current_err = find_user(tx, user.user_id, user.user_id, {"user_id", "password_hash", "status"})
            if current_err or not current then return nil, current_err or consts.ERROR.USER_NOT_FOUND end
            local eligible, eligibility_err = eligibility.check_in(tx, current.user_id)
            if not eligible then return nil, eligibility_err end
            if current.password_hash ~= consts.NO_PASSWORD
                or (current.status ~= consts.USER_STATUS.PENDING and current.status ~= consts.USER_STATUS.ACTIVE) then
                return nil, "User is not an SSO provisioning account"
            end
            local written, write_err = write_sourced_in(tx, user.user_id, source, plan)
            if write_err then return nil, write_err end
            local _, activate_err = sql.builder.update("app_users")
                :set_map({status = consts.USER_STATUS.ACTIVE, updated_at = time.now():utc():format_rfc3339()})
                :where("user_id = ? AND password_hash = ?", user.user_id, consts.NO_PASSWORD):run_with(tx):exec()
            if activate_err then return nil, consts.ERROR.DB_OPERATION_FAILED .. ": " .. tostring(activate_err) end
            return written, nil
        end)
        if change_err then return fail(change_err) end
        local _, commit_err = tx:commit()
        if commit_err then return fail(consts.ERROR.DB_OPERATION_FAILED .. ": " .. tostring(commit_err)) end
        db:release()
        return {user_id = user.user_id, status = consts.USER_STATUS.ACTIVE,
            groups_added = change.result.groups_added, groups_removed = change.result.groups_removed,
            membership_effect = change.effect, sessions_revoked = change.sessions_revoked}, nil
    end)
end

return M
