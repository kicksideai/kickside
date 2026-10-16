local test = require("test")
local pg = require("pg")
local time = require("time")

local SCOPE = "app:pg_test"

local function describe_tests()
    test.describe("pg process groups (app runtime)", function()
        test.it("opens a pg scope, joins, lists members, and leaves", function()
            local scope, err = pg.open(SCOPE)
            test.is_nil(err)
            test.not_nil(scope)

            local ok, jerr = scope:join("room.alpha")
            test.is_nil(jerr)
            test.is_true(ok)

            local members, merr = scope:get_members("room.alpha")
            test.is_nil(merr)
            test.is_true(#members >= 1)

            local lok, lerr = scope:leave("room.alpha")
            test.is_nil(lerr)
            test.is_true(lok)

            scope:release()
        end)

        test.it("delivers a broadcast to a joined member's inbox", function()
            local scope = pg.open(SCOPE)
            scope:join("room.bravo")

            local ch = process.listen("bravo.evt")
            local ok, berr = scope:broadcast("room.bravo", "bravo.evt", { n = 1, hello = "world" })
            test.is_nil(berr)
            test.is_true(ok)

            local timer = time.after(3000 * time.MILLISECOND)
            local res = channel.select({ ch:case_receive(), timer:case_receive() })
            test.is_false(res.channel == timer)
            test.not_nil(res.value)
            test.eq(res.value.n, 1)

            scope:leave("room.bravo")
            scope:release()
        end)

        test.it("emits member.joined / member.left presence events", function()
            local scope = pg.open(SCOPE)
            local sub, _, serr = scope:monitor("room.charlie")
            test.is_nil(serr)
            local ch = sub:channel()

            scope:join("room.charlie")
            local timer = time.after(3000 * time.MILLISECOND)
            local res = channel.select({ ch:case_receive(), timer:case_receive() })
            test.is_false(res.channel == timer)
            test.eq(res.value.kind, "member.joined")
            test.eq(res.value.path, "room.charlie")

            scope:leave("room.charlie")
            timer = time.after(3000 * time.MILLISECOND)
            res = channel.select({ ch:case_receive(), timer:case_receive() })
            test.is_false(res.channel == timer)
            test.eq(res.value.kind, "member.left")

            sub:close()
            scope:release()
        end)

        test.it("broadcasts cross-process and drops a member on leave", function()
            local scope = pg.open(SCOPE)
            scope:join("room.delta")

            local worker, werr = process.spawn_monitored(
                "app:pg_worker", "app:processes",
                { parent = process.pid(), group = "room.delta", topic = "delta.evt" }
            )
            test.is_nil(werr)

            local joined = false
            for _ = 1, 50 do
                local m = scope:get_members("room.delta")
                if #m >= 2 then joined = true break end
                time.sleep(50 * time.MILLISECOND)
            end
            test.is_true(joined)

            local got = process.listen("worker.got")
            scope:broadcast("room.delta", "delta.evt", { round = 1 })
            local timer = time.after(3000 * time.MILLISECOND)
            local res = channel.select({ got:case_receive(), timer:case_receive() })
            test.is_false(res.channel == timer)
            test.eq(res.value.round, 1)

            process.send(worker, "quit", {})
            local dropped = false
            for _ = 1, 50 do
                local m = scope:get_members("room.delta")
                if #m <= 1 then dropped = true break end
                time.sleep(50 * time.MILLISECOND)
            end
            test.is_true(dropped)

            scope:leave("room.delta")
            scope:release()
        end)
    end)
end

return { run = test.run_cases(describe_tests) }
