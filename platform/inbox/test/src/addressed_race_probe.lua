-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local addressed = require("addressed")
local channel = require("channel")

-- Scheduling instrumentation only: every storage operation still uses the real
-- Threads contract and database. Both deliveries read before either appends.
local function run(input: any): any
    local original = addressed.store
    local ready, release, done = channel.new(2), channel.new(2), channel.new(2)
    local first_done = channel.new(1)
    local misses, duplicates = 0, 0
    addressed.store = function(name: string): (any?, any?)
        local store, err = original(name)
        if err then return nil, err end
        return {
            upsert = function(_, args) return store:upsert(args) end,
            find_event_by_external = function(_, args)
                local result, read_err = store:find_event_by_external(args)
                if not read_err and not result.event then misses = misses + 1 end
                return result, read_err
            end,
            find = function(_, args)
                local result, read_err = store:find(args)
                if args.subject and not read_err then
                    ready:send(true)
                    release:receive()
                end
                return result, read_err
            end,
            append_event = function(_, args)
                if args.event.body.title == "Second" then first_done:receive() end
                local result, append_err = store:append_event(args)
                if result and result.inserted == 0 then duplicates = duplicates + 1 end
                if args.event.body.title == "First" then first_done:send(true) end
                return result, append_err
            end,
        }, nil
    end
    for _, title in ipairs({ "First", "Second" }) do
        local title_copy = title
        coroutine.spawn(function()
            local params = {}
            for key, value in pairs(input.params) do params[key] = value end
            params.title = title_copy
            local result, err = addressed.deliver({ params = params })
            done:send({ result = result, err = err, title = title_copy })
        end)
    end
    ready:receive()
    ready:receive()
    release:send(true)
    release:send(true)
    local first = done:receive()
    local second = done:receive()
    local results = { first, second }
    addressed.store = original
    return { results = results, misses = misses, duplicates = duplicates }
end
return { run = run }
