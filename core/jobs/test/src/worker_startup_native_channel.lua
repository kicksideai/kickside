local fixture = require("fixture")
local adapter: any = {new = fixture.new_channel, select = fixture.selection}
return adapter
