local adapter = require("adapter")
return { get_storage = function(storage_id) return adapter.get(storage_id) end }
