local tool_results = require("tool_results")

local result_exports = { summaries = function(...) return ... end }
result_exports.summaries = tool_results.wrap(result_exports.summaries)
return result_exports
