-- Skills trait prompt func — folds the session's ACTIVE skills into the prompt
-- on every step. The agent activates a skill with the Skill tool, which writes
-- the id into the session context (active_skills) via a control directive; this
-- reads that set back each step and injects the bodies, so an activated skill
-- stays in the prompt until the agent deactivates it.
--
-- Distinct from init_skills: that pins the compile-time skills the user chose on
-- the agent; this is the agent's own runtime set, curated mid-session and
-- persisted in the session context (so it survives a process restart).

local funcs = require("funcs")
local ctx = require("ctx")
local errors = require("errors")
local active_set = require("active_set")
local skill_types = require("types")

local SKILL_GET = "kickside.skills:skill_get"

local function inaccessible(err: any): boolean
    return errors.is(err, errors.NOT_FOUND) or errors.is(err, errors.PERMISSION_DENIED)
end

-- The agent runtime calls a prompt func with no args and reads runtime state via
-- ctx. We return the active-skills section (or "" when none are active); the
-- runtime appends a non-empty return to the system prompt for this step.
local function execute(): (string?, error?)
    local raw = ctx.get("active_skills")
    local ids = active_set.parse(raw)
    if #ids == 0 then return "" end

    local sections: { string } = {}
    for _, id in ipairs(ids) do
        local skill, err = funcs.call(SKILL_GET, { skill_id = id })
        if err then
            if not inaccessible(err) then return nil, err end
        elseif type(skill) == "table" then
            local s = skill :: skill_types.Skill
            if s.body ~= "" then
            sections[#sections + 1] = "### " .. tostring(s.name or "Skill") .. "\n" .. tostring(s.body)
            end
        end
    end
    if #sections == 0 then return "" end

    return "## Active skills\n\n" ..
        "You activated these; follow them directly. Deactivate one with the " ..
        "Skill tool's `deactivate` action when you no longer need it.\n\n" ..
        table.concat(sections, "\n\n")
end

return { execute = execute }
