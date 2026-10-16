-- A job other jobs wait on: its type entry declares meta.job_class awaited.
local function run(_input: any): (any?, error?)
    return { ok = true }, nil
end

return { run = run }
