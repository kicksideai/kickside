local real = require("real")
local fixture = require("fixture")
return {is_str = real.is_str, trim = real.trim, actor_id = fixture.actor_id, is_maintenance_actor = fixture.is_maintenance_actor, open_db = real.open_db}
