local fixture = require("fixture")
local teardown = require("teardown")
return {release_delete = fixture.release_delete, begin_delete = fixture.begin_delete, run_deletable = fixture.run_deletable,
    abandon_delete = fixture.abandon_delete, unregister = fixture.unregister,
    retain_failed_delete = teardown.retain_failed_delete, cleanup_pending = teardown.cleanup_pending}
