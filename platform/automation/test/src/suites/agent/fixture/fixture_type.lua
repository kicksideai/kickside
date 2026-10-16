-- Minimal installable kickside.automation type, used only by the agent-tool test
-- suite to exercise install/read_config/pause/resume/run/reconfigure/uninstall
-- through the real production engine (kickside.automation:automation), not a stub.

local ctx = require("ctx")
local automations_lib = require("automations_lib")

type Map = { [string]: any }

local M = {}

local function component_id_of(args: any): string?
    local from_args = type(args) == "table" and (args :: Map).component_id or nil
    if type(from_args) == "string" and from_args ~= "" then return from_args end
    local id = ctx.get("component_id")
    if type(id) == "string" and id ~= "" then return id end
    return nil
end

function M.install(input: any): (any, any)
    local body: Map = type(input) == "table" and (input :: Map) or {}
    local title = body.title
    return {
        source = { source_kind = "none" },
        state = { enabled = true, note = body.note },
        metadata = { title = (type(title) == "string" and title ~= "" and title) or "Agent Fixture Automation" },
        public_state = { status = "active", enabled = true },
    }, nil
end

function M.execute(args: any): (Map?, any)
    local id = component_id_of(args)
    if not id then return nil, "component_id not in scope" end
    if type(args) == "table" and args.refuse == true then
        return { success = false, error = "fixture refused the action" }, nil
    end
    return { success = true, ran = true }, nil
end

function M.reconfigure(args: any): (Map?, any)
    local id = component_id_of(args)
    if not id then return nil, "component_id not in scope" end
    local body: Map = type(args) == "table" and (args :: Map) or {}
    -- A kind-level refusal travels as a structured result, never as err; the
    -- manage/API callers must surface it as failure.
    if body.refuse == true then
        return { success = false, error = "fixture refused the edit" }, nil
    end
    local _, patch_err = automations_lib.patch_state(id, { note = body.note })
    if patch_err then return nil, patch_err end
    -- The portable declaration persists by MERGE over the stored one: the edit
    -- names only what it changes and every unsent install field survives.
    local declaration: Map = { title = body.title, note = body.note }
    local _, portable_err = (automations_lib :: any).merge_portable_input(id, declaration)
    if portable_err then return nil, portable_err end
    return { success = true, id = id }, nil
end

return M
