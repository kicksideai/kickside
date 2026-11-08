-- Harness-only automation engine built from the production dependencies, with
-- named dependencies replaced, so a suite can observe the upgrade between its
-- reads and its command.

local automation_engine = require("automation_engine")

local function new(overrides: any?): any
    local dependencies: any = {
        types = require("types"),
        automation_ref = require("automation_ref"),
        execution_identity = require("execution_identity"),
        json = require("json"),
        contract = require("contract"),
        component = require("component"),
        registry = require("registry"),
        funcs = require("funcs"),
        logger = require("logger"),
        security = require("security"),
        autoinit = require("autoinit"),
        view_components = require("view_components"),
        sql = require("sql"),
        time = require("time"),
        expr = require("expr"),
        ctx = require("ctx"),
        uuid = require("uuid"),
        hash = require("hash"),
        drive = require("drive"),
        command = require("command"),
        slot = require("slot"),
        policy = require("runtime_policy"),
        failure_classification = require("failure_classification"),
        round_ledger = require("round_ledger"),
        round_history = require("round_history"),
        prepared_retention = require("prepared_retention"),
        receipt_retention = require("receipt_retention"),
        round_outcome = require("round_outcome"),
        canonical_json = require("canonical_json"),
        automation_db = require("automation_db"),
        retention_pin = require("retention_pin"),
        core_db = require("core_db"),
        declaration_references = require("declaration_references"),
        declaration_authority = require("declaration_authority"),
        jobs_config = require("jobs_config"),
    }
    for name, dependency in pairs(overrides or {}) do
        if dependencies[name] == nil then error("unknown automation dependency: " .. tostring(name)) end
        dependencies[name] = dependency
    end
    return automation_engine.new(dependencies)
end

return { new = new }
