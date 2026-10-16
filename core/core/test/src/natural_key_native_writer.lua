local fixture = require("fixture")
return {lock_threads_tx = function(tx, dialect, ids)
    local _, err = fixture.result("lock", true)
    return err
end}
