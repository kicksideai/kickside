-- List responses report the caller's effective access on each row: the reader's
-- effective mask (union of every grant) surfaces as access_level in both the flat listing
-- and the children listing, so a consumer can distinguish a READ-only share
-- from an owned component without a second query.

local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local time = require("time")
local contract = require("contract")
local security = require("security")

local DB = "app:db"
local COMPONENT_SERVICE = "kickside.component:component_service"

local ACCESS = { READ = 1, FULL = 15 }

local function define_tests()
    test.describe("Component list access_level", function()
        local suffix = uuid.v4():sub(1, 8)
        local user = "u-level-" .. suffix
        local c_full = uuid.v7()
        local c_read = uuid.v7()
        local c_child = uuid.v7()

        local function db()
            local d, e = sql.get(DB)
            if e then error(tostring(e)) end
            return d
        end

        local function insert_component(cid, parent_id)
            local d = db()
            local ts = time.now():format(time.RFC3339)
            local row = {
                component_id = cid,
                impl_id = "kickside.test:lvl",
                private_context = "{}",
                created_at = ts,
                updated_at = ts,
            }
            if parent_id then row.parent_id = parent_id end
            local _, err = sql.builder.insert("kickside_components")
                :set_map(row)
                :run_with(d):exec()
            d:release()
            if err then error("insert_component failed: " .. tostring(err)) end
        end

        local function grant(cid, subject, mask)
            local d = db()
            local _, err = sql.builder.insert("kickside_component_access")
                :set_map({
                    access_id = uuid.v7(),
                    component_id = cid,
                    source_component_id = cid,
                    subject_id = subject,
                    subject_type = "user",
                    access_mask = mask,
                    created_at = time.now():format(time.RFC3339),
                })
                :run_with(d):exec()
            d:release()
            if err then error("grant failed: " .. tostring(err)) end
        end

        local function cleanup()
            local d = db()
            for _, cid in ipairs({ c_full, c_read, c_child }) do
                sql.builder.delete("kickside_component_access"):where("component_id = ?", cid):run_with(d):exec()
                sql.builder.delete("kickside_components"):where("component_id = ?", cid):run_with(d):exec()
            end
            d:release()
        end

        local function test_scope()
            local pol, perr = security.policy("app:test_scope_policy")
            if not pol then error("test policy missing: " .. tostring(perr)) end
            return security.new_scope({ pol })
        end

        local function run_as(user_id: string, target: string, args: any)
            local actor = security.new_actor(user_id, { security_groups = {} })
            local svc, cerr = contract.get(COMPONENT_SERVICE)
            if cerr or not svc then error("component_service unavailable: " .. tostring(cerr)) end
            local inst, oerr = (svc :: any):with_actor(actor):with_scope(test_scope()):open()
            if oerr or not inst then error("open component_service failed: " .. tostring(oerr)) end
            return inst[target](inst, args)
        end

        local function row_for(res, cid)
            if not res or type(res.components) ~= "table" then return nil end
            for _, c in ipairs(res.components) do
                if c.component_id == cid then return c end
            end
            return nil
        end

        test.before_all(function()
            cleanup()
            insert_component(c_full);          grant(c_full, user, ACCESS.FULL)
            insert_component(c_read);          grant(c_read, user, ACCESS.READ)
            insert_component(c_child, c_full); grant(c_child, user, ACCESS.READ)
        end)

        test.after_all(function() cleanup() end)

        test.it("flat listing carries the effective access mask per row", function()
            local res = run_as(user, "list", { filters = { impl_ids = { "kickside.test:lvl" } } })
            test.is_true(res.success, tostring(res.error))

            local full_row = row_for(res, c_full)
            local read_row = row_for(res, c_read)
            test.not_nil(full_row)
            test.not_nil(read_row)
            test.eq((full_row :: any).access_level, ACCESS.FULL)
            test.eq((read_row :: any).access_level, ACCESS.READ)
        end)

        test.it("children listing carries the effective access mask per row", function()
            local res = run_as(user, "list_children", { parent_id = c_full })
            test.is_true(res.success, tostring(res.error))

            local child_row = row_for(res, c_child)
            test.not_nil(child_row)
            test.eq((child_row :: any).access_level, ACCESS.READ)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
