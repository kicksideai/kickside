local function main(state)
    process.set_options({ trap_links = true, upgradable = true })
    local sent, ready_err = process.send(state.observer, "probe.ready", { pid = tostring(process.pid()) })
    if ready_err or not sent then error(tostring(ready_err)) end
    local received = type(state) == "table" and state.received or {}
    local incarnations = (type(state) == "table" and state.incarnations or 0) + 1
    local boundary = type(state) == "table" and state.boundary or nil
    local inbox = process.inbox()
    local events = process.events()
    if incarnations == 1 then
        time.sleep("1s")
        local event = events:receive()
        if event.kind ~= process.event.OUTDATED then error("expected upgrade event") end
        return process.upgrade(nil, { received = received, incarnations = incarnations,
            boundary = #received, observer = state.observer })
    end
    while true do
        local r = channel.select({ events:case_receive(), inbox:case_receive() })
        if r.channel == events then
            local ev = r.value
            if ev.kind == process.event.OUTDATED then
                return process.upgrade(nil, { received = received, incarnations = incarnations, boundary = #received, observer = state.observer })
            elseif ev.kind == process.event.CANCEL then
                return
            end
        else
            local msg = r.value
            local topic = msg:topic()
            local data = msg:payload():data()
            if topic == "n" then
                received[#received + 1] = data.seq
                time.sleep("20ms")
            elseif topic == "report" then
                local sent, report_err = process.send(data.pid, data.topic,
                    { received = received, incarnations = incarnations, boundary = boundary })
                if report_err or not sent then error(tostring(report_err)) end
            end
        end
    end
end
return { main = main }
