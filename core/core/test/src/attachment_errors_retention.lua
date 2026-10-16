local fixture = require("fixture")
return {upsert = fixture.upsert, find_by_thread = function() return nil, nil end}
