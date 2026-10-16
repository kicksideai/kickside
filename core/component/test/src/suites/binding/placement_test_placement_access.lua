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










        test.it("grant_subtree gives READ on a deep descendant; revoke_subtree removes it", function()
            local root = register(nil, nil)
            local mid = register(root, nil)
            local leaf = register(mid, nil)

            local viewer = "viewer-" .. suffix

            -- Before grant: viewer cannot read the leaf.
            local before = run_as(viewer, {}, GET_ACCESS, { component_id = leaf })
            test.is_false(before.success == true)

            local g = as_owner(GRANT_SUBTREE, {
                root_component_id = root,
                subject = { subject_id = viewer, subject_type = "user" },
                access_mask = ACCESS.READ
            })
            test.is_true(g.success, "grant_subtree: " .. tostring(g.error))
            test.is_true(g.affected >= 3, "subtree grant must report root + descendants, got " .. tostring(g.affected))

            local after = run_as(viewer, {}, GET_ACCESS, { component_id = leaf })
            test.is_true(after.success)
            test.eq(after.access_level, ACCESS.READ)

            local r = as_owner(REVOKE_SUBTREE, {
                root_component_id = root,
                subject = { subject_id = viewer, subject_type = "user" }
            })
            test.is_true(r.success)

            local revoked = run_as(viewer, {}, GET_ACCESS, { component_id = leaf })
            test.is_false(revoked.success == true)
        end)

        test.it("subtree group grant resolves for a member; non-members excluded", function()
            local root = register(nil, nil)
            local leaf = register(root, nil)
            local grp = "grp-sub-" .. suffix

            local g = as_owner(GRANT_SUBTREE, {
                root_component_id = root,
                subject = { subject_id = grp, subject_type = "group" },
                access_mask = ACCESS.READ
            })
            test.is_true(g.success, "subtree group grant: " .. tostring(g.error))

            -- Member of the group reads the leaf via group resolution.
            local member = run_as("member-" .. suffix, { grp }, GET_ACCESS, { component_id = leaf })
            test.is_true(member.success)
            test.eq(member.access_level, ACCESS.READ)

            -- Non-member is excluded.
            local stranger = run_as("stranger-" .. suffix, {}, GET_ACCESS, { component_id = leaf })
            test.is_false(stranger.success == true)
        end)


        test.it("move re-syncs inheritance: old-chain grant vanishes, new-chain appears", function()
            local a = register(nil, nil)
            local b = register(nil, nil)
            local va = "va-" .. suffix
            local vb = "vb-" .. suffix
            -- Distinct masks (va READ, vb FULL) so the post-move level proves which
            -- ancestor's grant materialized rather than a stale carry-over.
            as_owner(GRANT_SUBTREE, { root_component_id = a, subject = { subject_id = va, subject_type = "user" }, access_mask = ACCESS.READ })
            as_owner(GRANT_SUBTREE, { root_component_id = b, subject = { subject_id = vb, subject_type = "user" }, access_mask = ACCESS.FULL })

            local leaf = register(a, nil)
            -- Under A: va sees it (inherited READ), vb does not.
            test.is_true(run_as(va, {}, GET_ACCESS, { component_id = leaf }).success)
            test.is_false(run_as(vb, {}, GET_ACCESS, { component_id = leaf }).success == true)

            -- Move the leaf under B.
            local mv = as_owner(SET_PLACEMENT, { component_id = leaf, parent_id = b })
            test.is_true(mv.success, "move: " .. tostring(mv.error))

            -- vb now inherits B's FULL grant; va's inherited grant is gone.
            local nowVb = run_as(vb, {}, GET_ACCESS, { component_id = leaf })
            test.is_true(nowVb.success, "vb must gain inherited access after move into B")
            test.eq(nowVb.access_level, ACCESS.FULL)
            test.is_false(run_as(va, {}, GET_ACCESS, { component_id = leaf }).success == true)
        end)

        test.it("direct grant survives a move while inherited access re-syncs", function()
            local a = register(nil, nil)
            local b = register(nil, nil)
            local va = "dva-" .. suffix
            local direct = "direct-" .. suffix
            as_owner(GRANT_SUBTREE, { root_component_id = a, subject = { subject_id = va, subject_type = "user" }, access_mask = ACCESS.READ })

            local leaf = register(a, nil)
            -- A direct grant on the leaf itself (its own subtree root).
            as_owner(GRANT_SUBTREE, { root_component_id = leaf, subject = { subject_id = direct, subject_type = "user" }, access_mask = ACCESS.READ })
            test.is_true(run_as(va, {}, GET_ACCESS, { component_id = leaf }).success)
            test.is_true(run_as(direct, {}, GET_ACCESS, { component_id = leaf }).success)

            as_owner(SET_PLACEMENT, { component_id = leaf, parent_id = b })

            -- Inherited (va) is gone; the direct grant survives the move.
            test.is_false(run_as(va, {}, GET_ACCESS, { component_id = leaf }).success == true)
            local stillDirect = run_as(direct, {}, GET_ACCESS, { component_id = leaf })
            test.is_true(stillDirect.success, "direct grant must survive the move")
            test.eq(stillDirect.access_level, ACCESS.READ)
        end)

        test.it("service subject type: subtree grant to a service resolves for that service principal", function()
            local root = register(nil, nil)
            local leaf = register(root, nil)
            local service = "svc-" .. suffix
            local g = as_owner(GRANT_SUBTREE, {
                root_component_id = root,
                subject = { subject_id = service, subject_type = "service" },
                access_mask = ACCESS.READ
            })
            test.is_true(g.success, "service grant: " .. tostring(g.error))
            local got = run_as("principal:service:" .. service, {}, GET_ACCESS, { component_id = leaf })
            test.is_true(got.success, "service principal must read via its own subject grant")
            test.eq(got.access_level, ACCESS.READ)
        end)


        test.it("moving a subtree preserves an internal grant and re-syncs external ones", function()
            local rootA = register(nil, nil)
            local rootB = register(nil, nil)
            local mid = register(rootA, nil)
            local leaf = register(mid, nil)
            local vInternal = "v-internal-" .. suffix  -- granted on mid (moves with it)
            local vA = "v-a-" .. suffix                 -- granted on rootA (old chain)
            local vB = "v-b-" .. suffix                 -- granted on rootB (new chain)
            as_owner(GRANT_SUBTREE, { root_component_id = mid, subject = { subject_id = vInternal, subject_type = "user" }, access_mask = ACCESS.READ })
            as_owner(GRANT_SUBTREE, { root_component_id = rootA, subject = { subject_id = vA, subject_type = "user" }, access_mask = ACCESS.READ })
            as_owner(GRANT_SUBTREE, { root_component_id = rootB, subject = { subject_id = vB, subject_type = "user" }, access_mask = ACCESS.READ })

            -- Under A: internal + A reach leaf; B does not.
            test.is_true(run_as(vInternal, {}, GET_ACCESS, { component_id = leaf }).success)
            test.is_true(run_as(vA, {}, GET_ACCESS, { component_id = leaf }).success)
            test.is_false(run_as(vB, {}, GET_ACCESS, { component_id = leaf }).success == true)

            -- Move the mid subtree (mid + leaf) under rootB.
            local mv = as_owner(SET_PLACEMENT, { component_id = mid, parent_id = rootB })
            test.is_true(mv.success, "move: " .. tostring(mv.error))

            -- Internal grant rides along; A's drops on both nodes; B's now reaches both.
            test.is_true(run_as(vInternal, {}, GET_ACCESS, { component_id = leaf }).success)
            test.is_true(run_as(vInternal, {}, GET_ACCESS, { component_id = mid }).success)
            test.is_false(run_as(vA, {}, GET_ACCESS, { component_id = leaf }).success == true)
            test.is_true(run_as(vB, {}, GET_ACCESS, { component_id = leaf }).success)
            test.is_true(run_as(vB, {}, GET_ACCESS, { component_id = mid }).success)
        end)


        test.it("a subtree grant reaches children created later (cascade is the only mode)", function()
            local root = register(nil, nil)
            local viewer = "cascade-" .. suffix
            as_owner(GRANT_SUBTREE, { root_component_id = root, subject = { subject_id = viewer, subject_type = "user" }, access_mask = ACCESS.READ })
            local child = register(root, nil)
            test.is_true(run_as(viewer, {}, GET_ACCESS, { component_id = child }).success)
        end)

        local function access_row(res, sid)
            if not res or type(res.access) ~= "table" then return nil end
            for _, r in ipairs(res.access) do
                if r.subject_id == sid then return r end
            end
            return nil
        end

        test.it("list_access returns direct grants only; inherited grants are managed at the source", function()
            local root = register(nil, nil)
            local child = register(root, nil)
            local viewer = "la-viewer-" .. suffix
            as_owner(GRANT_SUBTREE, { root_component_id = root, subject = { subject_id = viewer, subject_type = "user" }, access_mask = ACCESS.READ })

            -- viewer can read the child (inherited), but the child's grant is sourced
            -- at root, so it lists on root and NOT on the child.
            test.is_true(run_as(viewer, {}, GET_ACCESS, { component_id = child }).success)
            local on_root = as_owner("list_access", { component_id = root })
            local on_child = as_owner("list_access", { component_id = child })
            test.is_true(on_root.success)
            test.not_nil(access_row(on_root, viewer))
            test.is_nil(access_row(on_child, viewer))

            -- A direct grant on the child DOES list there (one row, not duplicated by
            -- the inherited copy).
            as_owner(GRANT_SUBTREE, { root_component_id = child, subject = { subject_id = viewer, subject_type = "user" }, access_mask = ACCESS.READ })
            local on_child2 = as_owner("list_access", { component_id = child })
            test.not_nil(access_row(on_child2, viewer))
            local count = 0
            for _, r in ipairs(on_child2.access) do if r.subject_id == viewer then count = count + 1 end end
            test.eq(count, 1)
        end)

        test.it("multi-source: effective access is MAX of ancestor grants; revoking one source keeps the other", function()
            local gp = register(nil, nil)
            local parent = register(gp, nil)
            local child = register(parent, nil)
            local viewer = "ms-viewer-" .. suffix

            -- Granted READ at the grandparent and FULL at the parent. The child inherits
            -- both sources; effective access is the MAX.
            as_owner(GRANT_SUBTREE, { root_component_id = gp, subject = { subject_id = viewer, subject_type = "user" }, access_mask = ACCESS.READ })
            as_owner(GRANT_SUBTREE, { root_component_id = parent, subject = { subject_id = viewer, subject_type = "user" }, access_mask = ACCESS.FULL })
            local both = run_as(viewer, {}, GET_ACCESS, { component_id = child })
            test.is_true(both.success)
            test.eq(both.access_level, ACCESS.FULL)

            -- Revoke the parent grant: the child loses that source but keeps the
            -- grandparent's READ. Effective access drops to READ, not to nothing.
            local rev = as_owner(REVOKE_SUBTREE, { root_component_id = parent, subject = { subject_id = viewer, subject_type = "user" } })
            test.is_true(rev.success)
            local after = run_as(viewer, {}, GET_ACCESS, { component_id = child })
            test.is_true(after.success, "grandparent grant must survive revoking the parent source")
            test.eq(after.access_level, ACCESS.READ)
        end)

    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
