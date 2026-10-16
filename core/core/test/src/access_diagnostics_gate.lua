local fixture = require("fixture")
return {release_error = function(db: any, primary: error?, committed: boolean?): error? return fixture.gate.release_error(db, primary, committed) end,
    error_response = function(err: error | string, display: string?): (integer, table)
        local status, payload = fixture.gate.error_response(err, display)
        if type(status) ~= "number" or status % 1 ~= 0 or type(payload) ~= "table" then
            error(errors.new({kind = errors.INTERNAL, retryable = false, message = "access guard requires a complete HTTP response"}))
        end
        return status :: integer, payload
    end, ADMIN = 8, WRITE = 2, gate_thread_access = function(...) return fixture.gate.gate_thread_access(...) end,
    failure_response = function(db: any, primary: error, display: string?): (integer, table)
        local status, payload = fixture.gate.failure_response(db, primary, display)
        if type(status) ~= "number" or status % 1 ~= 0 or type(payload) ~= "table" then
            error(errors.new({kind = errors.INTERNAL, retryable = false, message = "access guard requires a complete HTTP response"}))
        end
        return status :: integer, payload
    end}
