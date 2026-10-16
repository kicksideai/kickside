local fixture = require("fixture")
return {register_thread_component = fixture.register_thread_component, ensure_thread_component = fixture.ensure_thread_component,
    attach = fixture.write, create = fixture.write, remove_thread_component = function() end}
