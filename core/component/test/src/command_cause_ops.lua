local fixture = require("fixture")
return {db_id = function() return "fixture:db" end, declaration_owner = fixture.declaration_owner,
    prepare_identity = function(input, owner) return fixture.prepare("prepare", input, owner) end,
    prepare_declaration = function(input, verify) return fixture.prepare("prepare", input) end,
    prepare_creation = function(input, verify) return fixture.prepare("prepare", input) end,
    set_execution_identity_tx = fixture.work, apply_declaration_tx = fixture.work, create_declared_tx = fixture.work}
