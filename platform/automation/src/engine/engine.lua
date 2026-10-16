-- The automation engine, constructed explicitly from its dependencies.
--
-- new(dependencies) composes the engine from its parts: declared (install and
-- reconfigure commands through the declaration writer), pins (install
-- retention pins, their start and failed-install release), install (install
-- runner, install_type, replay), catalog (types, actions, public-state
-- schemas), ports (sources, sinks), sink_writer (writable port
-- writers), state and state_write (installed and runtime reads, state writes),
-- artifact (export/import), actions (call_action, reconfigure,
-- uninstall/delete, resource ownership), control (execution-identity change), controls
-- (drive pause, resume, run_now, replay, resync), observe
-- (status, health) and recovery (pending command recovery, the command
-- dispatcher pass). The parts share private helpers through one table, so each
-- helper keeps one definition.

local support = require("engine_support")
local declared = require("engine_declared")
local pins = require("engine_pins")
local install = require("engine_install")
local catalog = require("engine_catalog")
local ports = require("engine_ports")
local sink_writer = require("engine_sink_writer")
local state = require("engine_state")
local state_write = require("engine_state_write")
local artifact = require("engine_artifact")
local actions = require("engine_actions")
local control = require("engine_control")
local selected_install = require("engine_selected_install")
local observe = require("engine_observe")
local recovery = require("engine_recovery")
local controls = require("engine_controls")

type Dependencies = {
    types: any,
    automation_ref: any,
    execution_identity: any,
    json: any,
    contract: any,
    component: any,
    registry: any,
    funcs: any,
    logger: any,
    security: any,
    autoinit: any,
    view_components: any,
    sql: any,
    time: any,
    expr: any,
    ctx: any,
    uuid: any,
    hash: any,
    drive: any,
    command: any,
    slot: any,
    policy: any,
    failure_classification: any,
    round_ledger: any,
    round_history: any,
    prepared_retention: any,
    receipt_retention: any,
    retention_pin: any,
    core_db: any,
    declaration_references: any,
    declaration_authority: any,
    jobs_config: any,
}

local PARTS = { declared, pins, install, catalog, ports, sink_writer, state, state_write, artifact, actions, control, selected_install, controls, observe, recovery }

local function new(dependencies: Dependencies): any
    local M: any = {
        EXECUTION_IDENTITY_KEY = support.EXECUTION_IDENTITY_KEY,
    }
    local shared: any = {}
    for _, part in ipairs(PARTS) do
        part.attach(M, dependencies, shared)
    end
    return M
end

return { new = new }
