local process = require("process")
return {select = function(cases) return {channel = cases[1], value = {kind = process.event.CANCEL}} end}
