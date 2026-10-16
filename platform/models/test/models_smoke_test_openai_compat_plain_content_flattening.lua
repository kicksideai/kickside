local test = require("test")
local registry = require("registry")
local models_repo = require("models_repo")
local catalog_policy = require("catalog_policy")
local catalog_card_policy = require("catalog_card_policy")
local provider_read_model = require("provider_read_model")
local model_catalog = require("model_catalog")
local model_mapper = require("model_mapper")
local models_types = require("models_types")
local provider_registry = require("provider_registry")
local provider_openai_like = require("provider_openai_like")
local openai_compat_plain_generate = require("openai_compat_plain_generate")

local function value(entry: any, key: string): any
    if type(entry) ~= "table" then return nil end
    if entry[key] ~= nil then return entry[key] end
    if type(entry.data) == "table" then return entry.data[key] end
    return nil
end

local function has_process_scope(entry: any): boolean
    local lifecycle = value(entry, "lifecycle")
    if type(lifecycle) ~= "table" or type(lifecycle.security) ~= "table" then
        return false
    end
    local groups = lifecycle.security.groups
    if type(groups) ~= "table" then
        return false
    end
    for _, group_id in ipairs(groups) do
        if group_id == "wippy.security:process" then return true end
    end
    return false
end

local function meta(entry: any): any
    return type(entry) == "table" and (entry.meta or (entry.data and entry.data.meta)) or nil
end

local function has(list: any, expected: string): boolean
    if type(list) ~= "table" then return false end
    for _, item in ipairs(list) do
        if item == expected then return true end
    end
    return false
end

local function allowed_class(name: string): boolean
    return name == "fast"
        or name == "nano"
        or name == "balanced"
        or name == "premium"
        or name == "embed"
end

local function fake_error_builder(): any
    local builder = {}
    function builder:classifier(_classifier: any): any return self end
    function builder:kind(kind: string): any
        self._kind = kind
        return self
    end
    function builder:message(message: string): any
        self._message = message
        return self
    end
    function builder:from(info: any): any
        self._kind = info and info.kind or self._kind or "server_error"
        self._message = info and info.message or self._message or "error"
        self._status_code = info and info.status_code or self._status_code
        return self
    end
    function builder:build(): any
        local kind = self._kind or "server_error"
        local message = self._message or "error"
        return {
            success = false,
            error = kind,
            error_message = message,
            metadata = { status_code = self._status_code },
            kind = function() return kind end,
            message = function() return message end,
        }
    end
    return builder
end

local function fake_output(streamer: any): any
    return {
        ERROR_TYPE = { INVALID_REQUEST = "invalid_request" },
        errors = {
            generate = function(_args: any): any
                return fake_error_builder()
            end,
        },
        streamer = function(pid: string, topic: string, buffer_size: number): any
            streamer.pid = pid
            streamer.topic = topic
            streamer.buffer_size = buffer_size
            return streamer
        end,
    }
end

local function fake_mapper(): any
    return {
        classify_error = function(err: any): any return err end,
        map_messages = function(_messages: any, _options: any): any
            return {
                { role = "system", content = { { type = "text", text = "sys" } } },
                { role = "user", content = { { type = "text", text = "hello" }, { content = " world" } } },
                { role = "assistant", content = { { type = "text", text = "left rich" } } },
            }
        end,
        map_options = function(options: any): any return options or {} end,
        map_tokens = function(usage: any): any return usage or {} end,
        map_finish_reason = function(reason: any): any return reason end,
        map_success_response = function(response: any, _context: any): any
            return {
                success = true,
                result = { content = response.content or "", tool_calls = {} },
                metadata = response.metadata or {},
            }
        end,
        map_tool_calls = function(calls: any, _tool_name_map: any): any
            return {
                {
                    id = calls[1].id,
                    name = calls[1]["function"].name,
                    arguments = calls[1]["function"].arguments,
                },
            }
        end,
        extract_reasoning_text = function(details: any): any return details end,
    }
end

local function with_plain_generate_mocks(client: any, mapper: any, output: any, fn: () -> ()): any
    local original_client = openai_compat_plain_generate._client
    local original_mapper = openai_compat_plain_generate._mapper
    local original_output = openai_compat_plain_generate._output

    openai_compat_plain_generate._client = client
    openai_compat_plain_generate._mapper = mapper
    openai_compat_plain_generate._output = output

    local results = { pcall(fn) }

    openai_compat_plain_generate._client = original_client
    openai_compat_plain_generate._mapper = original_mapper
    openai_compat_plain_generate._output = original_output

    if not results[1] then error(results[2]) end
    table.remove(results, 1)
    return table.unpack(results)
end

local function define_tests()

    test.describe("openai_compat_plain content flattening", function()
        local g = openai_compat_plain_generate

        test.it("content_text joins text, never tostrings a table", function()
            test.eq(g.content_text("hello"), "hello")
            test.eq(g.content_text({ { type = "text", text = "a" }, { type = "text", text = "b" } }), "ab")
            -- The headline bug: an image-only / empty content array used to become
            -- "table: 0x..." (tostring on the content table). Must be a clean string.
            local out = g.content_text({ { type = "image_url", image_url = { url = "data:image/png;base64,AAA" } } })
            test.is_true(type(out) == "string")
            test.is_true(string.find(out, "table:", 1, true) == nil)
            test.eq(g.content_text({}), "")
        end)

        test.it("is_text_only flags non-text parts", function()
            test.eq(g.is_text_only("hi"), true)
            test.eq(g.is_text_only({ { type = "text", text = "x" } }), true)
            test.eq(g.is_text_only({ { type = "text", text = "x" }, { type = "image_url", image_url = { url = "u" } } }), false)
        end)

        test.it("plain_messages flattens text-only, keeps image content structured", function()
            local saved = g._mapper
            g._mapper = setmetatable({ map_messages = function(msgs: any, _o: any): any return msgs end }, { __index = saved })
            local mapped = g.plain_messages({
                { role = "user", content = { { type = "text", text = "hi" } } },
                { role = "user", content = { { type = "image_url", image_url = { url = "data:image/png;base64,AAA" } } } },
            })
            g._mapper = saved
            test.eq(mapped[1].content, "hi")
            test.is_true(type(mapped[2].content) == "table")
            test.eq(mapped[2].content[1].type, "image_url")
        end)

        test.it("maps native image parts to data URIs without flattening them", function()
            local mapped = g.plain_messages({
                { role = "user", content = {
                    { type = "text", text = "Describe the fixture" },
                    { type = "image", source = { type = "base64", mime_type = "image/png", data = "AAA" } },
                } },
            })
            test.eq(type(mapped[1].content), "table")
            test.eq(mapped[1].content[1].text, "Describe the fixture")
            test.eq(mapped[1].content[2].type, "image_url")
            test.eq(mapped[1].content[2].image_url.url, "data:image/png;base64,AAA")
        end)
    end)


end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
