local test = require("test")
local funcs = require("funcs")

local WORKER = "kickside.uploads.persist:uploads_projection_worker"

local EV = {
    QUEUED = "kickside.uploads.events:upload.queued",
    COMPLETED = "kickside.uploads.events:upload.completed",
    DELETED = "kickside.uploads.events:upload.deleted",
    FAILED = "kickside.uploads.events:upload.failed",
}

local function ev(etype: string, body: any, extra: any?): any
    local out = { type = etype, body = body }
    if type(extra) == "table" then
        for k, v in pairs(extra) do out[k] = v end
    end
    return out
end

local function fold(prior: any, events: any, to_seq: any): any
    return funcs.call(WORKER, { projection = { body = prior }, events = events, range = { to_seq = to_seq } })
end

local function counts_from_events(events: any): any
    local counts = {
        file_count = 0,
        pending_count = 0,
        total_bytes = 0,
    }
    for _, item in ipairs(events or {}) do
        local body = type(item.body) == "table" and item.body or {}
        if item.type == EV.QUEUED then
            counts.pending_count = counts.pending_count + 1
        elseif item.type == EV.COMPLETED or item.type == EV.FAILED then
            counts.file_count = counts.file_count + 1
            counts.total_bytes = counts.total_bytes + (tonumber(body.size) or 0)
            if item.type == EV.COMPLETED then
                counts.last_upload_id = body.upload_id
                counts.last_completed_at = item.created_at
            end
        end
    end
    return counts
end

local function fold_with_component(prior: any, events: any, to_seq: any, component: any): any
    return funcs.call(WORKER, {
        thread_id = "uploads-component-1",
        projection = { body = prior },
        events = events,
        range = { to_seq = to_seq },
        component = component,
        read_model = {
            apply_events = function(_component_id: string, evs: any)
                return counts_from_events(evs), nil
            end,
        },
    })
end

local function define_tests()
    test.describe("Uploads Projection Worker", function()
        test.it("keeps projection metadata and materialized counts without retaining upload copies", function()
            local out, err = fold_with_component({meta = {worker_input_mode = "prefetch_events"}}, {}, 7,
                {set_meta = function() return true end})
            test.is_nil(err)
            test.eq(out.last_seq, 7)
            test.eq(out.body.meta.worker_input_mode, "prefetch_events")
            test.is_nil(out.body.uploads)
            test.is_nil(out.body.pending)
            test.eq(out.body.counts.file_count, 0)
        end)
        test.it("requires the component identity before materializing lifecycle events", function()
            local result, err = fold({}, {}, 1)
            test.is_nil(result)
            test.is_true(errors.is(err, errors.INVALID))
        end)

        test.it("preserves typed summary publication failures", function()
            local failure = errors.new({ kind = errors.UNAVAILABLE, message = "metadata owner unavailable" })
            local result, err = fold_with_component({}, {}, 1, {
                set_meta = function() return false, failure end,
            })
            test.is_nil(result)
            test.is_true(errors.is(err, errors.UNAVAILABLE))
        end)



        test.it("syncs flat public meta count fields for the uploads component", function()
            local writes = {}
            local component = {
                set_meta = function(component_id: string, meta: any)
                    writes[#writes + 1] = { component_id = component_id, meta = meta }
                    return true
                end,
            }
            local out = fold_with_component({}, {
                ev(EV.COMPLETED, { upload_id = "u1", filename = "a.txt", mime_type = "text/plain", size = 10, type_id = "text" }, { id = "ev1", created_at = "2026-01-01T00:00:00Z" }),
                ev(EV.COMPLETED, { upload_id = "u2", filename = "b.png", mime_type = "image/png", size = 5, type_id = "image" }, { id = "ev2", created_at = "2026-01-02T00:00:00Z" }),
            }, 2, component)

            test.eq((out :: any).last_seq, 2)
            test.eq(#writes, 1)
            test.eq((writes[1] :: any).component_id, "uploads-component-1")
            test.eq((writes[1] :: any).meta.status, "ready")
            test.eq((writes[1] :: any).meta.file_count, 2)
            test.eq((writes[1] :: any).meta.last_event_seq, 2)
            test.eq((writes[1] :: any).meta.total_bytes, 15)
            test.eq((writes[1] :: any).meta.last_upload_id, "u2")
            test.eq((writes[1] :: any).meta.last_completed_at, "2026-01-02T00:00:00Z")
            test.is_nil((writes[1] :: any).meta.stats)
        end)

        test.it("materializes a queued upload into public pending counts", function()
            local writes = {}
            local component = {
                set_meta = function(component_id: string, meta: any)
                    writes[#writes + 1] = { component_id = component_id, meta = meta }
                    return true
                end,
            }
            local out = fold_with_component({}, {
                ev(EV.QUEUED, { upload_id = "u1", filename = "a.txt", mime_type = "text/plain", size = 10, type_id = "text" }, { id = "ev1" }),
            }, 1, component)

            test.eq((out :: any).body.counts.pending_count, 1)
            test.eq((out :: any).body.counts.file_count, 0)
            test.is_nil((out :: any).body.pending)
            test.eq(#writes, 1)
            test.eq((writes[1] :: any).meta.status, "processing")
            test.eq((writes[1] :: any).meta.pending_count, 1)
            test.eq((writes[1] :: any).meta.file_count, 0)
        end)





        test.it("reports processing status while any upload is in flight", function()
            local writes = {}
            local component = {
                set_meta = function(component_id: string, meta: any)
                    writes[#writes + 1] = { component_id = component_id, meta = meta }
                    return true
                end,
            }
            fold_with_component({}, {
                ev(EV.COMPLETED, { upload_id = "u1", size = 10, mime_type = "text/plain", type_id = "text" }, { id = "ev1", created_at = "2026-01-01T00:00:00Z" }),
                ev(EV.QUEUED, { upload_id = "u2", size = 5, mime_type = "image/png", type_id = "image" }, { id = "ev2" }),
            }, 2, component)
            test.eq(#writes, 1)
            test.eq((writes[1] :: any).meta.status, "processing")
            test.eq((writes[1] :: any).meta.pending_count, 1)
            test.eq((writes[1] :: any).meta.file_count, 1)
        end)








    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
