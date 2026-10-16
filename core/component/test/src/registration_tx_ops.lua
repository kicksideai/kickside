local fixture = require("fixture")
return {db_id = fixture.db_id, ACCESS = fixture.ACCESS, COMMAND_TYPES = fixture.COMMAND_TYPES,
    check_user_access = fixture.check_user_access, dispatch = fixture.dispatch, component_summary_tx = fixture.component_summary_tx}
