local fixture = require("fixture")
local real = require("real")
return {register = real.register, has_access = real.has_access, ensure_thread_type = real.ensure_thread_type, remove = real.remove, impl_id = fixture.impl_id}
