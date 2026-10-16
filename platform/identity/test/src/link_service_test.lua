local test = require("test")
local sql = require("sql")
local time = require("time")
local uuid = require("uuid")
local link_service_module = require("link_service")
local unlink_response = require("unlink_response")
local link_service = link_service_module
local consts = require("identity_consts")
local agent_ref = require("agent_ref")
local component = require("component") :: any

-- Recreate the schema on the harness DB (the migration boots elsewhere) and clear
-- it between cases so each test is isolated. created_at mirrors migration 01:
-- canonical RFC3339 UTC TEXT. expires_at stays a numeric TTL value.
local function reset_db()
    local db = sql.get(consts.db_id()) :: sql.DB
    db:execute([[CREATE TABLE IF NOT EXISTS kickside_external_links (link_id TEXT NOT NULL UNIQUE, provider TEXT NOT NULL, external_id TEXT NOT NULL, user_id TEXT NOT NULL, display_name TEXT DEFAULT '', default_agent_id TEXT DEFAULT '', created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')), PRIMARY KEY (provider, external_id))]])
    db:execute([[CREATE TABLE IF NOT EXISTS kickside_link_codes (code TEXT PRIMARY KEY, user_id TEXT NOT NULL, agent_id TEXT DEFAULT '', expires_at INTEGER NOT NULL, used INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')))]])
    db:execute("DELETE FROM kickside_external_links")
    db:execute("DELETE FROM kickside_link_codes")
    db:release()
end

local function created_at_of(table_name, where_col, where_val)
    local db = sql.get(consts.db_id()) :: sql.DB
    local rows = db:query("SELECT created_at FROM " .. table_name .. " WHERE " .. where_col .. " = $1", { where_val })
    db:release()
    return rows and rows[1] and tostring(rows[1].created_at) or ""
end

local function link_agent(provider, external_id)
    local db = sql.get(consts.db_id()) :: sql.DB
    local rows = db:query("SELECT default_agent_id FROM kickside_external_links WHERE provider = $1 AND external_id = $2", { provider, external_id })
    db:release()
    return rows and rows[1] and tostring(rows[1].default_agent_id) or ""
end

local function row_count(table_name: string, user_id: string): integer
    local db = sql.get(consts.db_id()) :: sql.DB
    local rows = db:query("SELECT COUNT(*) AS cnt FROM " .. table_name .. " WHERE user_id = $1", { user_id })
    db:release()
    return math.floor(tonumber(rows and rows[1] and rows[1].cnt) or 0)
end

-- Seeds a real owned agent on the harness's component stub, so generate_code's
-- access check (component.list_for_subject) has a real component to resolve --
-- the only way to prove bare_agent_id's prefix-stripping actually changes which
-- component is looked up, not just that both forms fail alike.
local function seed_user_agent(subject_id: string): string
    local component_id: string = uuid.v7()
    component._seed(subject_id, component_id)
    return component_id
end

local function define_tests()
    test.describe("identity link_service", function()
        test.it("returns typed validation failures for missing unlink fields", function()
            for _, row in ipairs({
                { "", "discord", "external", "user_id is required" },
                { "user", "", "external", "provider is required" },
                { "user", "discord", "", "external_id is required" },
            }) do
                local ok, err = link_service.unlink(row[1], row[2], row[3])
                test.is_false(ok)
                test.not_nil(err)
                test.eq(err:kind(), errors.INVALID)
                test.eq(tostring(err), row[4])
                local status, payload = unlink_response.response_for(row[1], row[2], row[3])
                test.eq(status, 400)
                test.is_false(payload.success)
                test.eq(payload.kind, errors.INVALID)
            end
        end)
        test.it("generates a code, links an account, and resolves it", function()
            reset_db()
            local code, err = link_service.generate_code("user-1")
            test.is_nil(err)
            test.eq(#(code :: string), consts.CODE_LENGTH)
            local linked, lerr = link_service.verify_and_link(code :: string, "discord", "ext-1", "Alice")
            test.is_nil(lerr)
            test.eq(linked, "user-1")
            test.eq(link_service.resolve("discord", "ext-1"), "user-1")
            test.is_nil(link_service.resolve("discord", "ext-2"))
        end)

        test.it("keeps a stable link id for one owner and retires it after unlink and relink", function()
            reset_db()
            local first_code = link_service.generate_code("user-a") :: string
            local linked, link_err = link_service.verify_and_link(first_code, "discord", "ext-stable")
            test.is_nil(link_err)
            test.eq(linked, "user-a")
            local first = link_service.resolve_link("discord", "ext-stable") :: any
            test.is_true(type(first.link_id) == "string" and #first.link_id == 36)
            local by_id, get_err = link_service.link_get(first.link_id)
            test.is_nil(get_err)
            test.eq(by_id.link_id, first.link_id)
            test.eq(by_id.provider, "discord")
            test.eq(by_id.external_id, "ext-stable")
            test.eq(by_id.user_id, "user-a")

            local refresh_code = link_service.generate_code("user-a") :: string
            local _, refresh_err = link_service.verify_and_link(refresh_code, "discord", "ext-stable")
            test.is_nil(refresh_err)
            local refreshed = link_service.resolve_link("discord", "ext-stable") :: any
            test.eq(refreshed.link_id, first.link_id)

            local removed, remove_err = link_service.unlink("user-a", "discord", "ext-stable")
            test.is_nil(remove_err)
            test.is_true(removed)
            local stale, stale_err = link_service.link_get(first.link_id)
            test.is_nil(stale_err)
            test.is_nil(stale)

            local second_code = link_service.generate_code("user-b") :: string
            local _, second_err = link_service.verify_and_link(second_code, "discord", "ext-stable")
            test.is_nil(second_err)
            local second = link_service.resolve_link("discord", "ext-stable") :: any
            test.is_true(second.link_id ~= first.link_id)
            local new_record, new_err = link_service.link_get(second.link_id)
            test.is_nil(new_err)
            test.eq(new_record.user_id, "user-b")
        end)

        -- One canonical timestamp representation: created_at is an RFC3339 UTC
        -- string on both the link and the code rows, identical across SQLite and
        -- PostgreSQL. No unix integers, no per-DB shape.
        test.it("stores created_at as a parseable RFC3339 string on codes and links", function()
            reset_db()
            local code, err = link_service.generate_code("user-ts")
            test.is_nil(err)

            local code_ts = created_at_of("kickside_link_codes", "code", code :: string)
            test.is_true(#code_ts > 0)
            local parsed_code, perr_code = time.parse(time.RFC3339, code_ts)
            test.is_nil(perr_code)
            test.not_nil(parsed_code)

            local linked = link_service.verify_and_link(code :: string, "discord", "ext-ts", "Alice")
            test.eq(linked, "user-ts")

            local link_ts = created_at_of("kickside_external_links", "external_id", "ext-ts")
            test.is_true(#link_ts > 0)
            local parsed_link, perr_link = time.parse(time.RFC3339, link_ts)
            test.is_nil(perr_link)
            test.not_nil(parsed_link)
        end)

        test.it("accepts a lowercased code (case-insensitive)", function()
            reset_db()
            local code = link_service.generate_code("user-lc") :: string
            local linked = link_service.verify_and_link(code:lower(), "discord", "ext-lc")
            test.eq(linked, "user-lc")
        end)

        test.it("rejects an invalid or reused code", function()
            reset_db()
            local _, e1 = link_service.verify_and_link("BADCODE1", "discord", "ext-9")
            test.is_true(tostring(e1):find("invalid or expired", 1, true) ~= nil, tostring(e1))
            local code = link_service.generate_code("user-2") :: string
            link_service.verify_and_link(code, "discord", "ext-2")
            local _, e2 = link_service.verify_and_link(code, "discord", "ext-3")
            test.is_true(tostring(e2):find("invalid or expired", 1, true) ~= nil, tostring(e2))
        end)

        test.it("refuses to relink an account already owned by another user", function()
            reset_db()
            local c1 = link_service.generate_code("user-a") :: string
            link_service.verify_and_link(c1, "discord", "ext-shared")
            local c2 = link_service.generate_code("user-b") :: string
            local _, err = link_service.verify_and_link(c2, "discord", "ext-shared")
            test.is_true(tostring(err):find("already linked", 1, true) ~= nil, tostring(err))

            -- Ownership conflict rolls the code claim back with the failed link,
            -- so the same proof can still link the intended free account.
            local linked, retry_err = link_service.verify_and_link(c2, "discord", "ext-free")
            test.is_nil(retry_err)
            test.eq(linked, "user-b")
        end)

        test.it("unlinks scoped to the owner", function()
            reset_db()
            local c = link_service.generate_code("user-3") :: string
            link_service.verify_and_link(c, "discord", "ext-3")
            test.eq(link_service.resolve("discord", "ext-3"), "user-3")
            test.is_true((link_service.unlink("user-3", "discord", "ext-3")))
            test.is_nil(link_service.resolve("discord", "ext-3"))
        end)

        test.it("keeps the link retryable when conversation cleanup fails", function()
            reset_db()
            local code = link_service.generate_code("user-cleanup-fail") :: string
            link_service.verify_and_link(code, "discord", "ext-cleanup-fail")

            link_service = link_service_module.new({ channel_cleanup = {
                cleanup_conversation = function()
                    return { success = false, error = "injected cleanup failure" }, nil
                end,
            } })
            local ok, err = link_service.unlink("user-cleanup-fail", "discord", "ext-cleanup-fail")
            link_service = link_service_module

            test.is_false(ok)
            test.contains(err, "injected cleanup failure")
            test.eq(link_service.resolve("discord", "ext-cleanup-fail"), "user-cleanup-fail")
        end)

        test.it("preserves typed conversation cleanup evidence through unlink", function()
            reset_db()
            local code = link_service.generate_code("user-typed-cleanup") :: string
            link_service.verify_and_link(code, "discord", "ext-typed-cleanup")
            local pending = errors.new({ message = "conversation page pending", kind = errors.CONFLICT,
                retryable = true, details = { cleanup_pending = true,
                    discarded = { reply_uncertain = 2, unappended = 1 } } })
            link_service = link_service_module.new({ channel_cleanup = {
                cleanup_conversation = function(): (any?, any?)
                    return { success = false, error = pending }, nil
                end,
            } })
            local ok, err = link_service.unlink("user-typed-cleanup", "discord", "ext-typed-cleanup")
            link_service = link_service_module
            test.is_false(ok)
            test.is_true(errors.is(err, errors.CONFLICT), tostring(err))
            test.is_true((err :: any):details().cleanup_pending)
            test.eq((err :: any):details().discarded.reply_uncertain, 2)
            test.eq(link_service.resolve("discord", "ext-typed-cleanup"), "user-typed-cleanup")
        end)

        test.it("returns conversation discard counts after a successful unlink", function()
            reset_db()
            local code = link_service.generate_code("user-discarded-cleanup") :: string
            link_service.verify_and_link(code, "discord", "ext-discarded-cleanup")
            link_service = link_service_module.new({ channel_cleanup = {
                cleanup_conversation = function(): (any?, any?)
                    return { success = true, discarded = { reply_uncertain = 1, unappended = 3 } }, nil
                end,
            }, channel_cleanup_finalize = {
                complete_unlink = function(args: any): (any?, any?)
                    test.eq(args.provider, "discord")
                    test.eq(args.external_id, "ext-discarded-cleanup")
                    return { success = true, discarded = { reply_uncertain = 1, unappended = 3 } }, nil
                end,
            } })
            local ok, err, discarded = link_service.unlink("user-discarded-cleanup", "discord", "ext-discarded-cleanup")
            link_service = link_service_module
            test.is_true(ok)
            test.is_nil(err)
            test.eq(discarded.reply_uncertain, 1)
            test.eq(discarded.unappended, 3)
        end)

        test.it("finalizes channel-owned unlink counts after deleting the Identity link", function()
            reset_db()
            local code = link_service.generate_code("user-finalize") :: string
            link_service.verify_and_link(code, "discord", "ext-finalize")
            local finalized = 0
            link_service = link_service_module.new({
                channel_cleanup = {
                    cleanup_conversation = function(): (any?, any?)
                        return { success = true, discarded = { reply_uncertain = 1, unappended = 2 } }, nil
                    end,
                },
                channel_cleanup_finalize = {
                    complete_unlink = function(args: any): (any?, any?)
                        finalized = finalized + 1
                        test.eq(args.provider, "discord")
                        test.eq(args.external_id, "ext-finalize")
                        test.is_nil(link_service.resolve("discord", "ext-finalize"))
                        return { success = true, discarded = { reply_uncertain = 1, unappended = 2 } }, nil
                    end,
                },
            })
            local ok, err, discarded = link_service.unlink("user-finalize", "discord", "ext-finalize")
            test.is_true(ok)
            test.is_nil(err)
            test.eq(finalized, 1)
            test.eq(discarded.reply_uncertain, 1)
            test.eq(discarded.unappended, 2)
            test.is_nil(link_service.resolve("discord", "ext-finalize"))
            link_service = link_service_module
        end)

        test.it("retries Channel finalization after Identity committed unlink", function()
            reset_db()
            local code = link_service.generate_code("user-finalize-retry") :: string
            link_service.verify_and_link(code, "discord", "ext-finalize-retry")
            local finalize_calls = 0
            link_service = link_service_module.new({
                channel_cleanup = {
                    cleanup_conversation = function(): (any?, any?)
                        return { success = true, discarded = { reply_uncertain = 0, unappended = 0 } }, nil
                    end,
                },
                channel_cleanup_finalize = {
                    complete_unlink = function(): (any?, any?)
                        finalize_calls = finalize_calls + 1
                        if finalize_calls == 1 then
                            return { success = false, error = "finalize unavailable" }, nil
                        end
                        return { success = true, discarded = { reply_uncertain = 0, unappended = 0 } }, nil
                    end,
                },
            })
            local ok, err = link_service.unlink("user-finalize-retry", "discord", "ext-finalize-retry")
            test.is_false(ok)
            test.contains(tostring(err), "finalize unavailable")
            test.is_nil(link_service.resolve("discord", "ext-finalize-retry"))
            local retried, retry_err = link_service.unlink("user-finalize-retry", "discord", "ext-finalize-retry")
            test.is_true(retried)
            test.is_nil(retry_err)
            test.eq(finalize_calls, 2)
            test.is_nil(link_service.resolve("discord", "ext-finalize-retry"))
            link_service = link_service_module
        end)

        test.it("exposes typed cleanup failure and accumulated success at the HTTP boundary", function()
            local pending = errors.new({ message = "another page", kind = errors.CONFLICT,
                retryable = true, details = { cleanup_pending = true,
                    discarded = { reply_uncertain = 100, unappended = 3 } } })
            local status, failure = unlink_response.response_for("user", "discord", "external", {
                unlink = function(): (any, any) return false, pending end,
            })
            test.eq(status, 409)
            test.is_false(failure.success)
            test.eq(failure.kind, errors.CONFLICT)
            test.is_true(failure.retryable)
            test.eq(failure.details.discarded.reply_uncertain, 100)
            local complete_status, complete = unlink_response.response_for("user", "discord", "external", {
                unlink = function(): (any, any, any)
                    return true, nil, { reply_uncertain = 205, unappended = 4 }
                end,
            })
            test.eq(complete_status, 200)
            test.eq(complete.discarded.reply_uncertain, 205)
        end)

        test.it("does not clean a conversation the caller does not own", function()
            reset_db()
            local code = link_service.generate_code("actual-owner") :: string
            link_service.verify_and_link(code, "discord", "ext-owned")

            local calls = 0
            link_service = link_service_module.new({
                channel_cleanup = {
                    cleanup_conversation = function()
                        calls = calls + 1
                        return { success = true }, nil
                    end,
                },
                channel_cleanup_finalize = {
                    complete_unlink = function()
                        calls = calls + 1
                        return { success = true }, nil
                    end,
                },
            })
            local ok, err = link_service.unlink("other-user", "discord", "ext-owned")
            link_service = link_service_module

            test.is_true(ok)
            test.is_nil(err)
            test.eq(calls, 0)
            test.eq(link_service.resolve("discord", "ext-owned"), "actual-owner")
        end)

        test.it("lets Channel idempotently settle a retry with no Identity row", function()
            reset_db()
            local finalize_calls = 0
            link_service = link_service_module.new({ channel_cleanup_finalize = {
                complete_unlink = function()
                    finalize_calls = finalize_calls + 1
                    return { success = true }, nil
                end,
            } })
            local ok, err = link_service.unlink("user-no-link", "discord", "other-users-conversation")
            test.is_true(ok)
            test.is_nil(err)
            test.eq(finalize_calls, 1)
            link_service = link_service_module
        end)

        test.it("pins the greeter agent on the link and exposes it via resolve_link", function()
            reset_db()
            local code = link_service.generate_code("user-g", consts.GREETER_AGENT_ID) :: string
            local linked = link_service.verify_and_link(code, "discord", "ext-g")
            test.eq(linked, "user-g")
            test.eq(link_agent("discord", "ext-g"), consts.GREETER_AGENT_ID)
            local link = link_service.resolve_link("discord", "ext-g")
            test.eq((link or {}).user_id, "user-g")
            test.eq((link or {}).default_agent_id, consts.GREETER_AGENT_ID)
        end)

        test.it("defaults to no pinned agent when none is chosen", function()
            reset_db()
            local code = link_service.generate_code("user-n") :: string
            link_service.verify_and_link(code, "discord", "ext-n")
            test.eq(link_agent("discord", "ext-n"), "")
            local link = link_service.resolve_link("discord", "ext-n")
            test.eq((link or {}).default_agent_id, "")
        end)

        test.it("rejects pinning an agent the user can not access", function()
            reset_db()
            local _, err = link_service.generate_code("user-x", "user_agent:not-mine")
            test.is_true(tostring(err):find("not accessible", 1, true) ~= nil, tostring(err))
        end)

        -- Same rejection given the bare component id form (no "user_agent:"
        -- prefix) -- per agent_ref semantics both name the same identity, so a
        -- nonexistent agent must be rejected alike in either form.
        test.it("rejects pinning an agent the user can not access (bare id form)", function()
            reset_db()
            local _, err = link_service.generate_code("user-x", "not-mine")
            test.is_true(tostring(err):find("not accessible", 1, true) ~= nil, tostring(err))
        end)

        -- Pins a real, owned user agent using the prefixed ref and, separately,
        -- the bare component id -- both must resolve to the same accessible
        -- component, proving bare_agent_id's delegation to agent_ref actually
        -- strips the prefix (not just a no-op that happens to reject alike).
        test.it("pins a real owned agent whether given the prefixed or bare agent_id form", function()
            reset_db()
            component._reset()
            local subject_id = "user-owns-" .. uuid.v4():sub(1, 8)
            local component_id: string = seed_user_agent(subject_id)

            local code_prefixed, perr = link_service.generate_code(subject_id, agent_ref.user(component_id) :: string)
            test.is_nil(perr)
            test.not_nil(code_prefixed)

            local code_bare, berr = link_service.generate_code(subject_id, component_id)
            test.is_nil(berr)
            test.not_nil(code_bare)

            component._reset()
        end)

        test.it("caps active codes per user", function()
            reset_db()
            for _ = 1, consts.MAX_ACTIVE_CODES do
                local _, e = link_service.generate_code("user-cap")
                test.is_nil(e)
            end
            local _, err = link_service.generate_code("user-cap")
            test.is_true(tostring(err):find("too many active", 1, true) ~= nil, tostring(err))
        end)

        test.it("principal cleanup removes external links and pending link codes", function()
            reset_db()
            local code = link_service.generate_code("user-clean") :: string
            local pending = link_service.generate_code("user-clean") :: string
            link_service.verify_and_link(code, "discord", "ext-clean")
            test.not_nil(pending)
            test.eq(row_count("kickside_external_links", "user-clean"), 1)
            test.eq(row_count("kickside_link_codes", "user-clean"), 2)

            local result = link_service.cleanup_principal({ user_id = "user-clean" })
            test.eq((result :: any).success, true)
            test.eq(row_count("kickside_external_links", "user-clean"), 0)
            test.eq(row_count("kickside_link_codes", "user-clean"), 0)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
