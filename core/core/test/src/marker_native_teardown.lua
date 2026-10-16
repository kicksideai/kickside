local fixture = require("fixture")
return {purge_thread = function(db, id, owner)
    fixture.calls = fixture.calls + 1
    fixture.db, fixture.purge_id, fixture.owner = db, id, owner
    return fixture.purged, fixture.purge_error
end}
