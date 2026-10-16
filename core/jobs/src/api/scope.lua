local scope = {}
-- The Core threads contract resolves authorized component ids before calling
-- Jobs. Jobs accepts only those resolved thread ids and never queries Core.
function scope.only_thread_ids(thread_ids: any): (string[]?, error?)
    if type(thread_ids) ~= "table" then
        return nil, (errors.new({ message = "thread ids must be a list", kind = errors.INVALID }) :: error)
    end
    local ids: string[] = {}
    local seen: { [string]: boolean } = {}
    for _, value in ipairs(thread_ids) do
        if type(value) ~= "string" or value == "" then
            return nil, (errors.new({ message = "thread ids must contain nonempty strings", kind = errors.INVALID }) :: error)
        end
        if not seen[value] then
            ids[#ids + 1] = value
            seen[value] = true
        end
    end
    table.sort(ids)
    return ids, nil
end

return scope
