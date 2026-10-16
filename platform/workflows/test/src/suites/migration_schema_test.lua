local test = require("test")
local sql = require("sql")

type Map = { [string]: any }

local TABLE_COLUMNS: { [string]: { string } } = {
    workflow_undo_history = { "workflow_id", "tracker" },
    workflow_admission_gate = { "trigger_id" },
    workflow_def_events = {
        "id", "workflow_id", "seq", "type", "body", "actor", "created_at",
    },
    workflow_def_nodes = {
        "workflow_id", "id", "kind", "ref", "title", "config", "status",
        "created_by", "created_at", "updated_at",
    },
    workflow_def_edges = {
        "workflow_id", "id", "source_id", "target_id", "source_port", "target_port",
        "when_expr", "transform", "created_by", "created_at", "updated_at",
    },
    workflow_def_notes = {
        "workflow_id", "id", "body", "kind", "color", "created_by", "created_at", "updated_at",
    },
    workflow_def_layout = {
        "workflow_id", "node_id", "x", "y", "width", "height", "meta",
    },
    workflow_versions = {
        "id", "workflow_id", "version", "def_seq", "document", "compiled_commands",
        "allowlist", "created_by", "created_at",
    },
    workflow_runs = {
        "run_id", "workflow_id", "version", "draft_def_seq", "dataflow_id", "trigger_kind", "trigger_id",
        "dedup_key", "origin", "status", "error", "started_at", "finished_at",
        "invocation_id", "binding_id", "binding_revision", "admission_state",
        "superseded_by", "completion_check_at", "completion_check_token",
        "terminal_event_pending", "terminal_event_check_at", "terminal_event_token", "execution_identity_json", "public_meta_refreshed_at",
        "creation_payload_json", "admission_hash",
    },
    workflow_def_state = {
        "workflow_id", "head_seq", "definition_edit_seq", "node_order", "edge_order",
        "note_order", "params", "labels", "version_lineage",
    },
}

local EXPECTED_INDEXES: { [string]: boolean } = {
    idx_wf_events_stream = true,
    idx_wf_nodes_kind = true,
    idx_wf_edges_source = true,
    idx_wf_edges_target = true,
    idx_wf_versions_stream = true,
    idx_wf_runs_recent = true,
    idx_wf_runs_status = true,
    idx_wf_runs_dataflow = true,
    uq_workflow_live_dedup = true,
    idx_workflow_completion_due = true,
    idx_workflow_event_due = true,
    idx_workflow_admission_count = true,
}

local function column_names(db: any, table_name: string): { string }
    local dbtype = tostring(db:type())
    local query = dbtype == sql.type.POSTGRES
        and "SELECT column_name AS name FROM information_schema.columns WHERE table_schema=current_schema() AND table_name=$1 ORDER BY ordinal_position"
        or "PRAGMA table_info(" .. table_name .. ")"
    local rows, err = db:query(query, dbtype == sql.type.POSTGRES and { table_name } or {})
    test.is_nil(err)
    local names: { string } = {}
    for _, row in ipairs(rows or {}) do
        names[#names + 1] = tostring((row :: Map).name or "")
    end
    return names
end

local function define_tests()
    test.describe("Workflows initial schema", function()
        test.it("creates only the current tables and columns", function()
            local db, err = sql.get("app:db")
            test.is_nil(err)
            test.not_nil(db)

            local dbtype = tostring(db:type())
            local tables_sql = dbtype == sql.type.POSTGRES
                and "SELECT tablename AS name FROM pg_tables WHERE schemaname=current_schema() AND (tablename LIKE 'workflow_%' OR tablename LIKE 'flow_definition_%') ORDER BY name"
                or "SELECT name FROM sqlite_master WHERE type='table' AND (name LIKE 'workflow_%' OR name LIKE 'flow_definition_%') ORDER BY name"
            local tables, query_err = db:query(tables_sql)
            test.is_nil(query_err)
            test.eq(#(tables or {}), 10)

            for table_name, expected in pairs(TABLE_COLUMNS) do
                local actual = column_names(db, table_name)
                test.eq(#actual, #expected, table_name .. " has unexpected compatibility columns")
                for index, name in ipairs(expected) do
                    test.eq(actual[index], name, table_name .. " column " .. tostring(index))
                end
            end
            db:release()
        end)

        test.it("creates the complete final index set", function()
            local db, err = sql.get("app:db")
            test.is_nil(err)
            test.not_nil(db)
            local dbtype = tostring(db:type())
            local index_sql = dbtype == sql.type.POSTGRES
                and "SELECT indexname AS name FROM pg_indexes WHERE schemaname=current_schema() AND tablename LIKE 'workflow_%'"
                or "SELECT name FROM sqlite_master WHERE type='index' AND tbl_name LIKE 'workflow_%'"
            local rows, query_err = db:query(index_sql)
            db:release()
            test.is_nil(query_err)
            local actual: { [string]: boolean } = {}
            for _, row in ipairs(rows or {}) do actual[tostring((row :: Map).name or "")] = true end
            for name, _ in pairs(EXPECTED_INDEXES) do
                test.is_true(actual[name], "missing index " .. name)
            end
            test.is_nil(actual.uq_workflow_live_delivery,
                "delivery admission must reuse the workflow dedup index")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options: any): any
    return run_cases(options)
end

return { run = run }
