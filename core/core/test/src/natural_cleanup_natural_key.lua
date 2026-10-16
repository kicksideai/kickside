local fixture = require("fixture")
return {
    key = fixture.key,
    resolve = fixture.resolve,
    conflict = fixture.conflict,
    transient = function(err) return errors.is(err, errors.CONFLICT) and err:retryable() == true end,
    mark_ready = fixture.mark_ready,
}
