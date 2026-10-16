local test = require("test")
local oauth_repo = require("mcp_oauth_repo")
local retention = require("mcp_retention")
local repo = require("mcp_repo")
local sql = require("sql")
local uuid = require("uuid")

return test.run_cases(function()
    test.describe("MCP cleanup errors", function()
        test.it("preserves the typed failure from each retention owner", function()
            for _, stage in ipairs({ "codes", "clients", "credentials" }) do
                local code, client, credential = oauth_repo.prune_expired_codes,
                    oauth_repo.prune_idle_clients, repo.prune_retired
                local injected = errors.new({ message = "injected " .. stage,
                    kind = errors.UNAVAILABLE, retryable = true })
                oauth_repo.prune_expired_codes = function()
                    if stage == "codes" then return nil, injected end
                    return 0, nil
                end
                oauth_repo.prune_idle_clients = function()
                    if stage == "clients" then return nil, injected end
                    return 0, nil
                end
                repo.prune_retired = function()
                    if stage == "credentials" then return nil, injected end
                    return 0, nil
                end
                local result = retention.run()
                oauth_repo.prune_expired_codes, oauth_repo.prune_idle_clients, repo.prune_retired =
                    code, client, credential
                test.is_false(result.success)
                test.eq(result.error, injected)
                test.is_true(errors.is(result.error, errors.UNAVAILABLE), tostring(result.error))
                test.is_true((result.error :: any):retryable())
            end
        end)

        test.it("returns a typed principal cleanup failure", function()
            local result = repo.cleanup_principal({})
            test.is_false(result.success)
            test.is_true(errors.is(result.error, errors.INVALID), tostring(result.error))
        end)

        test.it("drains actor credentials one bounded page per principal retry", function()
            local actor_id = "mcp-page-" .. uuid.v4()
            local db = assert(sql.get("app:db"))
            for i = 1, 101 do
                local id = actor_id .. ":" .. tostring(i)
                local _, insert_err = db:execute([[INSERT INTO kickside_mcp_credentials
                    (credential_id,token_hash,token_prefix,actor_id,whitelist_json,label,status,
                     policy_json,context_json,created_at,updated_at)
                    VALUES ($1,$2,'ksmcp_page',$3,'[]','page','active','{}','{}',1,1)]],
                    { id, "hash:" .. id, actor_id })
                test.is_nil(insert_err, tostring(insert_err))
            end
            db:release()
            local first = repo.cleanup_principal({ principal_id = actor_id })
            db = assert(sql.get("app:db"))
            local rows, read_err = db:query(
                "SELECT COUNT(*) AS n FROM kickside_mcp_credentials WHERE actor_id=$1", { actor_id })
            db:release()
            local remaining = rows and rows[1] and tonumber(rows[1].n)
            local second = repo.cleanup_principal({ principal_id = actor_id })
            test.is_nil(read_err)
            test.is_false(first.success)
            test.is_true(errors.is(first.error, errors.CONFLICT), tostring(first.error))
            test.eq(remaining, 1)
            test.is_true(second.success, tostring(second.error))
        end)
    end)
end)
