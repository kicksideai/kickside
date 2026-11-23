local fixture = require("fixture")
return {physical_streams = function() return false end, created = fixture.created, updated = fixture.updated, committed = fixture.committed}
