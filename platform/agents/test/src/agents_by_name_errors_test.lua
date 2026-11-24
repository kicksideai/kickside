-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local lookup = require("agents_by_name")
local dependency = require("dependency")

local USER_AGENT_IMPL = "kickside.agents:user_agent"
local PUBLIC = {
    id = "app:public_agent",
    meta = { type = "agent.gen1", public = true, name = "public_agent", title = "Public Agent" },
    data = { start_prompts = { "Hello" } },
}

local function failure(kind: string, message: string): any
    return errors.new({ kind = kind, message = message })
end

local function registry_double(get: any?, find: any?): any
    return {
        get = get or function() return nil, failure(errors.NOT_FOUND, "entry not found") end,
        find = find or function() return {}, nil end,
    }
end

local function component_double(access_err: any?, service: any?, service_err: any?): any
    return {
        ACCESS = dependency.ACCESS,
        validate_access = function()
            if access_err then return 0, access_err end
            return 1, nil
        end,
        get_service = function() return service, service_err end,
    }
end

local function service_returning(result: any, err: any?): any
    return { get = function() return result, err end }
end

local function details(deps: any, agent: string): (any, any)
    return lookup.new(deps).describe_agent(agent)
end

-- Calls the GET /agents/details handler with a fake request and response and
-- returns what it wrote.
local function call_route(deps: any, query: any, signed_in: boolean?): any
    local sent: any = {}
    local req = { query = function(_, key) return query[key] end }
    local res = {
        set_header = function() end,
        set_content_type = function() end,
        set_status = function(_, status) sent.status = status end,
        write_json = function(_, body) sent.body = body end,
        write = function(_, text) sent.text = text end,
    }
    deps.http = {
        STATUS = { OK = 200, BAD_REQUEST = 400, UNAUTHORIZED = 401, NOT_FOUND = 404, INTERNAL_ERROR = 500 },
        CONTENT = { JSON = "application/json" },
        request = function() return req end,
        response = function() return res end,
    }
    deps.security = { actor = function() if signed_in == false then return nil end return {} end }
    lookup.new(deps).details()
    return sent
end

