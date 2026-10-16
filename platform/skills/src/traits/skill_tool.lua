-- Skill tool — the agent-facing surface over the skill store.
--
-- Progressive disclosure: the agent calls `list` to see skill names + descriptions
-- (cheap), `use` to load a skill's full body only when it needs it, and `save`/
-- `refine` to author or improve a skill from what it just did (the self-improving
-- loop). `agent_id` scopes a skill to a specific agent — that's how one agent
-- manages skills for another (access-checked in the store). Every action
-- returns a table: list pages skill records, use returns the skill with its
-- markdown body and file manifest, writes return the affected ids.

local funcs = require("funcs")
local ctx = require("ctx")
local active_set = require("active_set")
local skill_types = require("types")
local keyset = require("keyset")

local SKILL_GET = "kickside.skills:skill_get"

-- Maps each tool action to the store method that backs it. Keep in sync with the
-- action enum in the tool's input_schema (_index.yaml). activate/deactivate are
-- handled separately below: they mutate the session's active set, not the store.
local ACTION_FN = {
    list = "skill_list",
    use = "skill_get",
    save = "skill_create",
    refine = "skill_refine",
    delete = "skill_delete",
    share = "skill_share",
    unshare = "skill_share",
}

local function tool_args(args: any): skill_types.SkillToolArgs
    if type(args) == "table" then return (args :: any) :: skill_types.SkillToolArgs end
    return ({} :: any) :: skill_types.SkillToolArgs
end

-- list pages the store's matching skills in its own order; the cursor is the
-- store position of the next page.
local function list_page(args: skill_types.SkillToolArgs): (any, error?)
    local limit, cursor, page_err = keyset.args(args)
    if page_err then return nil, page_err end
    local offset = 0
    if cursor ~= nil then
        local position = tonumber(cursor)
        if not position or position ~= math.floor(position) or position < 0 then
            return nil, errors.new({ message = "cursor must be a next_cursor value from a previous page", kind = errors.INVALID })
        end
        offset = position :: integer
    end
    local query: { [string]: any } = {}
    for key, value in pairs(args :: any) do query[key] = value end
    query.cursor = nil
    query.limit = (limit :: integer) + 1
    query.offset = offset
    local rows, err = funcs.call("kickside.skills:skill_list", query)
    if err then return nil, err end
    local all = (rows or {}) :: { skill_types.SkillSummary }
    local skills: { skill_types.SkillSummary } = {}
    for index = 1, math.min(#all, limit :: integer) do
        local row = all[index]
        skills[#skills + 1] = {
            skill_id = row.skill_id,
            name = row.name,
            status = row.status,
            icon = row.icon,
            agent_id = row.agent_id,
            version = row.version,
            version_count = row.version_count,
            file_count = row.file_count,
            bundle_size = row.bundle_size,
        }
    end
    return {
        success = true,
        skills = skills,
        count = #skills,
        next_cursor = #all > (limit :: integer) and tostring(offset + (limit :: integer)) or nil,
    }, nil
end

-- use returns the skill with its markdown body and the file manifest (paths and
-- kinds, not contents). The agent reads a file's contents on demand via the
-- SkillFile tool, so loading a skill never pulls every reference/asset into context.
local function use_result(s: skill_types.Skill?, files: { skill_types.SkillFile }?): (any, error?)
    if type(s) ~= "table" then return nil, errors.new({ message = "Skill not found", kind = errors.NOT_FOUND }) end
    return { success = true, skill = s, files = files or {} }, nil
end

-- activate/deactivate maintain the session's active skill set (active_skills in
-- the session context). The active_skills prompt func injects those bodies into
-- the prompt each step, so activation keeps a skill loaded across turns until the
-- agent deactivates it — distinct from `use`, a one-shot read. The new set is
-- returned as a control directive the session persists; we read the current set
-- back through ctx (the session context is merged into the tool's exec context).
local function handle_active(action: string, args: skill_types.SkillToolArgs): (any, error?)
    local skill_id = args.skill_id
    if type(skill_id) ~= "string" or (skill_id :: string) == "" then
        return nil, errors.new({ message = tostring("skill_id is required to " .. action .. " a skill."), kind = errors.INVALID })
    end
    local current = active_set.parse(ctx.get("active_skills"))

    if action == "activate" then
        if active_set.has(current, skill_id) then
            return { message = "Skill `" .. skill_id .. "` is already active." }
        end
        -- Confirm the actor can read the skill before activating it; a skill that
        -- cannot be loaded must not enter the active set.
        local skill, err = funcs.call(SKILL_GET, { skill_id = skill_id })
        if err then return nil, err end
        local s = skill :: skill_types.Skill
        return {
            message = "Activated **" .. tostring(s.name or skill_id) .. "** `" .. skill_id ..
                "`. It is now in your prompt under \"Active skills\" — follow it directly; " ..
                "deactivate it when you are done.",
            _control = { context = { session = { set = { active_skills = active_set.add(current, skill_id) } } } },
        }
    end

    -- deactivate
    if not active_set.has(current, skill_id) then
        return { message = "Skill `" .. skill_id .. "` is not active." }
    end
    return {
        message = "Deactivated skill `" .. skill_id .. "`. It is no longer in your prompt.",
        _control = { context = { session = { set = { active_skills = active_set.remove(current, skill_id) } } } },
    }
end

local function handler(args: any): (any, error?)
    local parsed_args = tool_args(args)
    local action = tostring(parsed_args.action)

    if action == "activate" or action == "deactivate" then
        return handle_active(action, parsed_args)
    end

    local fn = ACTION_FN[action]
    if not fn then
        return nil, errors.new({ message = "unknown action '" .. action .. "'. Available: " ..
            "list, use, activate, deactivate, save, refine, delete, share, unshare", kind = errors.INVALID })
    end

    -- unshare is share with revoke semantics; carry that through to the store.
    if action == "unshare" then parsed_args.action = "revoke" end

    if action == "list" then return list_page(parsed_args) end

    local result, err = funcs.call("kickside.skills:" .. fn, parsed_args)
    if err then return nil, err end

    if action == "use" then
        local files, files_err = funcs.call("kickside.skills:skill_list_files", { skill_id = parsed_args.skill_id })
        if files_err then return nil, files_err end
        return use_result(result :: skill_types.Skill, files :: { skill_types.SkillFile }?)
    end
    if action == "save" then
        return { success = true, skill_id = result, message = "Saved skill `" .. tostring(result) .. "`." }
    end
    if action == "refine" then
        local r = result :: skill_types.RefineResult?
        return { success = true, skill_id = r and r.skill_id, version = r and r.version,
            message = r and r.version
                and ("Refined skill `" .. tostring(r.skill_id) .. "` to version " .. tostring(r.version) .. ".")
                or ("Updated skill `" .. tostring(r and r.skill_id) .. "`.") }
    end
    if action == "delete" then
        local r = result :: skill_types.DeleteResult?
        return { success = true, skill_id = r and r.skill_id, message = "Deleted skill `" .. tostring(r and r.skill_id) .. "`." }
    end
    local r = result :: skill_types.ShareResult?
    local verb = action == "unshare" and "Unshared" or "Shared"
    return { success = true, skill_id = r and r.skill_id, user_id = r and r.user_id,
        message = verb .. " skill `" .. tostring(r and r.skill_id) .. "` with " .. tostring(r and r.user_id) .. "." }
end

return { handler = handler }
