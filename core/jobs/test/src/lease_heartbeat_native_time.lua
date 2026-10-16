local native = require("time")
return {now = native.now, SECOND = native.SECOND, MILLISECOND = native.MILLISECOND,
    after = function(duration) return {case_receive = function(self) return self end} end}
