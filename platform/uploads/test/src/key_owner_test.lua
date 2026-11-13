-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test=require("test")
local funcs=require("funcs")
local security=require("security")
local env=require("env")
local owner=require("upload_tokens")

local function operation(): any
    local callback, callback_err = owner.pack({upload_id="key-owner-upload",function_id="app:key_owner_callback",actor_id="member",actor_context={}})
    local unpacked, unpack_err = owner.unpack(callback)
    local token, read_err = owner.pack_read({upload_id="key-owner-upload"})
    local read, verify_err = owner.unpack_read(token,{upload_id="key-owner-upload"})
    return {success=unpacked ~= nil and unpacked.upload_id=="key-owner-upload" and read ~= nil and read.upload_id=="key-owner-upload",
        error=tostring(callback_err or unpack_err or read_err or verify_err)}
end

local function probe(): any
    local before,before_err=env.get("ENCRYPTION_KEY")
    local result=operation()
    local after,after_err=env.get("ENCRYPTION_KEY")
    result.before_denied=before==nil and before_err~=nil
    result.after_denied=after==nil and after_err~=nil
    return result
end

local function define_tests()
    test.describe("Uploads key ownership",function()
        test.it("keeps the published token methods callable with existing module runtime authority",function()
            local scope=security.new_scope({assert(security.policy("app:key_owner_probe_call")),assert(security.policy("kickside.uploads.security:module_runtime"))})
            local result,err=funcs.new():with_actor(security.new_actor("member",{})):with_scope(scope):call("app:key_owner_probe")
            test.is_nil(err,tostring(err));test.is_true(result.success,tostring(result.error))
            test.is_true(result.before_denied);test.is_true(result.after_denied)
        end)

        test.it("keeps every accepted key size and both previous token formats",function()
            local previous=env.get("ENCRYPTION_KEY")
            local ok,failure=pcall(function()
                for _,fixture in ipairs({
                {bytes=16,callback="AAECAwQFBgcICQoLbezTgHvjiGj6fIVmKbkkonsTEQbt1QmAwkwinHjJqIdABuOcbTfdfeAGZn8hNE+AJhDGDYBjyoQfzJ+ToHP1RqF+/6kagcI7wIGKejZ/OY38+F0rVU/e2lseDaZwxeWTSFWVSm6X+k0RxL3KRvLShsKpcGT1PNdqQ6bf8JRhvYb2AcN7P9zDvF2GQ+qOw5Lcsegn",read="eyJwdXJwb3NlIjoidXBsb2FkLnJlYWQiLCJ1cGxvYWRfaWQiOiJsZWdhY3ktdXBsb2FkIiwiaXNzdWVkX2F0Ijo0MTAyNDQ0ODAwLCJleHBpcmVzX2F0Ijo0MTAyNDQ4NDAwfQ.02b40f530e243177c85f516986698fd58f7741b3db7eea56f8dfba74a96155a1"},
                {bytes=24,callback="AAECAwQFBgcICQoLO+BdvynZeIHrm+k7wX+7wjuwGdpu/uXYvT7aTpyiyO+NjOwLlAn7zj192EiPio1H1DNgJPpuKRdLHhI6y6BXLB/xLjQq24W6QCdGp+L0PsnVHzZy/dlPJgOzgCNsS2nD+hTPTDqPdnnxnFt5w9aD89rL6gwg7hjP/Rx53VhO1j4Tcdx4hTEB+R3C0GpQ5XnkifBU",read="eyJwdXJwb3NlIjoidXBsb2FkLnJlYWQiLCJ1cGxvYWRfaWQiOiJsZWdhY3ktdXBsb2FkIiwiaXNzdWVkX2F0Ijo0MTAyNDQ0ODAwLCJleHBpcmVzX2F0Ijo0MTAyNDQ4NDAwfQ.f8c6338281286b2959f0902481c61e265672904143ab65f7b6b75d8578189b2e"},
                {bytes=32,callback="AAECAwQFBgcICQoLW3lzLiJ4BDwbRj2rQ7hCx8KCFjLzAAn/xSSvvE3la9FM1nmk724th4SSyxNLEsIbBdIacQHPBA3grCfMQJdJciubGbDhHyT/riVHYR3hN4TbZZxAI3J4auLlQ7GBFb1Y1hvVkutqUuxY6tvY78Q2b6pkzSZmo9XI1/2t0MIPu8Fh+Iao7EVujq8KNc5H3OyF0HoO",read="eyJwdXJwb3NlIjoidXBsb2FkLnJlYWQiLCJ1cGxvYWRfaWQiOiJsZWdhY3ktdXBsb2FkIiwiaXNzdWVkX2F0Ijo0MTAyNDQ0ODAwLCJleHBpcmVzX2F0Ijo0MTAyNDQ4NDAwfQ.2164d345b2255a36246ebc24ad67e06961cbf12276aa6f22739127a321ad6a3e"},
                }) do
                    local _,set_err=env.set("ENCRYPTION_KEY",string.rep("ab",fixture.bytes))
                    test.is_nil(set_err)
                    local callback,callback_err=owner.unpack(fixture.callback)
                    test.is_nil(callback_err,tostring(callback_err));test.eq(callback.upload_id,"legacy-upload")
                    local read,read_err=owner.unpack_read(fixture.read,{upload_id="legacy-upload"})
                    test.is_nil(read_err,tostring(read_err));test.eq(read.upload_id,"legacy-upload")
                    local packed,pack_err=owner.pack_read({upload_id="key-width-upload"})
                    test.is_nil(pack_err,tostring(pack_err));test.not_nil(packed)
                    local opened,open_err=owner.unpack_read(packed,{upload_id="key-width-upload"})
                    test.is_nil(open_err,tostring(open_err));test.eq(opened.upload_id,"key-width-upload")
                end
            end)
            local _,restore_err=env.set("ENCRYPTION_KEY",previous)
            test.is_nil(restore_err)
            if not ok then error(failure,0) end
        end)

        test.it("preserves a typed invalid callback error across the owner boundary",function()
            local value,err=owner.pack({})
            test.is_nil(value)
            test.not_nil(err)
            test.is_true(errors.is(err,errors.INVALID),tostring(err))
            test.eq(err:details().error_kind,"declaration")
        end)

        test.it("keeps encryption in the owner while the caller cannot read the key",function()
            local scope=security.new_scope({assert(security.policy("app:key_owner_caller"))})
            local result,err=funcs.new():with_actor(security.new_actor("member",{})):with_scope(scope):call("app:key_owner_probe")
            test.is_nil(err,tostring(err))
            test.is_true(result.before_denied)
            test.is_true(result.after_denied)
            test.is_true(result.success,tostring(result.error))
        end)
    end)
end
return {run=test.run_cases(define_tests),probe=probe}
