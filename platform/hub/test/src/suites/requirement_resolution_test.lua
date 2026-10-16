local test = require("test")
local resolver = require("resolver")

local function plan_fixture()
    return {
        graph = {{module = "acme/tools", version = "1.2.3", direct = true}},
        install_payload = {parameters = {}},
        requirements = {
            {module = "acme/tools", transitive = false, required = true, missing = true,
                full_id = "acme.tools:router", parameter_name = "acme.tools:router", description = "Public router", expected_kind = "http.router",
                targets = {{entry = "acme.tools:serve.endpoint", path = ".meta.router"}},
                suggestions = {{value = "app:api", kind = "http.router"}, {value = "app:api.public", kind = "http.router"}}},
            {module = "dep/child", transitive = true, required = true, missing = true,
                full_id = "dep.child:router", parameter_name = "dep.child:router", value = "app:api", expected_kind = "http.router",
                suggestions = {{value = "app:api"}, {value = "app:api.public"}}},
        },
    }
end

local function dependencies(answer, observe)
    local artifact = {}
    return {
        planner = {plan_install = function(_, args)
            local plan = plan_fixture()
            for _, parameter in ipairs(args.parameters or {}) do
                for _, row in ipairs(plan.requirements) do
                    if row.parameter_name == parameter.name then row.value = parameter.value; row.missing = false end
                end
            end
            return plan, nil
        end},
        json = json,
        evidence = {inspect_module = function(args) artifact = args; return args, nil end,
            inspect_registry = function(args) return args, nil end},
        llm = {structured_output = function(schema, p, options)
            if observe then observe({schema = schema, messages = p:get_messages(), options = options, artifact = artifact}) end
            return {result = answer}, nil
        end},
    }
end

local function define_tests()
    test.describe("Install requirement resolver", function()
        test.it("keeps only requested ambiguous unresolved planner requirements", function()
            local calls = 0
            local result, err = resolver.resolve({component = "acme/tools", requirements = {
                {name = "acme.tools:router"}, {name = "dep.child:router"},
            }}, dependencies({value = "app:api", reason = "Valid candidate"}, function() calls = calls + 1 end))
            test.is_nil(err)
            test.eq(calls, 1)
            test.eq(#result.parameters, 1)
            test.eq(result.parameters[1].name, "acme.tools:router")
        end)
        test.it("rejects invented names and values from the model", function()
            local result, err = resolver.resolve({component = "acme/tools", requirements = {{name = "acme.tools:router"}}},
                dependencies({value = "invented:router", reason = "Invalid candidate"}))
            test.is_nil(err)
            test.eq(#result.parameters, 0)
            test.eq(result.requirements[1].resolution_error.code, "INVALID_CHOICE")
            local empty, empty_err = resolver.resolve({component = "acme/tools", requirements = {{name = "invented:req"}}},
                dependencies({}, function() error("Unknown requirement must not invoke a model") end))
            test.is_nil(empty_err)
            test.eq(#empty.parameters, 0)
        end)
        test.it("re-plans on the server and grounds the result", function()
            local model, candidates, evidence = "", {}, {}
            local result, err = resolver.resolve({component = "acme/tools", requirements = {
                {name = "acme.tools:router", candidates = {{value = "client:lie"}}},
            }}, dependencies({value = "app:api", reason = "Current planner candidate"}, function(request)
                model = request.options.model
                candidates = request.schema.properties.value.enum
                evidence = request.artifact
            end))
            test.is_nil(err)
            test.eq(result.parameters[1].value, "app:api")
            test.eq(model, "class:fast")
            test.eq(evidence.component, "acme/tools")
            test.eq(evidence.version, "1.2.3")
            test.eq(#candidates, 2)
            test.eq(candidates[1], "app:api")
        end)
    end)
end

return {run = test.run_cases(define_tests)}
