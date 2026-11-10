-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local M: any = {}
function M.reset(options)
    M.options, M.clock, M.reads, M.deleted, M.absent, M.polls = options or {}, 0, 0, {}, {}, 0
end
function M.now()
    local stamp = M.clock
    return {add = function(_, _) return stamp + 30 end, before = function(_, deadline) return stamp < deadline end}
end
function M.sleep(_) end
function M.validate_access(...) return true, nil end
function M.current_runtime_identity() return {id = function() return "caller" end}, {}, nil end
function M.get_component_service()
    return {delete = function(_, args)
        M.deleted[#M.deleted + 1] = args.component_id
        if args.component_id == M.options.fail then return nil, errors.new({message = "teardown refuses", kind = errors.CONFLICT}) end
        if not M.options.active then M.absent[args.component_id] = true end
        return {success = true, job_id = "job"}, nil
    end}, nil
end
function M.get_job(_)
    M.reads = M.reads + 1
    M.polls = M.polls + 1
    if M.polls == 3 then M.absent[M.deleted[#M.deleted]] = true end
    return {status = M.options.terminal or (M.polls == 1 and "pending" or "running"), last_error = "previous attempt fails"}, nil
end
function M.new()
    local r: any = {offset = 0, size = 100}
    function r:with_parent(id) self.parent = id; return self end
    function r:with_components(id) self.id = id; return self end
    function r:with_access_mask(mask) self.mask = mask; return self end
    function r:limit(size, offset) self.size, self.offset = size, offset or 0; return self end
    function r:with_user(_) self.scoped = true; return self end
    function r:include_options(_) return self end
    function r:order_by(...) return self end
    function r:all()
        M.reads = M.reads + 1
        if M.options.expire_read == M.reads then M.clock = 31 end
        local rows = {}
        if M.options.depth then
            local index = self.parent == "parent" and 0 or tonumber(self.parent:sub(7))
            if index < M.options.depth and self.offset == 0 then rows[1] = {component_id = "child-" .. (index + 1)} end
        elseif self.parent == "parent" then
            for index = self.offset + 1, math.min(self.offset + self.size, M.options.width or 1) do
                rows[#rows + 1] = {component_id = "child-" .. index}
            end
        end
        return rows, nil
    end
    function r:one()
        M.reads = M.reads + 1
        if M.options.expire_read == M.reads then M.clock = 31 end
        if self.scoped and self.id == M.options.denied then
            if self.mask == 4 or not M.options.visible then return nil, nil end
        end
        if M.absent[self.id] then
            if M.options.expire_after_removed then M.clock = 31 end
            return nil, nil
        end
        return {component_id = self.id, access_level = 15}, nil
    end
    return r
end
return M
