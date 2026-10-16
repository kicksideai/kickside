local migration_core = require("migration_core")
return {define = function(fn)
    return {implementations = migration_core.define(fn)}
end}
