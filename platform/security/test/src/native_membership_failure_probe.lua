local classifier = require("classifier")
local fingerprints = require("fingerprints")

local function run(args)
    return classifier.new({fingerprint = fingerprints.fingerprint}).classify(args)
end
return {run = run}
