return {get_user_with_groups = function(identifier: string): (any?, error?)
    return nil, (errors.new({kind = errors.UNAVAILABLE, retryable = true,
        message = "subject directory is unavailable"}) :: error)
end}
