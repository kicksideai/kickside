local automations = require("automations")

return {
    prepare = function(input)
        return {state = {title = input.title}, metadata = {title = input.title}, source = {source_kind = "none"}}
    end,
    select_identity = function(input)
        return automations.set_execution_identity(input.component_id, input)
    end,
    run = function(input)
        return automations.install_type_selected("app:prepared_bot_task", {title = input.title or "Bot task"}, input)
    end,
}
