local lease_release = require("lease_release")
local proc_supervisor = require("proc_supervisor")

-- Publishes one Jobs signal in the caller's frame: a lease release to the
-- registered cleanup consumer, or an execution control to its token owner.
local function run(args: { kind: string, job_id: string, lease_token: string?, execution_seq: integer }): (boolean, error?)
    if args.kind == "release" then
        local release_err = lease_release.notify(args.job_id, args.execution_seq, { kind = "test", id = "signal" })
        return release_err == nil, release_err
    end
    return proc_supervisor.notify(args.job_id, tostring(args.lease_token), args.execution_seq, "revoked", nil)
end

return { run = run }
