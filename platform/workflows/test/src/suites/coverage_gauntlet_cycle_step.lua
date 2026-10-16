type Map = { [string]: any }

local function cycle_step(input: any): Map
    local src = type(input) == "table" and type((input :: Map).input) == "table" and ((input :: Map).input :: Map) or {}
    local i = tonumber(src.iteration) or 0
    local state = type(src.state) == "table" and (src.state :: Map) or {}
    local source = src.input or state.source
    local seed = tonumber(state.seed) or 0
    return {
        state = { seed = seed, count = i, source = source },
        result = {
            iteration = i,
            input = source,
            state = { seed = seed, count = i, source = source },
        },
    }
end

return { run = cycle_step }
