-- access_subjects: resolve an acting identity into its typed grant subjects and
-- build the effective-access SQL every read and write gate shares.
--
-- Grant subjects are typed pairs (IDENTITY-1 §5): (user, id), (group, id),
-- (service, id). A group or service principal (actor key principal:group:G /
-- principal:service:P) holds only its own pair. A user holds (user, U) plus the
-- groups its login stamped into actor metadata. Any other runtime key (framework
-- maintenance and app actors) matches the user-typed spelling it was granted
-- under.
--
-- Groups come from the ACTOR METADATA the request already carries -- no per-check DB
-- or contract call. The users package owns putting them there at login (session mint
-- sets meta.security_groups from the user's memberships). Runtime membership changes
-- propagate by re-minting the actor's token, not by re-querying here.
--
-- Fail-closed invariants:
--   * Groups are added only when the subject is the current actor; resolving for
--     any other identity yields its own pair only.
--   * No actor / non-table meta -> no groups.
--   * An actor-seam fault returns the unprivileged subjects plus the native
--     dependency error, and deny-all plus the same error for access filters,
--     because a broken facility must not widen access and must be visible as
--     an error, never as a silent narrowing.
--
-- Effective access on a component is the bitwise union of the direct grants the
-- subjects hold on the component itself and on every strict ancestor, read
-- through the indexed kickside_component_ancestor relation (design v4 §6.6).

local security = require("security")
local component_types = require("component_types")
local execution_identity = require("execution_identity")
local contract = require("contract")

local M = {}

-- The union is the OR of per-bit MAXes over the declared capability bits: SQLite
-- has no BIT_OR aggregate, and this evaluates identically on SQLite and
-- PostgreSQL. Aggregate expression over access_mask rows; NULL when no row matches.
local function effective_mask_expr(): string
    local parts: { string } = {}
    local bit = 1
    while bit <= component_types.ACCESS.FULL do
        parts[#parts + 1] = "MAX(access_mask & " .. tostring(bit) .. ")"
        bit = bit * 2
    end
    return "(" .. table.concat(parts, " | ") .. ")"
end

M.EFFECTIVE_MASK = effective_mask_expr()

local function security_module()
    return (M :: any)._security or security
end

local function snapshot_failure(cause: error): error
    return errors.wrap(cause, "security actor snapshot unavailable")
end

-- Snapshot of the current actor for group/filter expansion. Returns
-- (snapshot, nil); snapshot.actor_id is nil when no actor is present or the
-- actor carries no usable id. A fault reported by the actor seam returns
-- (nil, err) with the native dependency error. Raises are never caught here:
-- an unexpected raise propagates instead of widening or silently
-- narrowing access.
local function actor_snapshot(): ({ actor_id: string?, meta: any }?, error?)
    local actor, actor_err = security_module().actor()
    if actor_err then
        return nil, snapshot_failure(actor_err)
    end
    if actor == nil then
        return { actor_id = nil, meta = nil }, nil
    end
    local raw_id, id_err = actor:id()
    if id_err then
        return nil, snapshot_failure(id_err)
    end
    if type(raw_id) ~= "string" or raw_id == "" then
        return { actor_id = nil, meta = nil }, nil
    end
    local meta, meta_err = actor:meta()
    if meta_err then
        return nil, snapshot_failure(meta_err)
    end
    return { actor_id = raw_id, meta = meta }, nil
end

type Subject = { subject_type: string, subject_id: string }

local function append_groups(subjects: { Subject }, seen: { [string]: boolean }, list: any)
    if type(list) ~= "table" then return end
    for _, g in ipairs(list) do
        if type(g) == "string" and g ~= "" and not seen[g] then
            seen[g] = true
            subjects[#subjects + 1] = { subject_type = component_types.SUBJECT_TYPES.GROUP, subject_id = g }
        end
    end
end

-- The typed pair a runtime actor key is granted under.
local function own_subject(actor_id: string): Subject
    local principal = execution_identity.principal_of_key(actor_id)
    if principal then
        return { subject_type = (principal :: any).kind, subject_id = (principal :: any).id }
    end
    return { subject_type = component_types.SUBJECT_TYPES.USER, subject_id = actor_id }
end

-- Resolve the typed grant subjects for actor_id: its own pair, plus its login
-- groups when it is a user and the current actor. Returns (subjects, err): a
-- snapshot fault keeps the unprivileged subjects and carries the typed error,
-- so callers that check it deny explicitly while callers that only read the
-- subjects never see widened access.
function M.resolve(actor_id: any): ({ Subject }, error?)
    if type(actor_id) ~= "string" or actor_id == "" then
        return {}, nil
    end
    local own = own_subject(actor_id)
    local subjects: { Subject } = { own }
    if own.subject_type ~= component_types.SUBJECT_TYPES.USER then
        return subjects, nil
    end

    local actor, snapshot_err = actor_snapshot()
    if snapshot_err then
        return subjects, snapshot_err
    end
    if not actor or actor.actor_id ~= actor_id then
        return subjects, nil
    end
    local meta = actor.meta
    if type(meta) ~= "table" then
        return subjects, nil
    end
    append_groups(subjects, {}, meta.security_groups)
    return subjects, nil
end

local DIRECTORY_CONTRACT = "kickside.contract:directory"

-- directory_groups(user_id) -> the user's live group memberships through the
-- principal directory, or nil for a user who is not active.
local function directory_groups(user_id: string): ({ string }?, error?)
    local def, def_err = contract.get(DIRECTORY_CONTRACT)
    if def_err then return nil, errors.wrap(def_err, "principal directory unavailable") end
    if not def then
        return nil, (errors.new({ message = "principal directory unavailable: nil", kind = errors.UNAVAILABLE, retryable = true }) :: error)
    end
    local directory, open_err = (def :: any):open()
    if open_err then return nil, errors.wrap(open_err, "principal directory open failed") end
    if not directory then
        return nil, (errors.new({ message = "principal directory open failed: nil", kind = errors.UNAVAILABLE, retryable = true }) :: error)
    end
    local answer, call_err = (directory :: any):groups({ id = user_id })
    if call_err then return nil, call_err end
    if type(answer) ~= "table" or (answer :: any).active ~= true then return nil, nil end
    return ((answer :: any).groups or {}) :: { string }, nil
end

-- Typed principal checks use live Users directory memberships, independently
-- of the transport actor. Ordinary session ACLs use resolve's minted snapshot.
function M.principal_subjects(principal: any): ({ Subject }, error?)
    local checked, check_err = execution_identity.check_principal(principal, "principal")
    if check_err or not checked then return {}, check_err end
    local actor_key = execution_identity.actor_key(checked)
    local own = own_subject(actor_key)
    if own.subject_type ~= component_types.SUBJECT_TYPES.USER then return { own }, nil end
    local groups, groups_err = directory_groups((checked :: any).id)
    if groups_err then return {}, groups_err end
    if groups == nil then return {}, nil end
    local subjects: { Subject } = { own }
    append_groups(subjects, {}, groups)
    return subjects, nil
end

-- "(g.subject_type = ? AND g.subject_id = ?) OR ..." over a subject list, with
-- its arguments. An empty list matches nothing.
function M.subject_clause(subjects: { Subject }, alias: string): (string, { any })
    if #subjects == 0 then return "1 = 0", {} end
    local parts: { string } = {}
    local args: { any } = {}
    for _, subject in ipairs(subjects) do
        parts[#parts + 1] = "(" .. alias .. ".subject_type = ? AND " .. alias .. ".subject_id = ?)"
        args[#args + 1] = subject.subject_type
        args[#args + 1] = subject.subject_id
    end
    return "(" .. table.concat(parts, " OR ") .. ")", args
end

-- Rows (component_id, access_mask) of every direct grant the subjects hold,
-- expanded onto each component it reaches: the granted component itself and
-- every strict descendant through the ancestor relation. component_ids, when
-- given, confines the rows to those components. "?" placeholders.
function M.reach_rows(subjects: { Subject }, component_ids: { string }?): (string, { any })
    local clause, clause_args = M.subject_clause(subjects, "g")
    local own_filter, reach_filter = "", ""
    local id_args: { any } = {}
    if component_ids and #component_ids > 0 then
        own_filter = " AND g.component_id IN (" .. M.placeholders(component_ids) .. ")"
        reach_filter = " AND a.component_id IN (" .. M.placeholders(component_ids) .. ")"
        for _, id in ipairs(component_ids) do id_args[#id_args + 1] = id end
    end
    local sql_text = "SELECT g.component_id AS component_id, g.access_mask AS access_mask FROM "
        .. component_types.TABLES.ACCESS .. " g WHERE " .. clause .. own_filter
        .. " UNION ALL SELECT a.component_id AS component_id, g.access_mask AS access_mask FROM "
        .. component_types.TABLES.ACCESS .. " g JOIN " .. component_types.TABLES.ANCESTOR
        .. " a ON a.ancestor_id = g.component_id AND a.depth > 0 WHERE " .. clause .. reach_filter
    local args: { any } = {}
    for _, v in ipairs(clause_args) do args[#args + 1] = v end
    for _, v in ipairs(id_args) do args[#args + 1] = v end
    for _, v in ipairs(clause_args) do args[#args + 1] = v end
    for _, v in ipairs(id_args) do args[#args + 1] = v end
    return sql_text, args
end

-- One component's effective mask for the subjects: the union of their direct
-- grants on the component and on each strict ancestor. "$n" placeholders, run
-- as a raw query on either engine.
function M.effective_mask_query(subjects: { Subject }, component_id: string): (string, { any })
    local clause, clause_args = M.subject_clause(subjects, "g")
    local text = "SELECT " .. M.EFFECTIVE_MASK .. " AS access_mask FROM ("
        .. "SELECT g.access_mask AS access_mask FROM " .. component_types.TABLES.ACCESS .. " g"
        .. " WHERE g.component_id = ? AND " .. clause
        .. " UNION ALL SELECT g.access_mask AS access_mask FROM " .. component_types.TABLES.ANCESTOR .. " a"
        .. " JOIN " .. component_types.TABLES.ACCESS .. " g ON g.component_id = a.ancestor_id"
        .. " WHERE a.component_id = ? AND a.depth > 0 AND " .. clause .. ") x"
    local args: { any } = { component_id }
    for _, v in ipairs(clause_args) do args[#args + 1] = v end
    args[#args + 1] = component_id
    for _, v in ipairs(clause_args) do args[#args + 1] = v end
    return M.numbered(text), args
end

-- Rewrite "?" placeholders as "$1..$n" for a raw query on either engine. The
-- statements built here carry no "?" inside literals.
function M.numbered(text: string): string
    local n = 0
    local out = text:gsub("%?", function(): string
        n = n + 1
        return "$" .. tostring(n)
    end)
    return out
end

-- Resolve the access-narrowing filter for user_id, if the current actor carries one.
-- Returns the list of path prefixes the actor is confined to, or nil when there is no
-- narrowing (the normal case -- a logged-in user over their own tree). Like groups,
-- a filter is honored only when user_id is the current actor, so an injected narrowing
-- never leaks across identities. A present-but-empty filter is the deny-all sentinel:
-- it returns {} (confine to nothing), distinct from nil (no confinement).
--
-- The filter is produced upstream by whatever minted the actor (e.g. an MCP credential
-- runs as its owner with meta.access_filter.prefixes set to its whitelisted subtrees).
-- This module only reads and applies it; the producer owns the policy that built it.
function M.access_filter(user_id: any): ({ string }?, error?)
    if type(user_id) ~= "string" or user_id == "" then
        return nil, nil
    end

    local actor, snapshot_err = actor_snapshot()
    if snapshot_err then
        return {}, snapshot_err
    end
    if not actor or actor.actor_id ~= user_id then
        return nil, nil
    end

    local meta = actor.meta
    if type(meta) ~= "table" then
        return nil, nil
    end

    local filter = meta.access_filter
    if type(filter) ~= "table" then
        return nil, nil
    end

    local prefixes: { string } = {}
    local raw = filter.prefixes
    if type(raw) == "table" then
        for _, p in ipairs(raw) do
            if type(p) == "string" and p ~= "" then
                prefixes[#prefixes + 1] = p
            end
        end
    end
    return prefixes, nil
end

-- Build a parameterized "?,?,..." placeholder string for a subject list.
function M.placeholders(subjects: any)
    local marks = table.create(#subjects, 0)
    for i = 1, #subjects do
        marks[i] = "?"
    end
    return table.concat(marks, ",")
end

return M
