-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local uuid = require("uuid")
local sql = require("sql")
local security = require("security")
local contract = require("contract")
local funcs = require("funcs")
local http_client = require("http_client")
local system = require("system")
local json = require("json")
local process = require("process")
local channel = require("channel")
local time = require("time")
local notify = require("notify")
local provision = require("provision")
local autoinit = require("autoinit")
local crud = require("crud")

local OWNER = "event-read-admin"
local READER = "event-read-reader"
local WRITER = "event-read-writer"
local ADMIN = "event-read-only-admin"
local ids: { string } = {}

local function scope()
    return assert(security.named_scope("wippy.security:process"))
end
local function actor(id: string)
    return security.new_actor(id, {security_groups = {}})
end
local function service(name: string, id: string)
    return assert(assert(contract.get(name)):with_actor(actor(id)):with_scope(scope()):open())
end
local function threads(id: string)
    return service("kickside.core:threads", id)
end
local function call(id: string, target: string, args: table)
    return funcs.new():with_actor(actor(id)):with_scope(scope()):call(target, args)
end
local function fixture(kind: string): string
    local created, err = threads(OWNER):create({id = uuid.v4(), impl_id = kind})
    test.is_nil(err)
    local id = created.thread_id
    ids[#ids + 1] = id
    for _, grant in ipairs({{id = READER, mask = 1}, {id = WRITER, mask = 3}, {id = ADMIN, mask = 8}}) do
        local _, grant_err = service("kickside.component:component_service", OWNER):grant_subtree({
            root_component_id = id, subject = {subject_type = "user", subject_id = grant.id}, access_mask = grant.mask,
        })
        test.is_nil(grant_err)
    end
    local _, append_err = threads(OWNER):append_event({thread_id = id, event = {
        type = "kickside.threads:message.created", body = {text = "authoritative"},
        external = {external_source = "actor:" .. OWNER, external_id = "source"},
    }})
    test.is_nil(append_err)
    return id
end
local function http(id: string, user: string, path: string?, method: string?, body: table?)
    local gateway = assert(system.supervisor.state("app:gateway"))
    local port = assert(gateway.details:match(":(%d+)$"))
    local response, err = http_client.request(method or "GET", "http://127.0.0.1:" .. port
        .. "/api/event-read/" .. user .. "/" .. id .. (path or "/events"), {
            headers = {["Content-Type"] = "application/json"}, body = body and assert(json.encode(body)) or nil,
        })
    test.is_nil(err)
    local decoded, decode_err = json.decode(assert(response.body))
    test.is_nil(decode_err, tostring(response.status_code) .. ": " .. response.body)
    return response.status_code, decoded
end
local function denied(value: table?, err: error?)
    test.is_nil(value)
    test.not_nil(err)
    test.is_true(errors.is(err, errors.PERMISSION_DENIED))
end
local routes = {
    {name = "contract", read = function(id: string, user: string)
        return threads(user):list_events({thread_id = id})
    end},
    {name = "external identity", read = function(id: string, user: string)
        return threads(user):find_event_by_external({thread_id = id, event_type = "kickside.threads:message.created",
            external_source = "actor:" .. OWNER, external_id = "source"})
    end},
    {name = "pullable", read = function(id: string, user: string)
        return call(user, "kickside.core.threads:events_pullable", {config = {thread_id = id}, cursor = 0, limit = 10, idempotency_key = "read"})
    end},
}
local function execute(query: string, args: table)
    local db = assert(sql.get("app:db"))
    local _, err = db:execute(query, args)
    db:release()
    test.is_nil(err)
end
local function stored_level(id: string): string
    local db = assert(sql.get("app:db"))
    local rows = assert(db:query("SELECT event_read FROM kickside_thread WHERE id=$1", {id}))
    db:release()
    return rows[1].event_read
end
local function realtime(id: string): (table?, error?, table?)
    local topic = "event-read-" .. uuid.v4()
    local mailbox = assert(process.listen(topic))
    local hub = "user." .. OWNER
    local _, register_err = process.registry.register(hub)
    test.is_nil(register_err)
    local result, err = call(OWNER, "kickside.core.threads:emit_update", {
        thread_id = id, topic = topic, event = {body = {secret = true}},
        data = {secret = true}, thread = {secret = true},
    })
    local selected = channel.select({mailbox:case_receive(), time.after("1s"):case_receive()})
    process.registry.unregister(hub)
    process.unlisten(mailbox)
    return result, err, selected.channel == mailbox and selected.value or nil
end
return {run = test.run_cases(function()
    test.describe("Thread event read access", function()
        test.after_all(function()
            for _, id in ipairs(ids) do
                local _, err = threads(OWNER):delete({thread_id = id})
                test.is_nil(err)
            end
        end)
        for _, route in ipairs(routes) do
            test.it(route.name .. " denies READ and permits ADMIN on declared kinds", function()
                local id = fixture("event.read.test:admin_kind")
                local value, err = route.read(id, READER)
                if route.name == "pullable" then
                    test.is_nil(err)
                    test.is_false(value.success)
                    test.eq(value.error.kind, errors.PERMISSION_DENIED)
                else denied(value, err) end
                for _, user in ipairs({OWNER, ADMIN}) do
                    value, err = route.read(id, user)
                    test.is_nil(err)
                    test.not_nil(value)
                    if route.name == "pullable" then test.is_true(value.success); test.eq(value.items[1].payload.text, "authoritative")
                    elseif route.name == "contract" then test.eq(#value.events, 1)
                    else test.eq(json.decode(value.event.body).text, "authoritative") end
                end
            end)
            for _, kind in ipairs({"event.read.test:public_kind", "kickside.core:thread"}) do
                test.it(route.name .. " keeps READ for " .. kind, function()
                    local id = fixture(kind)
                    local value, err = route.read(id, READER)
                    test.is_nil(err)
                    test.not_nil(value)
                    if route.name == "pullable" then test.is_true(value.success) end
                    value, err = route.read(id, ADMIN)
                    if route.name == "pullable" then
                        test.is_nil(err); test.is_false(value.success); test.eq(value.error.kind, errors.PERMISSION_DENIED)
                    else denied(value, err) end
                end)
            end
        end
        test.it("unregistered stored kinds keep READ across every event and projection reader", function()
            local id = fixture("event.read.test:public_kind")
            local _, register_err = threads(OWNER):register_projection({thread_id = id, kind = "count",
                worker_ref = "func://app:test_count_worker", debounce_idle_ms = 600000, debounce_max_ms = 600000})
            test.is_nil(register_err)
            execute("UPDATE kickside_components SET impl_id=$1 WHERE component_id=$2", {"event.read.test:retired_kind", id})
            for _, route in ipairs(routes) do
                local value, err = route.read(id, READER)
                test.is_nil(err); test.not_nil(value)
                if route.name == "pullable" then
                    test.is_true(value.success); test.eq(value.items[1].payload.text, "authoritative")
                elseif route.name == "contract" then test.eq(json.decode(value.events[1].body).text, "authoritative")
                else test.eq(json.decode(value.event.body).text, "authoritative") end
            end
            local status, body = http(id, "reader")
            test.eq(status, 200); test.eq(json.decode(body.events[1].body).text, "authoritative")
            local value, err = threads(READER):list_projections({thread_id = id})
            test.is_nil(err); test.eq(#value.projections, 1)
            value, err = threads(READER):get_projection_cursor({thread_id = id, kind = "count"})
            test.is_nil(err); test.not_nil(value.projection.body)
            value, err = service("kickside.core:read_models", READER):get({owner_id = id, kind = "count"})
            test.is_nil(err); test.not_nil(value.body)
            status, body = http(id, "reader", "/projections")
            test.eq(status, 200); test.eq(#body.projections, 1)
            value, err = threads(OWNER):append_event({thread_id = id,
                event = {type = "kickside.threads:message.created", body = {text = "refused"}}})
            test.is_nil(value); test.is_true(errors.is(err, errors.INVALID))
            test.eq(err:details().code, "thread_event_invalid")
            local page, read_err = threads(READER):list_events({thread_id = id})
            test.is_nil(read_err); test.eq(#page.events, 1)
        end)
        test.it("unregistered stored kinds deliver realtime bodies", function()
            local id = fixture("event.read.test:public_kind")
            execute("UPDATE kickside_components SET impl_id=$1 WHERE component_id=$2", {"event.read.test:retired_kind", id})
            local result, err, message = realtime(id)
            test.is_nil(err); test.not_nil(result); test.not_nil(message)
            test.is_true(message.event.body.secret); test.is_true(message.data.secret); test.is_true(message.thread.secret)
        end)
        for _, component_id in ipairs({"", uuid.v4(), "legacy-text-component"}) do
            test.it("realtime retains bodies for a component link/" .. (component_id == "" and "empty"
                or (component_id == "legacy-text-component" and "legacy text" or "absent UUID")), function()
                local id = uuid.v4()
                execute("INSERT INTO kickside_thread(id,component_id,attrs) VALUES($1,$2,$3)",
                    {id, component_id, assert(json.encode({user_ids = {OWNER}}))})
                local result, err, message = realtime(id)
                execute("DELETE FROM kickside_thread WHERE id=$1", {id})
                test.is_nil(err); test.not_nil(result); test.not_nil(message)
                test.is_true(message.event.body.secret); test.is_true(message.data.secret); test.is_true(message.thread.secret)
            end)
        end
        test.it("realtime strips bodies when thread and component ids differ", function()
            local id = fixture("event.read.test:public_kind")
            local component_id = fixture("event.read.test:admin_kind")
            -- This fixture constructs a thread whose component id differs from its id.
            execute("UPDATE kickside_thread SET component_id=$1,event_read=$2 WHERE id=$3", {component_id, "admin", id})
            local result, err, message = realtime(id)
            execute("UPDATE kickside_thread SET component_id=$1,event_read=$2 WHERE id=$1", {id, ""})
            test.is_nil(err); test.not_nil(result); test.not_nil(message)
            test.is_nil(message.event); test.is_nil(message.data); test.is_nil(message.thread)
        end)
        test.it("realtime loads the stored level once across recipients and topics", function()
            local reads, sends = 0, 0
            local instance = notify.new({
                load_thread = function(_thread_id: string): (table?, error?)
                    reads = reads + 1
                    return {attrs = {user_ids = {OWNER, READER}}, event_read = ""}, nil
                end,
                lookup = function(name: string): (any?, error?) return name, nil end,
                send = function(_pid: any, _topic: string, message: any): (any?, error?)
                    sends = sends + 1
                    test.eq(message.event.body.text, "authoritative")
                    return true, nil
                end,
            })
            local result, err = instance.emit_thread_update({thread_id = uuid.v4(), event = {body = {text = "authoritative"}}})
            test.is_nil(err); test.eq(reads, 1)
            test.eq(result.recipients, 2); test.eq(sends, result.topic_count * 2)
        end)
        test.it("HTTP GET events enforces the stored declaration", function()
            local id = fixture("event.read.test:admin_kind")
            local status, body = http(id, "reader")
            test.eq(status, 403); test.is_false(body.success); test.is_nil(body.events)
            status, body = http(id, "admin")
            test.eq(status, 200); test.eq(#body.events, 1)
            id = fixture("event.read.test:public_kind")
            status, body = http(id, "reader")
            test.eq(status, 200); test.eq(#body.events, 1)
        end)
        test.it("message response listing enforces event access after the write", function()
            local id = fixture("event.read.test:admin_kind")
            local status, body = http(id, "writer", "/messages", "POST", {text = "appended"})
            test.eq(status, 403); test.is_nil(body.event)
            test.is_false(body.retryable)
            local page, err = threads(OWNER):list_events({thread_id = id})
            test.is_nil(err); test.eq(#page.events, 2)
        end)
        test.it("metadata reads stay available to READ holders", function()
            local id = fixture("event.read.test:admin_kind")
            for _, method in ipairs({"find", "list_children", "list_edges"}) do
                local value, err = threads(READER)[method](threads(READER), {thread_id = id})
                test.is_nil(err); test.not_nil(value); test.is_nil(value.events); test.is_nil(value.body)
            end
            local value, err = threads(READER):list({})
            test.is_nil(err); test.not_nil(value)
        end)
        test.it("thread responses keep the stored level internal", function()
            local id = fixture("event.read.test:admin_kind")
            local value, err = threads(READER):find({thread_id = id})
            test.is_nil(err); test.is_nil(value.event_read)
            value, err = threads(READER):list({})
            test.is_nil(err)
            for _, row in ipairs(value.threads) do test.is_nil(row.event_read) end
            value, err = threads(OWNER):update({thread_id = id, state = "open"})
            test.is_nil(err); test.is_nil(value.thread.event_read)
            test.eq(stored_level(id), "admin")
        end)
        test.it("projection body reads honour event access", function()
            local id = fixture("event.read.test:admin_kind")
            local _, err = threads(OWNER):register_projection({thread_id = id, kind = "count",
                worker_ref = "func://app:test_count_worker", debounce_idle_ms = 600000, debounce_max_ms = 600000})
            test.is_nil(err)
            local value, read_err = threads(READER):list_projections({thread_id = id})
            denied(value, read_err)
            value, read_err = threads(READER):get_projection_cursor({thread_id = id, kind = "count"})
            denied(value, read_err)
            value, read_err = service("kickside.core:read_models", READER):get({owner_id = id, kind = "count"})
            denied(value, read_err)
            value, read_err = service("kickside.core:read_models", OWNER):get({owner_id = id, kind = "count"})
            test.is_nil(read_err); test.not_nil(value.body)
            value, read_err = service("kickside.core:read_models", ADMIN):get({owner_id = id, kind = "count"})
            denied(value, read_err)
            for _, user in ipairs({OWNER, ADMIN}) do
                value, read_err = threads(user):list_projections({thread_id = id})
                test.is_nil(read_err); test.eq(#value.projections, 1)
                value, read_err = threads(user):get_projection_cursor({thread_id = id, kind = "count"})
                test.is_nil(read_err); test.not_nil(value.projection.body)
            end
            local status, body = http(id, "reader", "/projections")
            test.eq(status, 403); test.is_nil(body.projections)
            status, body = http(id, "admin", "/projections")
            test.eq(status, 200); test.eq(#body.projections, 1)
        end)
        test.it("realtime keeps restricted event bodies behind refetch", function()
            for _, kind in ipairs({"admin_kind", "public_kind"}) do
                local id = fixture("event.read.test:" .. kind)
                local topic = "event-read-" .. uuid.v4()
                local mailbox = assert(process.listen(topic))
                local hub = "user." .. OWNER
                local _, register_err = process.registry.register(hub)
                test.is_nil(register_err)
                local result, err = call(OWNER, "kickside.core.threads:emit_update", {
                    thread_id = id, topic = topic, event = {body = {secret = true}},
                    data = {secret = true}, thread = {secret = true},
                })
                local selected = channel.select({mailbox:case_receive(), time.after("1s"):case_receive()})
                process.registry.unregister(hub)
                process.unlisten(mailbox)
                test.is_nil(err); test.not_nil(result)
                test.eq(selected.channel, mailbox)
                if kind == "admin_kind" then
                    test.is_nil(selected.value.event); test.is_nil(selected.value.data); test.is_nil(selected.value.thread)
                else test.is_true(selected.value.event.body.secret); test.is_true(selected.value.data.secret) end
            end
        end)
        test.it("drop notifications contain subscriber declarations and follow the target read policy", function()
            for _, kind in ipairs({"public_kind", "admin_kind"}) do
                local source = fixture("event.read.test:admin_kind")
                local target = fixture("event.read.test:" .. kind)
                local _, register_err = threads(OWNER):register_projection({thread_id = source, kind = "count",
                    worker_ref = "func://app:test_count_worker",
                    drop_notify = {thread_id = target, type = "kickside.threads:message.created", body = {reason = "dropped"}}})
                test.is_nil(register_err)
                local _, delete_err = threads(OWNER):delete({thread_id = source})
                test.is_nil(delete_err)
                for index, id in ipairs(ids) do if id == source then table.remove(ids, index); break end end
                local value, err = threads(READER):list_events({thread_id = target})
                if kind == "admin_kind" then denied(value, err)
                else
                    test.is_nil(err)
                    local body = assert(json.decode(value.events[1].body))
                    test.eq(body.reason, "dropped"); test.eq(body.source_thread_id, source); test.is_nil(body.text)
                end
            end
        end)
        test.it("binding an unregistered kind stores an empty level", function()
            local value, err = threads(OWNER):create({id = uuid.v4(), impl_id = "event.read.test:missing_kind"})
            test.is_nil(err); test.not_nil(value)
            ids[#ids + 1] = value.thread_id
            test.eq(stored_level(value.thread_id), "")
            test.is_nil(value.thread.event_read)
        end)
        test.it("a binding with an absent event block keeps READ", function()
            local created, create_err = threads(OWNER):create({id = uuid.v4(), impl_id = "event.read.test:empty_kind"})
            test.is_nil(create_err)
            local id = created.thread_id
            ids[#ids + 1] = id
            local _, grant_err = service("kickside.component:component_service", OWNER):grant_subtree({
                root_component_id = id, subject = {subject_type = "user", subject_id = READER}, access_mask = 1})
            test.is_nil(grant_err)
            local value, err = threads(READER):list_events({thread_id = id})
            test.is_nil(err); test.eq(#value.events, 0)
        end)
        test.it("implementation entries with an absent declaration keep READ", function()
            local id = uuid.v4()
            local _, register_err = service("kickside.component:component_service", OWNER):register({
                component_id = id, impl_id = "event.read.test:legacy_impl"})
            test.is_nil(register_err)
            local _, ensure_err = threads(OWNER):ensure_thread({component_id = id, impl_id = "event.read.test:empty_kind"})
            test.is_nil(ensure_err)
            ids[#ids + 1] = id
            local _, grant_err = service("kickside.component:component_service", OWNER):grant_subtree({
                root_component_id = id, subject = {subject_type = "user", subject_id = READER}, access_mask = 1})
            test.is_nil(grant_err)
            local page, err = threads(READER):list_events({thread_id = id})
            test.is_nil(err); test.eq(#page.events, 0)
        end)
        test.it("an undeclared kind keeps the component access refusal for a restricted READ holder", function()
            local id = fixture("event.read.test:public_kind")
            local restricted = assert(security.new_scope({assert(security.policy("event.read.test:reader_scope")),
                assert(security.policy("event.read.test:reader_config"))}))
            test.is_true(restricted:evaluate(actor(READER), "registry.get", "event.read.test:public_kind") ~= "allow")
            local executor = funcs.new():with_actor(actor(READER)):with_scope(restricted)
            local base, base_err = executor:call("event.read.test:component_read_access", {component_id = id})
            test.is_nil(base_err); test.is_false(base.success)
            test.eq(base.kind, errors.PERMISSION_DENIED)
            local value, err = assert(assert(contract.get("kickside.core:threads"))
                :with_actor(actor(READER)):with_scope(restricted):open()):list_events({thread_id = id})
            denied(value, err)
            test.eq(err:kind(), base.kind)
        end)
        for _, kind in ipairs({"invalid_kind", "false_kind", "number_kind"}) do
            test.it("binding refuses an invalid read declaration/" .. kind, function()
                local id = uuid.v4()
                local value, err = threads(OWNER):create({id = id, impl_id = "event.read.test:" .. kind})
                test.is_nil(value); test.is_true(errors.is(err, errors.INVALID))
                test.eq(err:details().code, "thread_event_invalid")
                local db = assert(sql.get("app:db"))
                local rows = assert(db:query("SELECT id FROM kickside_thread WHERE id=$1", {id}))
                db:release()
                test.eq(#rows, 0)
            end)
        end
        test.it("read models authorize the stored component when a restricted owner differs", function()
            local id = fixture("event.read.test:public_kind")
            local target = fixture("event.read.test:admin_kind")
            local _, grant_err = service("kickside.component:component_service", OWNER):grant_subtree({
                root_component_id = target, subject = {subject_type = "user", subject_id = WRITER}, access_mask = 9})
            test.is_nil(grant_err)
            local _, projection_err = threads(OWNER):register_projection({thread_id = id, kind = "count",
                worker_ref = "func://app:test_count_worker", debounce_idle_ms = 600000, debounce_max_ms = 600000})
            test.is_nil(projection_err)
            -- This fixture constructs a thread whose component id differs from its id.
            execute("UPDATE kickside_thread SET component_id=$1,event_read=$2 WHERE id=$3", {target, "admin", id})
            local value, err = service("kickside.core:read_models", WRITER):get({owner_id = id, kind = "count"})
            test.is_nil(err); test.not_nil(value.body)
            value, err = service("kickside.core:read_models", READER):get({owner_id = id, kind = "count"})
            denied(value, err)
            execute("UPDATE kickside_thread SET component_id=$1,event_read=$2 WHERE id=$1", {id, ""})
        end)
        test.it("a pre-existing empty level keeps READ after its kind adopts admin", function()
            local id = fixture("event.read.test:public_kind")
            execute("UPDATE kickside_components SET impl_id=$1 WHERE component_id=$2", {"event.read.test:admin_kind", id})
            test.eq(stored_level(id), "")
            for _, route in ipairs(routes) do
                local value, err = route.read(id, READER)
                test.is_nil(err); test.not_nil(value)
                if route.name == "pullable" then test.is_true(value.success) end
            end
            local status, body = http(id, "reader")
            test.eq(status, 200); test.eq(#body.events, 1)
            local result, err, message = realtime(id)
            test.is_nil(err); test.not_nil(result); test.is_true(message.event.body.secret)
        end)
        test.it("existing-component attach uses the stored kind instead of supplied attrs or kind", function()
            local id = uuid.v4()
            local value, err = service("kickside.component:component_service", OWNER):register({
                component_id = id, impl_id = "event.read.test:admin_kind"})
            test.is_nil(err); test.is_true(value.success)
            value, err = threads(OWNER):ensure_thread({component_id = id, impl_id = "event.read.test:public_kind",
                event_read = "", attrs = {event_read = ""}})
            test.is_nil(err); test.not_nil(value)
            ids[#ids + 1] = id
            test.eq(stored_level(id), "admin")
        end)
        for _, mode in ipairs({"maintenance", "trusted_audit"}) do
            for _, stored in ipairs({"admin_kind", "missing_kind"}) do
                test.it(mode .. " attachment binds its authoritative kind/" .. stored, function()
                    local supplied = stored == "admin_kind" and "missing_kind" or "admin_kind"
                    local id = uuid.v4()
                    local value, err = service("kickside.component:component_service", OWNER):register({
                        component_id = id, impl_id = "event.read.test:" .. stored})
                    test.is_nil(err); test.is_true(value.success)
                    ids[#ids + 1] = id
                    local db = assert(sql.get("app:db"))
                    value, err = crud.create(db, {component_id = id, impl_id = "event.read.test:" .. supplied,
                        trusted_audit = mode == "trusted_audit"}, OWNER, {system = true}, nil,
                        mode == "maintenance")
                    test.is_nil(select(2, db:release()))
                    test.is_nil(err); test.eq(value.thread.id, id)
                    local kind = mode == "trusted_audit" and supplied or stored
                    test.eq(stored_level(id), kind == "admin_kind" and "admin" or "")
                end)
            end
        end
        for _, natural in ipairs({false, true}) do
            test.it("upsert binds the declared level/" .. tostring(natural), function()
                local args = {impl_id = "event.read.test:admin_kind", thread_id = uuid.v4()}
                if natural then
                    args = {impl_id = "event.read.test:admin_kind", thread_class = "event-read-natural", external_ref = uuid.v4()}
                end
                local value, err = threads(OWNER):upsert(args)
                test.is_nil(err); test.not_nil(value)
                ids[#ids + 1] = value.thread_id
                test.eq(stored_level(value.thread_id), "admin")
                local repeated, repeat_err = threads(OWNER):upsert(args)
                test.is_nil(repeat_err); test.eq(repeated.thread_id, value.thread_id)
                test.eq(stored_level(value.thread_id), "admin")
            end)
        end
        test.it("provision stores the declared admin level", function()
            local provisioned, err = provision.ensure_user(actor(OWNER), scope(), OWNER)
            test.is_nil(err)
            local expected = autoinit.component_id(OWNER, "event_read_provision")
            local found = false
            for _, id in ipairs(provisioned) do
                ids[#ids + 1] = id
                if id == expected then found = true end
            end
            test.is_true(found)
            test.eq(stored_level(expected), "admin")
            local repeated, repeat_err = provision.ensure_user(actor(OWNER), scope(), OWNER)
            test.is_nil(repeat_err); test.eq(#repeated, #provisioned)
            test.eq(stored_level(expected), "admin")
        end)
        test.it("PATCH and update preserve the bound level through attrs", function()
            for _, kind in ipairs({"public_kind", "admin_kind"}) do
                local id = fixture("event.read.test:" .. kind)
                local expected = kind == "admin_kind" and "admin" or ""
                local attempted = expected == "" and "admin" or ""
                local value, err = threads(OWNER):update({thread_id = id, state = "open", event_read = attempted,
                    attrs = {event_read = attempted, user_ids = {OWNER}}})
                test.is_nil(err); test.not_nil(value)
                test.eq(stored_level(id), expected)
                local status = http(id, "admin", "", "PATCH", {event_read = attempted, state = "open", attrs = {event_read = attempted}})
                test.eq(status, 200); test.eq(stored_level(id), expected)
            end
        end)
    end)
end)}
