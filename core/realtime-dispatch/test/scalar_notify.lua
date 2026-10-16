return { notify = function(args: any): (any?, error?)
    if type(args.user_id) ~= "string" or args.user_ids ~= nil then
        return nil, errors.new({kind = errors.INVALID, retryable = false,
            message = "scalar owner requires its existing user_id shape", details = {code = "scalar_shape_required"}})
    end
    if args.data and args.data.fail then
        return nil, errors.new({kind = errors.UNAVAILABLE, retryable = false,
            message = "scalar owner fails", details = {code = "scalar_owner_failed", marker = 73}})
    end
    return {success = true}
end }
