local fixture = require("fixture")
local real = require("real")
return {THREAD_CONFLICT = real.THREAD_CONFLICT, check = real.check, insert = fixture.insert, prepare = fixture.prepare, declared_class = fixture.declared_class, class_error = fixture.class_error}
