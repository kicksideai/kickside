-- Placement tests: hierarchy registration, list_children ordering, re-parenting
-- with path re-materialization, cycle rejection, lexorank reorder, explicit delete
-- child policy, subtree grant/revoke (including group resolution), and
-- plain register/list. Runs on SQLite and PostgreSQL.

local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local time = require("time")
local contract = require("contract")
local security = require("security")

local DB = "app:db"
local COMPONENT_SERVICE = "kickside.component:component_service"
local REGISTER = "register"
local SET_PLACEMENT = "set_placement"
local LIST_CHILDREN = "list_children"
local GET_COMPONENT = "get"
local GET_ACCESS = "get_access_context"
local LIST = "list"
local GRANT_SUBTREE = "grant_subtree"
local REVOKE_SUBTREE = "revoke_subtree"

local ACCESS = { READ = 1, WRITE = 2, DELETE = 4, ADMIN = 8, FULL = 15 }

local function define_tests()
    test.describe("Component placement", function()
        local suffix = uuid.v4():sub(1, 8)
        local owner = "owner-" .. suffix
        local impl = "kickside.test:placement"

        local function test_scope()
            local pol, perr = security.policy("app:test_scope_policy")
            if not pol then error("test policy missing: " .. tostring(perr)) end
            return security.new_scope({ pol })
        end

        local function run_as(user_id: string, groups: {string}, target: string, args: any): (any, any?)
            local actor = security.new_actor(user_id, { security_groups = groups or {} })
            local svc, cerr = contract.get(COMPONENT_SERVICE)
            if cerr or not svc then error("component_service unavailable: " .. tostring(cerr)) end
            local inst, oerr = (svc :: any):with_actor(actor):with_scope(test_scope()):open()
            if oerr or not inst then error("open component_service failed: " .. tostring(oerr)) end
            return inst[target](inst, args)
        end

        -- Owner-scoped call helper (the actor that holds FULL access).
        local function as_owner(target, args)
            return run_as(owner, {}, target, args)
        end

        -- Read a stored row directly for path assertions.
        local function read_row(cid)
            local d, e = sql.get(DB)
            if e then error(tostring(e)) end
            local rows, qerr = sql.builder.select("component_id", "parent_id", "position", "path")
                :from("kickside_components")
                :where("component_id = ?", cid)
                :run_with(d):query()
            d:release()
            if qerr then error(tostring(qerr)) end
            return rows and rows[1] or nil
        end

        local function register(parent_id, position)
            local res, err = as_owner(REGISTER, {
                impl_id = impl,
                meta = { class = "placement_test" },
                parent_id = parent_id,
                position = position
            })
            if err then error("register call failed: " .. tostring(err)) end
            if not res or not res.success then
                error("register failed: " .. tostring(res and res.error))
            end
            return res.component_id
        end

        local function child_ids(res)
            local ids = {}
            if res and type(res.components) == "table" then
                for _, c in ipairs(res.components) do
                    ids[#ids + 1] = c.component_id
                end
            end
            return ids
        end

        local function index_of(list, v)
            for i, x in ipairs(list) do
                if x == v then return i end
            end
            return nil
        end







        test.it("refuses deleting a component with direct children without child_policy", function()
            local parent = register(nil, nil)
            local kid = register(parent, nil)
            local grandkid = register(kid, nil)

            local del = as_owner("delete", { component_id = parent })
            test.is_false(del.success)
            test.contains(tostring(del.error), "child components")

            local parent_row = read_row(parent)
            local kid_row = read_row(kid)
            local gk_row = read_row(grandkid)
            test.not_nil(parent_row)
            test.eq(kid_row.parent_id, parent)
            test.eq(gk_row.parent_id, kid)
        end)

        test.it("reparent_root child_policy detaches direct children to root", function()
            local parent = register(nil, nil)
            local kid = register(parent, nil)
            local grandkid = register(kid, nil)

            local del = as_owner("delete", { component_id = parent, child_policy = "reparent_root" })
            test.is_true(del.success)

            -- kid is orphaned to root: parent_id NULL, path re-rooted.
            local kid_row = read_row(kid)
            test.not_nil(kid_row)
            test.is_nil(kid_row.parent_id)

            -- Grandkid still descends from kid's new root path.
            local gk_row = read_row(grandkid)
            test.not_nil(gk_row)
            test.is_true(tostring(gk_row.path):find(tostring(kid_row.path), 1, true) == 1)

            -- kid now appears at root in list_children.
            local res = as_owner(LIST_CHILDREN, { parent_id = nil })
            test.is_true(index_of(child_ids(res), kid) ~= nil)
        end)

        test.it("deletes a childless component without child_policy", function()
            local lone = register(nil, nil)
            local del = as_owner("delete", { component_id = lone })
            test.is_true(del.success)
            test.is_nil(read_row(lone))
        end)







        test.it("deleting an ancestor strips inherited grants from re-rooted descendants", function()
            local root = register(nil, nil)
            local mid = register(root, nil)
            local leaf = register(mid, nil)
            local viewer = "orphan-viewer-" .. suffix
            as_owner(GRANT_SUBTREE, { root_component_id = root, subject = { subject_id = viewer, subject_type = "user" }, access_mask = ACCESS.READ })
            -- viewer inherits root's grant on mid and leaf.
            test.is_true(run_as(viewer, {}, GET_ACCESS, { component_id = mid }).success)
            test.is_true(run_as(viewer, {}, GET_ACCESS, { component_id = leaf }).success)

            -- Delete root: mid re-roots; root's grant no longer reaches the subtree.
            local del = as_owner("delete", { component_id = root, child_policy = "reparent_root" })
            test.is_true(del.success)

            -- The inherited grant sourced from the deleted root must be gone.
            test.is_false(run_as(viewer, {}, GET_ACCESS, { component_id = mid }).success == true)
            test.is_false(run_as(viewer, {}, GET_ACCESS, { component_id = leaf }).success == true)
        end)




        local function access_row(res, sid)
            if not res or type(res.access) ~= "table" then return nil end
            for _, r in ipairs(res.access) do
                if r.subject_id == sid then return r end
            end
            return nil
        end



    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
