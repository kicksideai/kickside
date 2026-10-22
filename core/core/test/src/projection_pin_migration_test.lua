-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local repair = require("repair")
local pin = require("pin")
local prune = require("prune")

local function query(db, statement, params)
    local rows, err = db:query(statement, params)
    if err then error(err) end
    return rows
end
local function execute(db, statement, params)
    local result, err = db:execute(statement, params)
    if err then error(err) end
    return result
end
local function fixture(db, count, status, boundary)
    local thread = uuid.v7()
    execute(db, [[INSERT INTO kickside_thread (id,thread_class,component_id,event_count,max_pruned_seq)
        VALUES ($1,'test',$2,3,$3)]], {thread, thread, boundary or 0})
    for seq = (boundary or 0) + 1, 3 do
        execute(db, [[INSERT INTO kickside_event (id,thread_id,type,role,body,seq,created_at)
            VALUES ($1,$2,'test:event','user','{}',$3,'2000-01-01T00:00:00Z')]], {uuid.v7(),thread,seq})
    end
    local projection = uuid.v7()
    execute(db, [[INSERT INTO kickside_projection (id,thread_id,kind,state)
        VALUES ($1,$2,'test:retention','invalid')]], {projection, thread})
    local ids = {}
    for index = 1, count do
        local id = uuid.v7()
        execute(db, [[INSERT INTO kickside_projection_cursor
            (id,projection_id,thread_id,cursor_key,last_seq,status,generation,last_error)
            VALUES ($1,$2,$3,$4,1,$5,7,'invalid declaration')]],
            {id, projection, thread, tostring(index),status or 'invalid'})
        ids[#ids + 1] = id
    end
    return thread, ids
end
local function count_pins(db, thread)
    return tonumber(query(db, "SELECT COUNT(*) AS n FROM kickside_retention_pin WHERE thread_id=$1", {thread})[1].n)
end
local function run(db, id)
    return repair({db=db,id=id})
end
local function finish(db, thread)
    execute(db, "DELETE FROM kickside_thread WHERE id=$1", {thread})
end

return test.run_cases(function()
    test.describe("existing blocked projection pin migration", function()
        test.it("retains remaining unread input without changing cursors or healthy projections", function()
            local db = assert(sql.get("app:db"))
            local thread, ids = fixture(db, 1)
            local active = fixture(db, 1, "active")
            local paused = fixture(db, 1, "paused")
            local id = "app:pin-repair:" .. uuid.v7()
            local result = run(db, id)
            test.eq(result.status, "complete", tostring(result.error))
            test.eq(count_pins(db, thread), 1)
            test.eq(count_pins(db, active), 0)
            test.eq(count_pins(db, paused), 0)
            local held = assert(pin.read(db, thread, "projection:" .. ids[1]))
            test.eq(tonumber(held.cursor_seq), 1)
            test.eq(tonumber(held.command_generation), 7)
            test.eq(held.command_id, ids[1] .. ":7")
            local cursor = query(db,"SELECT status,last_seq,generation,last_error FROM kickside_projection_cursor WHERE id=$1",{ids[1]})[1]
            test.eq(cursor.status,"invalid")
            test.eq(tonumber(cursor.last_seq),1)
            test.eq(tonumber(cursor.generation),7)
            test.eq(cursor.last_error,"invalid declaration")
            local swept, sweep_err = prune.prune_thread(db, thread, {cutoff="2001-01-01T00:00:00Z"})
            test.is_nil(sweep_err)
            test.eq(swept.deleted,1)
            test.eq(run(db,id).status,"complete")
            test.eq(count_pins(db,thread),1)
            local again = assert(pin.read(db,thread,"projection:"..ids[1]))
            test.eq(again.generation,held.generation)
            test.eq(run(db,"app:pin-repair:"..uuid.v7()).status,"complete")
            test.eq(assert(pin.read(db,thread,"projection:"..ids[1])).generation,held.generation)
            finish(db,thread); finish(db,active); finish(db,paused)
            db:release()
        end)
        test.it("resumes from the committed page after an interruption without repinning it", function()
            local db = assert(sql.get("app:db"))
            local thread = fixture(db, 401)
            local id = "app:pin-repair:" .. uuid.v7()
            local first_page = query(db,"SELECT id,thread_id FROM kickside_projection_cursor ORDER BY id LIMIT 200",{})
            local expected = 0
            for _, row in ipairs(first_page) do
                if row.thread_id == thread then expected = expected + 1 end
            end
            local begins = 0
            local adapter = {
                type=function() return db:type() end,
                query=function(_,statement,params) return db:query(statement,params) end,
                execute=function(_,statement,params) return db:execute(statement,params) end,
                begin=function(_,options)
                    begins=begins+1
                    if begins==2 then return nil,errors.new({kind=errors.UNAVAILABLE,message="simulated interruption"}) end
                    return db:begin(options)
                end,
            }
            local result = run(adapter,id)
            test.eq(result.status,"error")
            test.eq(count_pins(db,thread),expected)
            test.eq(#query(db,"SELECT id FROM _migrations WHERE id=$1",{id}),0)
            local checkpoint = query(db,"SELECT cursor FROM _migration_progress WHERE id=$1",{id})
            test.eq(#checkpoint,1)
            test.eq(checkpoint[1].cursor,first_page[#first_page].id)
            test.eq(run(db,id).status,"complete")
            test.eq(count_pins(db,thread),401)
            test.eq(#query(db,"SELECT id FROM _migration_progress WHERE id=$1",{id}),0)
            test.eq(tonumber(query(db,"SELECT MAX(generation) AS n FROM kickside_retention_pin WHERE thread_id=$1",{thread})[1].n),1)
            test.eq(run(db,id).status,"complete")
            test.eq(count_pins(db,thread),401)
            finish(db,thread)
            db:release()
        end)
        test.it("protects surviving input when older unread events are already pruned", function()
            local db = assert(sql.get("app:db"))
            local thread, ids = fixture(db,1,"invalid",2)
            local result = run(db,"app:pin-repair:"..uuid.v7())
            test.eq(result.status,"complete",tostring(result.error))
            local held = assert(pin.read(db,thread,"projection:"..ids[1]))
            test.eq(tonumber(held.cursor_seq),2)
            test.eq(tonumber(query(db,"SELECT last_seq FROM kickside_projection_cursor WHERE id=$1",{ids[1]})[1].last_seq),1)
            local swept,err=prune.prune_thread(db,thread,{cutoff="2001-01-01T00:00:00Z"})
            test.is_nil(err)
            test.eq(swept.deleted,0)
            finish(db,thread)
            db:release()
        end)
    end)
end)
