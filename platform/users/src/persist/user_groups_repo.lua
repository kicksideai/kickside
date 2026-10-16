-- User group membership reads and individual assignment operations.
local sql = require("sql")
local time = require("time")
local consts = require("user_consts")
local support = require("user_groups_support")
local sources = require("user_group_sources_repo")
local user_repo_support = require("user_repo_support")
local get_db = user_repo_support.get_db
local find_user = user_repo_support.find_user
local resolve_user_id = support.resolve_user_id
local page = support.page
local read_complete_membership = support.read_complete_membership
local user_groups_repo = {}

function user_groups_repo.assign_user_to_group(user_id, group_id)
    return support.retry_membership_change(function()
        if not user_id or user_id == "" then
            return nil, consts.ERROR.MISSING_REQUIRED_FIELD .. "user_id"
        end

        if not group_id or group_id == "" then
            return nil, consts.ERROR.MISSING_REQUIRED_FIELD .. "group_id"
        end

        local db, err = get_db()
        if err then
            return nil, err
        end

        local resolved, resolve_err = resolve_user_id(db, user_id)
        if resolve_err then
            db:release()
            return nil, resolve_err
        end
        user_id = resolved

        local preflight, preflight_err = sources.preflight_membership_change(db, user_id, function(_, before_groups)
            for _, existing in ipairs(before_groups) do
                if existing == group_id then return before_groups, { already_assigned = true }, nil end
            end
            local after_groups = {}
            for _, existing in ipairs(before_groups) do after_groups[#after_groups + 1] = existing end
            after_groups[#after_groups + 1] = group_id
            return after_groups, { already_assigned = false }, nil
        end)
        if preflight_err then db:release(); return nil, preflight_err end

        local tx, tx_err = db:begin()
        if tx_err or not tx then
            db:release()
            return nil, consts.ERROR.DB_OPERATION_FAILED .. ": " .. tostring(tx_err)
        end
        local change, change_err = sources.apply_membership_change_in(tx, user_id, preflight, function(plan)
            if plan.already_assigned then return plan, nil end
            local _, insert_err = sql.builder.insert("app_user_groups")
                :set_map({
                    user_id = user_id,
                    group_id = group_id,
                    source = "manual",
                    created_at = time.now():utc():format_rfc3339()
                }):run_with(tx):exec()
            if insert_err then return nil, consts.ERROR.DB_OPERATION_FAILED .. ": " .. tostring(insert_err) end
            return plan, nil
        end)
        if change_err then
            tx:rollback()
            db:release()
            return nil, change_err
        end
        local _, commit_err = tx:commit()
        if commit_err then
            tx:rollback()
            db:release()
            return nil, consts.ERROR.DB_OPERATION_FAILED .. ": " .. tostring(commit_err)
        end
        db:release()

        return {
            user_id = user_id,
            group_id = group_id,
            assigned = not change.result.already_assigned,
            already_assigned = change.result.already_assigned,
            membership_effect = change.effect,
        }
    end)
end

function user_groups_repo.remove_user_from_group(user_id, group_id)
    return support.retry_membership_change(function()
        if not user_id or user_id == "" then
            return nil, consts.ERROR.MISSING_REQUIRED_FIELD .. "user_id"
        end

        if not group_id or group_id == "" then
            return nil, consts.ERROR.MISSING_REQUIRED_FIELD .. "group_id"
        end

        local db, err = get_db()
        if err then
            return nil, err
        end

        local resolved, resolve_err = resolve_user_id(db, user_id)
        if resolve_err then
            db:release()
            return nil, resolve_err
        end
        user_id = resolved

        local preflight, preflight_err = sources.preflight_membership_change(db, user_id, function(_, before_groups)
            local after_groups, removed = {}, false
            for _, existing in ipairs(before_groups) do
                if existing == group_id then removed = true else after_groups[#after_groups + 1] = existing end
            end
            return after_groups, { removed = removed }, nil
        end)
        if preflight_err then db:release(); return nil, preflight_err end

        local tx, tx_err = db:begin()
        if tx_err or not tx then
            db:release()
            return nil, consts.ERROR.DB_OPERATION_FAILED .. ": " .. tostring(tx_err)
        end
        local change, change_err = sources.apply_membership_change_in(tx, user_id, preflight, function(plan)
            if not plan.removed then return plan, nil end
            local _, delete_err = sql.builder.delete("app_user_groups")
                :where("user_id = ? AND group_id = ?", user_id, group_id)
                :run_with(tx):exec()
            if delete_err then return nil, consts.ERROR.DB_OPERATION_FAILED .. ": " .. tostring(delete_err) end
            return plan, nil
        end)
        if change_err then
            tx:rollback()
            db:release()
            return nil, change_err
        end
        local _, commit_err = tx:commit()
        if commit_err then
            tx:rollback()
            db:release()
            return nil, consts.ERROR.DB_OPERATION_FAILED .. ": " .. tostring(commit_err)
        end
        db:release()

        return {
            user_id = user_id,
            group_id = group_id,
            removed = change.result.removed,
            membership_effect = change.effect,
        }
    end)
end

function user_groups_repo.get_user_groups(user_id, opts)
    if not user_id or user_id == "" then
        return nil, consts.ERROR.MISSING_REQUIRED_FIELD .. "user_id"
    end

    local db, err = get_db()
    if err then
        return nil, err
    end

    local resolved, resolve_err = resolve_user_id(db, user_id)
    if resolve_err then
        db:release()
        return nil, resolve_err
    end
    user_id = resolved

    local groups, err
    if type(opts) == "table" and opts.limit ~= nil then
        local limit, offset = page(opts)
        groups, err = sql.builder.select("group_id", "created_at")
            :from("app_user_groups")
            :where("user_id = ?", user_id)
            :order_by("created_at ASC, group_id ASC")
            :limit(limit)
            :offset(offset)
            :run_with(db):query()
        if err then err = consts.ERROR.DB_OPERATION_FAILED .. ": " .. tostring(err) end
    else
        groups, err = read_complete_membership(db, user_id)
    end

    db:release()

    if err then
        return nil, err
    end

    local group_ids = {}
    for _, group in ipairs(groups) do
        table.insert(group_ids, group.group_id)
    end

    return {
        user_id = user_id,
        groups = group_ids,
        details = groups
    }
end

function user_groups_repo.get_group_users(group_id, opts)
    if not group_id or group_id == "" then
        return nil, consts.ERROR.MISSING_REQUIRED_FIELD .. "group_id"
    end

    local db, err = get_db()
    if err then
        return nil, err
    end

    local limit, offset = page(opts)
    local query = sql.builder.select("ug.user_id", "ug.created_at", "u.email", "u.full_name", "u.status")
        :from("app_user_groups ug")
        :join("app_users u ON ug.user_id = u.user_id")
        :where("ug.group_id = ?", group_id)
        :order_by("ug.created_at ASC")
        :limit(limit)
        :offset(offset)

    local executor = query:run_with(db)
    local users, err = executor:query()

    db:release()

    if err then
        return nil, consts.ERROR.DB_OPERATION_FAILED .. ": " .. err
    end

    return {
        group_id = group_id,
        users = users
    }
end

function user_groups_repo.get_user_with_groups(identifier)
    if not identifier or identifier == "" then
        return nil, consts.ERROR.MISSING_REQUIRED_FIELD .. "identifier"
    end

    local normalized = type(identifier) == "string" and identifier:lower() or identifier

    local db, err = get_db()
    if err then
        return nil, err
    end
    local user, err = find_user(db, identifier, normalized, {
        "user_id", "email", "full_name", "password_hash", "status", "auth_generation", "created_at", "updated_at", user_repo_support.DELEGATION_COLUMN
    })

    if err then
        db:release()
        return nil, err
    end

    if not user then
        db:release()
        return nil, consts.ERROR.USER_NOT_FOUND
    end

    local groups, err = read_complete_membership(db, user.user_id)

    db:release()

    if err then
        return nil, err
    end

    local group_ids = {}
    for _, group in ipairs(groups) do
        table.insert(group_ids, group.group_id)
    end

    user.security_groups = group_ids

    return user
end

function user_groups_repo.remove_all_user_groups(user_id)
    return support.retry_membership_change(function()
        if not user_id or user_id == "" then
            return nil, consts.ERROR.MISSING_REQUIRED_FIELD .. "user_id"
        end

        local db, err = get_db()
        if err then
            return nil, err
        end

        local resolved, resolve_err = resolve_user_id(db, user_id)
        if resolve_err then
            db:release()
            return nil, resolve_err
        end
        user_id = resolved

        local preflight, preflight_err = sources.preflight_membership_change(db, user_id, function()
            return {}, nil, nil
        end)
        if preflight_err then db:release(); return nil, preflight_err end

        local tx, tx_err = db:begin()
        if tx_err or not tx then
            db:release()
            return nil, consts.ERROR.DB_OPERATION_FAILED .. ": " .. tostring(tx_err)
        end
        local change, change_err = sources.apply_membership_change_in(tx, user_id, preflight, function()
            local result, delete_err = sql.builder.delete("app_user_groups")
                :where("user_id = ?", user_id)
                :run_with(tx):exec()
            if delete_err then return nil, consts.ERROR.DB_OPERATION_FAILED .. ": " .. tostring(delete_err) end
            return result, nil
        end)
        if change_err then
            tx:rollback()
            db:release()
            return nil, change_err
        end
        local _, commit_err = tx:commit()
        if commit_err then
            tx:rollback()
            db:release()
            return nil, consts.ERROR.DB_OPERATION_FAILED .. ": " .. tostring(commit_err)
        end
        db:release()

        return {
            user_id = user_id,
            groups_removed = change.result.rows_affected,
            membership_effect = change.effect,
        }
    end)
end

return user_groups_repo
