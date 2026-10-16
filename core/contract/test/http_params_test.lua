local test = require("test")
local params = require("http_params")

local function req(query: { [string]: any }): any
    return {
        query = function(_self: any, key: string): any
            return query[key]
        end,
    }
end

local function response(): any
    local out: any = {}
    return {
        set_status = function(_self: any, status: number): () out.status = status end,
        write_json = function(_self: any, body: any): () out.body = body end,
        out = out,
    }
end

local function define_tests()
    test.describe("HTTP Params", function()
        test.it("parses optional integer query params strictly", function()
            local value, err = params.query_int(req({ limit = "25" }), "limit", nil, { min = 1, max = 100 })
            test.is_nil(err)
            test.eq(value, 25)

            local defaulted, derr = params.query_int(req({}), "limit", 50, { min = 1, max = 100 })
            test.is_nil(derr)
            test.eq(defaulted, 50)
        end)

        test.it("rejects malformed or out-of-range integers", function()
            local _, string_err = params.query_int(req({ limit = "10.5" }), "limit", nil, { min = 1, max = 100 })
            test.is_true(errors.is(string_err, errors.INVALID))
            test.eq(string_err:retryable(), false)
            test.eq(string_err:details().code, "invalid_query_parameter")
            test.eq(string_err:details().parameter, "limit")

            local _, low_err = params.query_int(req({ limit = "0" }), "limit", nil, { min = 1, max = 100 })
            test.is_true(errors.is(low_err, errors.INVALID))
            test.eq(low_err:details().parameter, "limit")

            local _, high_err = params.query_int(req({ limit = "101" }), "limit", nil, { min = 1, max = 100 })
            test.is_true(errors.is(high_err, errors.INVALID))
            test.eq(high_err:details().parameter, "limit")
        end)

        test.it("parses boolean query params explicitly", function()
            local yes, yerr = params.query_bool(req({ ascending = "true" }), "ascending", false)
            test.is_nil(yerr)
            test.eq(yes, true)

            local no, nerr = params.query_bool(req({ ascending = "false" }), "ascending", true)
            test.is_nil(nerr)
            test.eq(no, false)

            local _, berr = params.query_bool(req({ ascending = "yes" }), "ascending", false)
            test.is_true(errors.is(berr, errors.INVALID))
            test.eq(berr:retryable(), false)
            test.eq(berr:details().code, "invalid_query_parameter")
            test.eq(berr:details().parameter, "ascending")
        end)

        test.it("keeps the published message-only bad-request JSON envelope", function()
            local res = response()
            params.bad_request(res, "limit must be >= 1")
            test.eq(res.out.status, 400)
            test.eq(res.out.body.success, false)
            test.eq(res.out.body.error, "limit must be >= 1")
            test.is_nil(res.out.body.kind)
            test.is_nil(res.out.body.retryable)
            test.is_nil(res.out.body.details)
        end)

        test.it("adds native metadata without changing the bad-request envelope", function()
            local _, err = params.query_int(req({ limit = "0" }), "limit", nil, { min = 1 })
            local res = response()
            params.bad_request(res, err:message(), err)
            test.eq(res.out.status, 400)
            test.eq(res.out.body.success, false)
            test.eq(res.out.body.error, "limit must be >= 1")
            test.eq(res.out.body.kind, "Invalid")
            test.eq(res.out.body.retryable, false)
            test.eq(res.out.body.details.code, "invalid_query_parameter")
            test.eq(res.out.body.details.parameter, "limit")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(o) return run_cases(o) end }
