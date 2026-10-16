local fixture = require("fixture")
return {notify = function(...): error?
    local _, err = fixture.notify(...)
    return err
end}