local function define_tests()
    test.describe("agent details lookup errors", function()
        test.it("returns the agent when the lookup works", function()
            local registry_agent, registry_err = details({ registry = registry_double(function() return PUBLIC, nil end) }, PUBLIC.id)
            test.is_nil(registry_err, tostring(registry_err))
            test.eq(registry_agent.id, PUBLIC.id)
            test.eq(registry_agent.start_prompts[1], "Hello")

            local service = service_returning({ success = true, impl_id = USER_AGENT_IMPL, meta = { title = "Mine" } })
            local user_agent, user_err = details({ component = component_double(nil, service) }, "user_agent:c1")
            test.is_nil(user_err, tostring(user_err))
            test.eq(user_agent.title, "Mine")
        end)

        test.it("returns no agent for a missing or denied registry entry", function()
            for _, kind in ipairs({ errors.NOT_FOUND, errors.PERMISSION_DENIED }) do
                local by_id, id_err = details({ registry = registry_double(function() return nil, failure(kind, "x") end) }, "app:x")
                test.is_nil(id_err, kind .. ": " .. tostring(id_err))
                test.is_nil(by_id, kind)
                local by_name, name_err = details({ registry = registry_double(nil, function() return nil, failure(kind, "x") end) }, "x")
                test.is_nil(name_err, kind .. ": " .. tostring(name_err))
                test.is_nil(by_name, kind)
            end
        end)

        test.it("returns a registry failure as an error", function()
            local by_id, id_err = details({ registry = registry_double(function() return nil, failure(errors.INTERNAL, "registry is down") end) }, "app:x")
            test.is_nil(by_id)
            test.is_true(errors.is(id_err, errors.INTERNAL), tostring(id_err))
            test.contains(tostring(id_err), "registry is down")

            local by_name, name_err = details({ registry = registry_double(nil, function() return nil, failure(errors.UNAVAILABLE, "find failed") end) }, "x")
            test.is_nil(by_name)
            test.is_true(errors.is(name_err, errors.UNAVAILABLE), tostring(name_err))
        end)

        test.it("returns no agent for a missing or denied user agent", function()
            for _, kind in ipairs({ errors.NOT_FOUND, errors.PERMISSION_DENIED }) do
                local agent, err = details({ component = component_double(failure(kind, "x")) }, "user_agent:c1")
                test.is_nil(err, kind .. ": " .. tostring(err))
                test.is_nil(agent, kind)
            end
            -- A component deleted between the access check and the read. The
            -- real get binding answers it with PERMISSION_DENIED, so its
            -- existence stays hidden.
            for _, kind in ipairs({ errors.NOT_FOUND, errors.PERMISSION_DENIED }) do
                local gone = service_returning({ success = false, kind = kind, error = "Component not found or access denied" })
                local agent, err = details({ component = component_double(nil, gone) }, "user_agent:c1")
                test.is_nil(err, kind .. ": " .. tostring(err))
                test.is_nil(agent, kind)
            end
        end)

        test.it("returns a component failure as an error", function()
            local access_agent, access_err = details({ component = component_double(failure(errors.INTERNAL, "access check failed")) }, "user_agent:c1")
            test.is_nil(access_agent)
            test.is_true(errors.is(access_err, errors.INTERNAL), tostring(access_err))

            local service_agent, service_err = details({ component = component_double(nil, nil, failure(errors.UNAVAILABLE, "no service")) }, "user_agent:c1")
            test.is_nil(service_agent)
            test.is_true(errors.is(service_err, errors.UNAVAILABLE), tostring(service_err))

            local broken = service_returning({ success = false, kind = errors.INTERNAL, error = "database is down" })
            local read_agent, read_err = details({ component = component_double(nil, broken) }, "user_agent:c1")
            test.is_nil(read_agent)
            test.is_true(errors.is(read_err, errors.INTERNAL), tostring(read_err))
            test.contains(tostring(read_err), "database is down")

            local call_agent, call_err = details({ component = component_double(nil, service_returning(nil, failure(errors.TIMEOUT, "slow"))) }, "user_agent:c1")
            test.is_nil(call_agent)
            test.is_true(errors.is(call_err, errors.TIMEOUT), tostring(call_err))
        end)

        test.it("returns an error for start prompts that are not a list of strings", function()
            local holey: any = { "a", "b", "c", x = "d" }
            holey[2] = nil
            local bad_prompts: {any} = { "Hello", { "Hello", 3 }, { [1] = "a", [3] = "b" }, { first = "a" }, holey }
            for index, prompts in ipairs(bad_prompts) do
                local entry = { id = PUBLIC.id, meta = PUBLIC.meta, data = { start_prompts = prompts } }
                local agent, err = details({ registry = registry_double(function() return entry, nil end) }, PUBLIC.id)
                test.is_nil(agent, "case " .. index)
                test.is_true(errors.is(err, errors.INTERNAL), "case " .. index .. ": " .. tostring(err))
                test.contains(tostring(err), PUBLIC.id)
            end

            local kept_entry = { id = PUBLIC.id, meta = PUBLIC.meta, data = { start_prompts = { "Hello", "", "Bye" } } }
            local kept, kept_err = details({ registry = registry_double(function() return kept_entry, nil end) }, PUBLIC.id)
            test.is_nil(kept_err, tostring(kept_err))
            test.eq(#kept.start_prompts, 2)
            test.eq(kept.start_prompts[2], "Bye")
        end)

        test.it("returns an error for a user agent without a title", function()
            local bad_metas: {any} = { {}, { title = "" }, { title = 5 }, "Mine" }
            for index, meta in ipairs(bad_metas) do
                local service = service_returning({ success = true, impl_id = USER_AGENT_IMPL, meta = meta })
                local agent, err = details({ component = component_double(nil, service) }, "user_agent:c1")
                test.is_nil(agent, "case " .. index)
                test.is_true(errors.is(err, errors.INTERNAL), "case " .. index .. ": " .. tostring(err))
                test.contains(tostring(err), "user_agent:c1 has no title")
            end

            -- A component of another kind is no agent, with or without a title.
            local other = service_returning({ success = true, impl_id = "kickside.test:not_agent", meta = {} })
            local not_agent, not_agent_err = details({ component = component_double(nil, other) }, "user_agent:c1")
            test.is_nil(not_agent_err, tostring(not_agent_err))
            test.is_nil(not_agent)
        end)

        test.it("answers the details route with 500 and the cause for a failed lookup", function()
            local failed = call_route({ registry = registry_double(function() return nil, failure(errors.INTERNAL, "registry is down") end) }, { agent = "app:x" })
            test.eq(failed.status, 500)
            test.eq(failed.body.success, false)
            test.contains(tostring(failed.body.error), "registry is down")

            local untitled = service_returning({ success = true, impl_id = USER_AGENT_IMPL, meta = { title = "" } })
            local bad = call_route({ component = component_double(nil, untitled) }, { agent = "user_agent:c1" })
            test.eq(bad.status, 500)
            test.contains(tostring(bad.body.error), "user_agent:c1 has no title")
        end)

        test.it("answers the details route with agent null for an unknown or hidden agent", function()
            for _, kind in ipairs({ errors.NOT_FOUND, errors.PERMISSION_DENIED }) do
                local sent = call_route({ registry = registry_double(function() return nil, failure(kind, "x") end) }, { agent = "app:x" })
                test.eq(sent.status, 200, kind)
                test.eq(sent.text, '{"success":true,"agent":null}', kind)
                test.is_nil(sent.body, kind)
            end
            -- A registry agent that is not public is hidden the same way.
            local private_entry = { id = "app:private_agent", meta = { type = "agent.gen1", private = true }, data = {} }
            local hidden = call_route({ registry = registry_double(function() return private_entry, nil end) }, { agent = private_entry.id })
            test.eq(hidden.status, 200)
            test.eq(hidden.text, '{"success":true,"agent":null}')
        end)

        test.it("answers the details route with the agent, 400 or 401 as before", function()
            local found = call_route({ registry = registry_double(function() return PUBLIC, nil end) }, { agent = PUBLIC.id })
            test.eq(found.status, 200)
            test.eq(found.body.agent.id, PUBLIC.id)
            test.eq(found.body.agent.start_prompts[1], "Hello")

            test.eq(call_route({}, {}).status, 400)
            test.eq(call_route({}, { agent = "" }).status, 400)
            test.eq(call_route({}, { agent = PUBLIC.id }, false).status, 401)
        end)

        test.it("leaves a failing agent out of agents/by-name and resolves the others", function()
            local registry = registry_double(function(id)
                if id == "app:broken" then return nil, failure(errors.INTERNAL, "broken entry") end
                return PUBLIC, nil
            end)
            local untitled = service_returning({ success = true, impl_id = USER_AGENT_IMPL, meta = { title = "" } })
            local titles = lookup.new({ registry = registry, component = component_double(nil, untitled) })
                .resolve_identifiers({ "app:broken", "user_agent:c1", PUBLIC.id })
            test.is_nil(titles["app:broken"])
            test.is_nil(titles["user_agent:c1"])
            test.eq(titles[PUBLIC.id], "Public Agent")
        end)
    end)
end

return { run = test.run_cases(define_tests) }
