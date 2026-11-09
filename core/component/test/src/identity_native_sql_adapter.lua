local fixture = require("fixture")
return {get = fixture.get, type = {POSTGRES = "postgres", SQLITE = "sqlite"}}
