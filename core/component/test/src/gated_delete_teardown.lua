local fixture = require("fixture")
local teardown = require("teardown")
return {deletion_ready = function() return true end, begin_delete = fixture.begin_delete, run_deletable = fixture.run_deletable,
    unregister = fixture.unregister,
    cleanup_pending = teardown.cleanup_pending}
