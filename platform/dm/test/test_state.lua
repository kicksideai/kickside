local M = {}

type TestState = {
    route: any?,
    hub_message: any?,
    reply: string?,
    accepted: any?,
    clear: any?,
    clear_error: any?,
    link: any?,
}

local state: TestState = {}

function M.reset()
    state = {}
end

function M.set_route(route: any)
    state.route = route
end

function M.last_route(): any
    return state.route
end

function M.set_hub_message(message: any)
    state.hub_message = message
end

function M.last_hub_message(): any
    return state.hub_message
end

function M.set_reply(message: string)
    state.reply = message
end

function M.last_reply(): string?
    return state.reply
end

function M.set_accepted(value: any)
    state.accepted = value
end

function M.last_accepted(): any
    return state.accepted
end

function M.set_clear(value: any)
    state.clear = value
end

function M.last_clear(): any
    return state.clear
end

function M.set_clear_error(value: any)
    state.clear_error = value
end

function M.clear_error(): any
    return state.clear_error
end

function M.set_link(value: any)
    state.link = value
end

function M.last_link(): any
    return state.link
end

return M
