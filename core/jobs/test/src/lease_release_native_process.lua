local process = require("process")
local fixture = require("fixture")
return {registry = {CONSISTENT = process.registry.CONSISTENT, lookup = fixture.lookup}, send = fixture.send}
