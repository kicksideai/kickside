local models = require("models")
local fixture = require("fixture")
function run(stage: string, kind: string, retryable: boolean?): (any?, error?)
    local source = errors.new({kind = kind, message = "read-model dependency refusal", retryable = retryable,
        details = {code = "read_model_dependency", nested = {stage = stage}}})
    fixture.reset(stage, source, {{body = "{}"}})
    return models.get({owner_id = "owner", kind = "model"})
end
return {run = run}
