return {normalize_writes = function() end, authorize_primary_emit = function(args)
    return {component_id = args.component_id, impl_id = "impl", output = false}, nil
end}
