local fixture = require("fixture")
return {validate_public_meta_changes = fixture.validate_public_meta_changes, db_id = fixture.db_id, ACCESS = fixture.ACCESS, COMMAND_TYPES = fixture.COMMAND_TYPES,
    check_user_access = fixture.check_user_access, dispatch = fixture.dispatch, component_summary_tx = fixture.component_summary_tx}
