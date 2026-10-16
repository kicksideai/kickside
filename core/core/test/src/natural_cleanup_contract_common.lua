local fixture = require("fixture")
return {
    open_db = fixture.open_db,
    declared_identity = fixture.declared_identity,
    actor_id = fixture.actor_id,
    actor_principal = fixture.actor_principal,
    is_maintenance_actor = fixture.is_maintenance_actor,
    emit_update = fixture.emit_update,
}
