local time = require("time")

local retired = [[('app.security:user.self_service'),
    ('app.security:user.profile_env'), ('app.security:user.app_shell_access'),
    ('app.security:user.view_registry_access'), ('app.security:user.dataflow_view_origin'),
    ('app.security:user.navigation_registry'), ('app.security:user.default_membership_registry'),
    ('app.security:user.documentation_registry'), ('app.security:user.runtime_contract_methods'),
    ('app.security:user.runtime_contract_context'), ('app.security:user.runtime_function_context'),
    ('app.security:user.runtime_process_notifications'), ('app.security:user.runtime_session_spawn'),
    ('app.security:user.runtime_env_read'), ('app.security:user.runtime_http_private_ip'),
    ('app.security:user.runtime_dataflow_node_spawn'),
    ('kickside.skills.security:bundle_transfer_output_publish')]]

local matches = {
    sqlite = [[EXISTS (
        SELECT 1 FROM json_tree(c.authority_json) p JOIN retired r ON r.id=p.value WHERE p.type='text'
    ) OR EXISTS (
        SELECT 1 FROM json_tree(c.execution_identity_json) p JOIN retired r ON r.id=p.value WHERE p.type='text'
    )]],
    postgres = [[EXISTS (
        SELECT 1 FROM jsonb_path_query(c.authority_json::jsonb, '$.**') p(value)
        JOIN retired r ON p.value=to_jsonb(r.id)
    ) OR EXISTS (
        SELECT 1 FROM jsonb_path_query(c.execution_identity_json::jsonb, '$.**') p(value)
        JOIN retired r ON p.value=to_jsonb(r.id)
    )]],
}

return require("migration").define(function()
    migration("revoke credentials with retired policy restrictions", function()
        for _, engine in ipairs({"postgres", "sqlite"}) do
            database(engine, function()
                up(function(db)
                    -- Substituting a successor policy can broaden a captured
                    -- ceiling. Revoke the credential and retain its evidence.
                    local _, err = db:execute("WITH retired(id) AS (VALUES " .. retired .. [[)
                        UPDATE kickside_mcp_credentials AS c
                        SET status='revoked', revoked_at=$1, updated_at=$1, revoked_by='policy-retirement'
                        WHERE c.status='active' AND (]] .. matches[engine] .. ")", {time.now():unix()})
                    if err then error(err) end
                end)
            end)
        end
    end)
end)
