-- The sink writer an automation opens over a writable port binding: the open
-- context carries the picker-selected component and the automation runtime,
-- and every write result is classified by the one failure rule, so each
-- dispatcher records and retries through one path.

local support = require("engine_support")
local errors = require("errors")
local failure_classification = require("failure_classification")
local capacity = require("connection_capacity").new()

type Map = { [string]: any }

local part = {}

-- attach(M, dependencies, P) defines M.open_sink_writer.
function part.attach(M: any, dependencies: any, _P: any): ()
    local WRITABLE_CONTRACT = support.WRITABLE_CONTRACT
    local copy_map = support.copy_map
    local trim = support.trim

    -- Writable ports select component-backed destinations through their picker
    -- configuration.  The canonical picker spelling is thread_id because a
    -- component's primary thread is its stable public handle; contract bindings,
    -- however, run component methods under ctx.component_id.  Preserve every
    -- picker value while carrying that selected component identity into the open
    -- context.  An explicit component_id always wins for ports that already use
    -- the canonical spelling directly.
    local function sink_open_context(config: Map, deadline: string?): Map
        local context = copy_map(config) :: any
        local component_id = trim((context :: any).component_id)
        if component_id == "" then component_id = trim((context :: any).thread_id) end
        if component_id ~= "" then (context :: any).component_id = component_id end
        -- Sink writes run under the automation runtime. Declaring it in the open
        -- context lets destination write paths distinguish machine-asserted
        -- provenance from an ambient human session instead of stripping it.
        if trim((context :: any).runtime_type) == "" then (context :: any).runtime_type = "automation" end
        -- A round's work deadline bounds every wait the write makes.
        if deadline ~= nil then (context :: any).deadline = deadline end
        return context :: Map
    end

    function M.open_sink_writer(binding: string, config: Map, deadline: string?): (any?, any)
        if type(binding) ~= "string" or binding == "" then
            return nil, failure_classification.classify({
                kind = errors.INVALID, message = "sink binding is required", retriable = false,
            })
        end
        local contract_mod = dependencies.contract
        local def, derr = contract_mod.get(WRITABLE_CONTRACT)
        if derr or not def then
            return nil, failure_classification.classify(errors.new({ kind = errors.UNAVAILABLE, retryable = true,
                message = "writable contract unavailable: " .. tostring(derr) }))
        end
        local context = sink_open_context(config or {}, deadline)
        local connection_id = trim(context.connection_id)
        local single, options_err = (def :: any):with_options({retry = {max_attempts = 1}})
        if options_err then return nil, failure_classification.classify(options_err) end
        local inst, oerr = (single :: any):with_context(context):open(binding)
        if oerr or not inst then return nil, failure_classification.classify(oerr or "writable binding unavailable", "writable open: ") end
        return {
            -- A failed write answers (nil, message, envelope): the message is the
            -- keyed failure shape every dispatcher records, the envelope is the
            -- sink's own structured error ({code, retriable, scope, retry_after_ms, ...})
            -- for callers that classify failures instead of reading text.
            write = function(_self: any, body: Map): (any?, string?, Map?)
                local res, werr = capacity.invoke(connection_id ~= "" and connection_id or nil, function()
                    return failure_classification.native_result((inst :: any):write(body))
                end)
                if werr then
                    local classified = failure_classification.classify(werr)
                    classified.terminal = not classified.retriable
                    return nil, classified.message, classified :: Map
                end
                if type(res) ~= "table" then
                    local classified = failure_classification.classify({
                        kind = errors.INVALID,
                        message = "writable result must explicitly acknowledge success=true",
                        retriable = false,
                    })
                    return nil, classified.message, {
                        kind = classified.kind,
                        message = classified.message,
                        retriable = classified.retriable,
                        terminal = not classified.retriable,
                    }
                end
                local result = res :: Map
                if result.success ~= true then
                    local rerr: any = result.error
                    local classified = failure_classification.classify(rerr or {
                        kind = errors.INVALID,
                        message = "writable result must explicitly acknowledge success=true",
                        retriable = false,
                    })
                    local envelope: Map = type(rerr) == "table" and copy_map(rerr) or {}
                    envelope.kind = classified.kind
                    envelope.message = classified.message
                    envelope.retriable = classified.retriable
                    envelope.terminal = not classified.retriable
                    return nil, classified.message, envelope
                end
                return result, nil
            end,
        }, nil
    end

end

return part
