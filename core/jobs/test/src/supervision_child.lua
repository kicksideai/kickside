local function run(input: table): (table?, string?)
    if input.refuse then return nil, "worker refuses supervision batch" end
    return { count = 3 }, nil
end
return { run = run }
