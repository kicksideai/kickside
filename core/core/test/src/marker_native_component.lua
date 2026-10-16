local fixture = require("fixture")
return {set_runtime_meta = function(id, attrs)
    fixture.id, fixture.attrs = id, attrs
    return fixture.marked, fixture.mark_error
end}
