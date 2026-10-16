-- Skills trait build function — pins specific skills into an agent at compile time.
--
-- The skills trait is dynamic: its static prompt + Skill tool let an agent
-- discover, load, and activate ANY readable skill on demand. When an agent also
-- supplies `skill_ids` in the trait context, this build func loads those skills'
-- bodies and folds them straight into the system prompt, so one or two skills are
-- "baked in" without a tool round-trip. It runs under the agent loader's actor
-- (chat = the user; dataflow = the run's actor) via the compiler's funcs executor,
-- so a skill the actor cannot read is skipped rather than failing the compile.

local funcs = require("funcs")
local errors = require("errors")
local active_set = require("active_set")
local skill_types = require("types")

local SKILL_GET = "kickside.skills:skill_get"
local SKILL_LIST_FILES = "kickside.skills:skill_list_files"

local function inaccessible(err: any): boolean
    return errors.is(err, errors.NOT_FOUND) or errors.is(err, errors.PERMISSION_DENIED)
end

-- The compiler invokes a build func as build(base_prompt, merged_context). The
-- compiler already appends the trait's static prompt separately, so we return
-- ONLY the pinned-skills section (or an empty contribution when nothing is pinned).
local function execute(base_prompt: any, context: any): (skill_types.Contribution?, error?)
    local trait_context = (type(context) == "table" and context or {}) :: skill_types.Map
    local ids = active_set.parse(trait_context.skill_ids)
    if #ids == 0 then return {} end

    local sections: { string } = {}
    for _, id in ipairs(ids) do
        local skill, err = funcs.call(SKILL_GET, { skill_id = id })
        if err then
            if not inaccessible(err) then return nil, err end
        elseif type(skill) == "table" then
            local s = skill :: skill_types.Skill
            if s.body ~= "" then
                local files, files_err = funcs.call(SKILL_LIST_FILES, { skill_id = id })
                if files_err then
                    if not inaccessible(files_err) then return nil, files_err end
                else
                    local section = "### " .. tostring(s.name or "Skill") .. "\n" .. tostring(s.body)
                    -- Inject only the file MANIFEST (paths + kind), never the file
                    -- contents — the agent reads a file on demand via the SkillFile tool.
                    local manifest = (type(files) == "table" and files or {}) :: { skill_types.SkillFile }
                    if #manifest > 0 then
                        local fl: { string } = { "\n\n**Files** (read with the SkillFile tool):" }
                        for _, f in ipairs(manifest) do
                            fl[#fl + 1] = "- `" .. tostring(f.path) .. "` (" .. tostring(f.kind) .. ")"
                        end
                        section = section .. table.concat(fl, "\n")
                    end
                    sections[#sections + 1] = section
                end
            end
        end
    end

    if #sections == 0 then return {} end

    local header = "## Pinned skills\n\n" ..
        "These skills are loaded and ready. Follow them directly when relevant; " ..
        "use the Skill tool to discover, load, or refine others.\n\n"
    return { prompt = header .. table.concat(sections, "\n\n") }
end

return { execute = execute }
