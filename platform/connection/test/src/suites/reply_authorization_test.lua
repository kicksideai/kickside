-- Reply transport authorization (OWNERSHIP A30): every reply_sender operation
-- that opens a connection's private reply provider, and so its bot token, is
-- authorized first: a presented reply proof must admit the connection and
-- conversation, and an operation without one needs the caller's connection
-- WRITE grant. A refusal opens nothing.

local test = require("test")
local reply_sender_module = require("reply_sender")
local reply_sender = reply_sender_module

local ACCESS = { READ = 1, WRITE = 2, DELETE = 4, ADMIN = 8 }

local function denied(message: string): error
    return (errors.new({ message = message, kind = errors.PERMISSION_DENIED, retryable = false }) :: error)
end

local function define_tests()
    test.describe("reply_sender authorization", function()
        local log: { string } = {}
        local write_error: any = nil
        local proof_error: any = nil
        local verified: any = nil
        local list_error: any = nil
        local open_error: any = nil

        local provider = {
            send_reply = function(_self: any, _args: any): any log[#log + 1] = "send"; return { success = true, message_ref = "m-1" } end,
            send_status = function(_self: any, _args: any): any log[#log + 1] = "status"; return { success = true } end,
            update_reply = function(_self: any, _args: any): any log[#log + 1] = "update"; return { success = true, message_ref = "m-1" } end,
        }

        test.before_each(function()
            log = {}
            write_error = nil
            proof_error = nil
            verified = nil
            list_error = nil
            open_error = nil
            local component_double = {
                ACCESS = ACCESS,
                validate_access = function(component_id: string, mask: number): (any?, any?)
                    log[#log + 1] = "write:" .. component_id .. ":" .. tostring(mask)
                    if write_error then return nil, write_error end
                    return 15, nil
                end,
                open_private = function(component_id: string, _contract: string): (any?, any?)
                    log[#log + 1] = "open:" .. component_id
                    if open_error then return nil, open_error end
                    return provider, nil
                end,
                list_system = function(): (any?, any?) return list_error and nil or {}, list_error end,
            }
            local authorization_double = {
                verify = function(args: any): any
                    log[#log + 1] = "verify"
                    verified = args
                    return proof_error
                end,
            }
            reply_sender = reply_sender_module.new({ component = component_double,
                authorization = authorization_double })
            test.is_nil(reply_sender_module._component)
            test.is_nil(reply_sender_module._authorization)
        end)

        test.it("refuses an outbound send without connection WRITE and opens nothing", function()
            write_error = denied("connection WRITE denied")
            local result, err = reply_sender.send_reply({ component_id = "conn-1", resource_id = "room-1", outbound = true }, "hi")
            test.is_nil(result)
            test.is_true(errors.is(err, errors.PERMISSION_DENIED), tostring(err))
            test.eq(#log, 1)
            test.eq(log[1], "write:conn-1:2")
        end)

        test.it("sends an outbound message under the caller's connection WRITE grant", function()
            local result, err = reply_sender.send_reply({ component_id = "conn-1", resource_id = "room-1", outbound = true }, "hi")
            test.is_nil(err, tostring(err))
            test.eq(result.message_ref, "m-1")
            test.eq(log[1], "write:conn-1:2")
            test.eq(log[2], "open:conn-1")
            test.eq(log[3], "send")
        end)

        test.it("verifies a reply proof against the connection and conversation before opening", function()
            local proof = { turn_id = "t-1" }
            local result, err = reply_sender.send_reply({ component_id = "conn-1", resource_id = "room-1", reply_proof = proof }, "hi")
            test.is_nil(err, tostring(err))
            test.not_nil(result)
            test.eq(log[1], "verify")
            test.eq(log[2], "open:conn-1")
            test.eq(verified.reply_proof, proof)
            test.eq(verified.connection_id, "conn-1")
            test.eq(verified.resource_id, "room-1")
        end)

        test.it("propagates capability lookup failures before sending", function()
            list_error = errors.new({ kind = errors.UNAVAILABLE, message = "component catalog unavailable" })
            local caps, caps_err = reply_sender.capabilities("conn-1")
            test.is_nil(caps)
            test.eq(caps_err, list_error)
            local result, err = reply_sender.send_reply({ component_id = "conn-1", resource_id = "room-1" }, "hi")
            test.is_nil(result)
            test.eq(err, list_error)
            for _, action in ipairs(log) do test.is_true(action ~= "send") end
        end)

        test.it("preserves provider open failures on every active transport operation", function()
            open_error = errors.new({ kind = errors.UNAVAILABLE, message = "provider unavailable" })
            local config = { component_id = "conn-1", resource_id = "room-1" }
            local result, err = reply_sender.send_reply(config, "hi")
            test.is_nil(result)
            test.eq(err, open_error)
            local sent, status_err = reply_sender.send_status(config, "typing", nil)
            test.is_false(sent)
            test.eq(status_err, open_error)
            local updated, update_err = reply_sender.update_reply(config, "m-1", "edit")
            test.is_nil(updated)
            test.eq(update_err, open_error)
        end)

        test.it("opens nothing when the reply proof is refused", function()
            proof_error = denied("reply proof does not match the admitted turn")
            local result, err = reply_sender.send_reply({ component_id = "conn-1", resource_id = "room-1",
                reply_proof = { turn_id = "t-1" } }, "hi")
            test.is_nil(result)
            test.is_true(errors.is(err, errors.PERMISSION_DENIED), tostring(err))
            test.eq(#log, 1)
        end)

        test.it("authorizes status rendering and reply updates before opening", function()
            write_error = denied("connection WRITE denied")
            local ok, status_err = reply_sender.send_status({ component_id = "conn-1", resource_id = "room-1" }, "typing", nil)
            test.is_false(ok)
            test.not_nil(status_err)
            local updated, update_err = reply_sender.update_reply({ component_id = "conn-1", resource_id = "room-1" }, "m-1", "edit")
            test.is_nil(updated)
            test.is_true(errors.is(update_err, errors.PERMISSION_DENIED), tostring(update_err))
            for _, entry in ipairs(log) do test.is_true(entry:sub(1, 5) ~= "open:", entry) end

            write_error = nil
            log = {}
            local proof = { turn_id = "t-1" }
            local handle, handle_err, changed = reply_sender.update_status({ component_id = "conn-1", resource_id = "room-1",
                reply_proof = proof }, "Using Search.")
            test.is_nil(handle_err, tostring(handle_err))
            test.is_true(changed)
            test.eq(log[1], "verify")
            test.eq(verified.reply_proof, proof)
            test.eq(handle.message_ref, "m-1")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
