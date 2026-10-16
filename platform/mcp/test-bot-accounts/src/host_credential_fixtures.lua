return {
    allow = function() return true end,
    invalid = function() return "allowed" end,
    refuse = function()
        return nil, errors.new({kind = errors.PERMISSION_DENIED, message = "fixture credential refusal"})
    end,
}
