local process = require("process")
local channel = require("channel")
local client = require("client")
local time = require("time")
local engine_api = require("engine_api")
local admission = require("admission")
local store = require("store")

local function main(args: any): ()
    local cli, err = client.new()
    if not err and args.stage ~= "insert" then
        local _, create_err = cli:create_workflow(args.payload.commands, args.payload.options)
        err = create_err
    end
    if not err and args.stage == "start" then
        local _, start_err = cli:start(args.dataflow_id, args.payload.start_options)
        err = start_err
        if not err then
            local started = false
            for _ = 1, 200 do
                local status, status_err = cli:get_status(args.dataflow_id)
                if status_err then err = status_err; break end
                if status ~= "pending" then started = true; break end
                time.sleep(10 * time.MILLISECOND)
            end
            if not err and not started then err = "native flow does not start" end
        end
    elseif not err and (args.stage == "terminal" or args.stage == "callback") then
        local _, execute_err = cli:execute(args.dataflow_id, args.payload.start_options)
        err = execute_err
        if not err and args.stage == "callback" then
            local observed = false
            for _ = 1, 200 do
                local db, open_err = store.open_db()
                if open_err then err = open_err; break end
                local rows, read_err = db:query("SELECT status,admission_state FROM workflow_runs WHERE run_id=$1", {args.row.run_id})
                db:release()
                if read_err then err = read_err; break end
                if rows and rows[1] and rows[1].status == "completed" and rows[1].admission_state == "admitted" then
                    observed = true; break
                end
                time.sleep(10 * time.MILLISECOND)
            end
            if not err and not observed then err = "native completion callback does not commit" end
        end
    elseif not err and args.stage == "admission" then
        local current, run_err = engine_api.run(cli, args.row, args.payload)
        err = run_err
        if not err then
            local _, merge_err = admission.merge(args.row, current)
            err = merge_err
        end
    end
    process.send(args.reply_pid, args.reply_topic, {ok = err == nil, error = err and tostring(err) or nil})
    local inbox, events = process.inbox(), process.events()
    channel.select({inbox:case_receive(), events:case_receive()})
end
return {main = main}
