local test = require("test")
local function define_tests()
    test.describe("native upgrade mailbox continuity", function()
        local receiver = nil
        test.after_each(function()
            if receiver then
                local cancelled, cancel_err = process.cancel(receiver, "1s")
                test.is_nil(cancel_err)
                test.is_true(cancelled)
            end
        end)
        test.it("delivers every admitted message around an upgrade exactly once", function()
            local db, db_err = sql.get("app:db")
            test.is_nil(db_err)
            local rows, query_err = db:query("SELECT 1 AS ready")
            db:release()
            test.is_nil(query_err)
            test.eq(tonumber(rows[1].ready), 1)
            local ready = process.listen("probe.ready")
            local reports = process.listen("probe.report")
            local pid, spawn_err = process.spawn_monitored("app:receiver", "app:processes",
                { observer = tostring(process.pid()) })
            test.is_nil(spawn_err)
            receiver = pid
            local started = channel.select({ ready:case_receive(), time.after("5s"):case_receive() })
            test.eq(started.channel, ready, "receiver never starts")
            local total = 400
            for i = 1, total do
                local sent, send_err = process.send(pid, "n", { seq = i })
                test.is_nil(send_err)
                test.is_true(sent)
                if i == 150 then
                    local entry = assert(registry.get("app:receiver"))
                    entry.meta.comment = "upgraded"
                    local changes = registry.snapshot():changes()
                    changes:update({ id = entry.id, kind = entry.kind, meta = entry.meta, data = entry.data })
                    local _, apply_err = changes:apply()
                    test.is_nil(apply_err)
                end
            end
            time.sleep("12s")
            local sent, send_err = process.send(pid, "report", { pid = tostring(process.pid()), topic = "probe.report" })
            test.is_nil(send_err)
            test.is_true(sent)
            local result = channel.select({ reports:case_receive(), time.after("5s"):case_receive() })
            test.eq(result.channel, reports, "receiver never reports")
            local seen, missing, duplicates = {}, {}, 0
            for _, seq in ipairs(result.value.received) do
                if seen[seq] then duplicates = duplicates + 1 end
                seen[seq] = true
            end
            for seq = 1, total do if not seen[seq] then missing[#missing + 1] = seq end end
            print("incarnations=" .. tostring(result.value.incarnations) .. " admitted=" .. total
                .. " received=" .. #result.value.received .. " missing=" .. #missing .. " duplicates=" .. duplicates
                .. " boundary=" .. tostring(result.value.boundary))
            test.is_true(result.value.incarnations >= 2, "receiver never upgrades")
            test.eq(#missing, 0, "admitted messages disappear: " .. table.concat(missing, ","))
            test.eq(duplicates, 0)
        end)
    end)
end
return { run = test.run_cases(define_tests) }
