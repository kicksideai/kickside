local test = require("test")
local security = require("security")
local registry = require("registry")
local http_client = require("http_client")
local json = require("json")
local sql = require("sql")
local uuid = require("uuid")
local jobs = require("jobs")
local lifecycle = require("lifecycle")
local canonical_json = require("canonical_json")

local function request(group)
    local options = {headers = {}}
    if group then
        local store = assert(security.token_store("app:health_http_tokens"))
        local scope
        if group == "app:health_http_members" then
            scope = assert(security.new_scope({
                assert(security.policy("kickside.security.security:module_access")),
                assert(security.policy("kickside.core.jobs.security:module_access")),
                assert(security.policy("kickside.component.security:module_access")),
                assert(security.policy("kickside.contract.http:user_endpoint_access")),
            }))
        else
            scope = assert(security.named_scope(group))
        end
        local token = assert(store:create(security.new_actor(uuid.v4(), {}), scope, {expiration = "5m"}))
        store:close()
        options.headers.Authorization = "Bearer " .. tostring(token)
    end
    local gateway = assert(registry.get("app:gateway"))
    local port = assert(tostring(gateway.data.addr):match(":(%d+)$"))
    local router_id = "app:api"
    local router = assert(registry.get(router_id))
    local response = assert(http_client.get("http://127.0.0.1:" .. port .. router.data.prefix .. "/jobs/health", options))
    return response, assert(json.decode(response.body))
end

return {run = test.run_cases(function()
    test.describe("Jobs operator health HTTP", function()
        test.it("the existing operator surface owns the route without Jobs or Threads wiring", function()
            local endpoint = assert(registry.get("kickside.security.api:jobs_health.endpoint"))
            test.eq(endpoint.meta.router, "app:api")
            test.eq(endpoint.data.path, "/jobs/health")
            test.is_nil((registry.get("kickside.core.jobs:api_router")))
            test.is_nil((registry.get("kickside.core.jobs.api:health.endpoint")))
            test.is_nil((registry.get("kickside.core.threads.api:health.endpoint")))
            test.is_nil((registry.get("kickside.core.threads:admin_scope")))
        end)
        test.it("anonymous requests are refused by token authentication", function()
            local response = request(nil)
            test.eq(response.status_code, 401, response.body)
        end)
        test.it("normal module members have no operator health permission", function()
            local response = request("app:health_http_members")
            test.eq(response.status_code, 403, response.body)
        end)
        test.it("scope catalog permission does not authorize instance diagnostics", function()
            local response = request("app:health_http_catalog_admins")
            test.eq(response.status_code, 403, response.body)
        end)
        test.it("wildcard operators receive jobs.health unchanged across owners", function()
            local db = assert(sql.get("app:db"))
            local ids = {}
            for _ = 1, 2 do
                local owner = uuid.v4()
                local id = assert(lifecycle.enqueue_job(db, tostring(db:type()), {
                    owner_locator = {kind = "test", id = owner}, job_type = "test.health_http",
                    job_identity = {namespace = "test", scope = owner, key = "health"},
                    slot = false, parked = true, payload = {secret = "private-payload"},
                }))
                ids[#ids + 1] = id
                assert(db:execute("UPDATE kickside_job SET last_error=$1 WHERE id=$2", {"private-worker-error", id}))
            end
            db:release()
            local ok, err = pcall(function()
                local expected = assert(jobs.health())
                local response, body = request("app:health_http_operators")
                test.eq(response.status_code, 200, response.body)
                test.is_true(body.success)
                test.eq(type(body.health.healthy), "boolean")
                test.eq(type(body.health.workers), "table")
                test.eq(type(body.health.issues), "table")
                for _, key in ipairs({"due_unclaimed_count", "overdue_unclaimed_count", "healthy_worker_count", "expired_leases"}) do
                    test.eq(type(body.health[key]), "number")
                end
                test.eq(assert(canonical_json.encode(body.health)), assert(canonical_json.encode(expected)))
                local stranded = {}
                for _, issue in ipairs(body.health.issues) do
                    if issue.code == "stranded_jobs" then
                        for _, id in ipairs(issue.job_ids) do stranded[id] = true end
                    end
                end
                for _, id in ipairs(ids) do test.is_true(stranded[id] == true) end
                test.is_nil((response.body:find("private-payload", 1, true)))
                test.is_nil((response.body:find("private-worker-error", 1, true)))
            end)
            db = assert(sql.get("app:db"))
            for _, id in ipairs(ids) do assert(db:execute("DELETE FROM kickside_job WHERE id=$1", {id})) end
            db:release()
            if not ok then error(err) end
        end)
        test.it("a failing health query returns a stable public error", function()
            local db = assert(sql.get("app:db"))
            assert(db:execute("ALTER TABLE kickside_job_worker RENAME TO health_http_unavailable"))
            db:release()
            local ok, err = pcall(function()
                local health, read_err = jobs.health()
                test.is_nil(health)
                test.not_nil(read_err)
                local response, body = request("app:health_http_operators")
                test.eq(response.status_code, 500, response.body)
                test.eq(assert(canonical_json.encode(body)), assert(canonical_json.encode({
                    success = false, error = "Jobs health is unavailable", message = "Jobs health is unavailable",
                    kind = errors.INTERNAL, retryable = false,
                })))
            end)
            db = assert(sql.get("app:db"))
            assert(db:execute("ALTER TABLE health_http_unavailable RENAME TO kickside_job_worker"))
            db:release()
            if not ok then error(err) end
        end)
    end)
end)}
