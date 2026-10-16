local function run(_input: table): (table?, string?)
    return nil, "worker refused the batch"
end

return { run = run }
