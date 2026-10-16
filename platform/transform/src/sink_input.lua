-- A transform result as a sink input (design v5 §3.2 "Transform output
-- normalization", §7.4): the one normalization every consumer of a strategy
-- value applies before a write.
--
--   normalize(value, input_shape, configured_content?) -- a record is a table; content is
--                                     { content, ... } from a string or a
--                                     table carrying content. Configured content
--                                     supplies a missing/empty record body.

local M = {}

type Map = { [string]: any }

M.RECORD = "record"
M.CONTENT = "content"

local function invalid(message: string): error
    return (errors.new({ message = message, kind = errors.INVALID, retryable = false, details = { error_kind = "declaration" } }) :: error)
end

function M.normalize(value: any, input_shape: string, configured_content: any?): (Map?, error?)
    if input_shape ~= M.RECORD and input_shape ~= M.CONTENT then
        return nil, invalid("the sink input shape must be record or content, got " .. tostring(input_shape))
    end
    if value == nil then return nil, invalid("the transform produced no value; skip items through an explicit filter") end
    if input_shape == M.CONTENT then
        if type(value) == "string" then return { content = value }, nil end
        if type(value) == "table" then
            local content = (value :: Map).content
            -- Supply content sinks' configured message, while keeping
            -- invalid scalars and absent transform results as failures. Copy
            -- the source record so normalization cannot alter a cached value.
            if (content == nil or content == "") and type(configured_content) == "string" and configured_content ~= "" then
                local supplied: Map = {}
                for key, field in pairs(value :: Map) do supplied[key] = field end
                supplied.content = configured_content
                return supplied, nil
            end
            if type(content) == "string" then return value :: Map, nil end
        end
        return nil, invalid("a content sink needs a string or a table carrying content")
    end
    if type(value) ~= "table" then return nil, invalid("a record sink needs a table, got " .. type(value)) end
    return value :: Map, nil
end

return M
