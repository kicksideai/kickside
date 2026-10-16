return { resolve = function(input: any): (any?, error?)
    if input.id then return { exists = input.id ~= "unknown@northwind.example" }, nil end
    local ref = input.refs[1]
    if ref.id == "unknown@northwind.example" then
        return { principals = { { type = "user", id = ref.id, label = ref.id } } }, nil
    end
    if ref.id == "failure@northwind.example" then return nil, errors.new({message = "Northwind directory failure", kind = errors.UNAVAILABLE, retryable = false,
        details = {code = "directory_dependency", field = "refs"}}) end
    if ref.id == "missing@northwind.example" then return { principals = {} }, nil end
    return { principals = { { type = "user", id = "northwind-member-id", label = "Northwind Member" } } }, nil
end, groups = function(): any
    return { active = true, groups = { "directory-members" } }, nil
end }
