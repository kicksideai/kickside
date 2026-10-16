return {resolve = function()
    return nil, errors.new({message = "The Component harness grants no execution delegation",
        kind = errors.PERMISSION_DENIED, retryable = false})
end}
