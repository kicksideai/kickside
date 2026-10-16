local M: any = {}
M.ACCESS = {ADMIN = 16}
function M.reset(stage, source)
    M.stage, M.source = stage, source
    M.reads, M.lookups, M.encodes = 0, 0, 0
end
function M.actor() return {id = function() return "actor" end} end
function M.reader()
    local reader: any = {}
    function reader:with_user(value) M.user = value; return self end
    function reader:with_components(value) M.id = value; return self end
    function reader:with_access_mask(value) M.mask = value; return self end
    function reader:include_options(value) M.options = value; return self end
    function reader:one()
        M.reads = M.reads + 1
        if M.stage == "read" then return nil, M.source end
        return {component_id = "component", impl_id = "fixture:implementation", meta = {title = "kept"}, private_context = {marker = "kept"}}, nil
    end
    return reader
end
function M.get(id)
    M.lookups = M.lookups + 1; M.impl = id
    if M.stage == "lookup" then return nil, M.source end
    return {meta = {portable_schema = {}}, data = {contracts = {{contract = "kickside.contract:portable"}}}}, nil
end
function M.build_envelope(input)
    M.input = input
    return {impl_id = input.impl_id, private_context = input.private_context, slots = {{name = "slot"}}}
end
return M
