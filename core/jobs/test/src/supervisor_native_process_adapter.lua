local process = require("process")
local fixture = require("fixture")
return {registry = {lookup = fixture.lookup, CONSISTENT = process.registry.CONSISTENT}, send = fixture.send}
