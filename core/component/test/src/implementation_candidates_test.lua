local access_subjects = require("access_subjects")
local component_query = require("component_query")
local component_reader = require("component_reader") :: any
local implementation_access = require("implementation_access")
local sql = require("sql")
local test = require("test")
local time = require("time")
local uuid = require("uuid")

local function with_actor(user_id: string, groups: { string }?, access_filter: any?, body: any)
    local original = rawget(access_subjects, "_security")
    rawset(access_subjects, "_security", {
        actor = function()
            return {
                id = function() return user_id end,
                meta = function() return { security_groups = groups, access_filter = access_filter } end,
            }
        end,
    })
    local ok, err = pcall(body)
    rawset(access_subjects, "_security", original)
    if not ok then error(err) end
end

local function define_tests()
    test.describe("scoped implementation candidates", function()
        local suffix = uuid.v4():sub(1, 8)
        local owner, member, outsider, group = "candidate-owner-" .. suffix, "candidate-member-" .. suffix,
            "candidate-outsider-" .. suffix, "candidate-group-" .. suffix
        local root, child, grouped, hidden = uuid.v7(), uuid.v7(), uuid.v7(), uuid.v7()
        local ids = { root, child, grouped, hidden }
        local impl = {
            root = "candidate.root:" .. suffix,
            child = "candidate.child:" .. suffix,
            grouped = "candidate.group:" .. suffix,
            hidden = "candidate.hidden:" .. suffix,
        }

        local function db()
            local value, err = sql.get("app:db")
            if err or not value then error("db connect failed: " .. tostring(err)) end
            return value
        end

        local function execute(command)
            local _, err = command:exec()
            test.is_nil(err, tostring(err))
        end

        local function release(d)
            local _, err = d:release()
            test.is_nil(err, tostring(err))
        end

        local function insert_component(d, component_id, impl_id, parent_id)
            local stamp = time.now():format(time.RFC3339)
            execute(sql.builder.insert("kickside_components"):set_map({
                component_id = component_id, impl_id = impl_id, parent_id = parent_id,
                private_context = "{}", created_at = stamp, updated_at = stamp,
            }):run_with(d))
            execute(sql.builder.insert("kickside_component_ancestor"):set_map({
                component_id = component_id, ancestor_id = component_id, depth = 0,
            }):run_with(d))
            if parent_id then
                execute(sql.builder.insert("kickside_component_ancestor"):set_map({
                    component_id = component_id, ancestor_id = parent_id, depth = 1,
                }):run_with(d))
            end
        end

        local function grant(d, component_id, subject_type, subject_id)
            execute(sql.builder.insert("kickside_component_access"):set_map({
                access_id = uuid.v7(), component_id = component_id, source_component_id = component_id,
                subject_type = subject_type, subject_id = subject_id, access_mask = 1,
                created_at = time.now():format(time.RFC3339),
            }):run_with(d))
        end

        local function add_meta(d, component_id, value)
            execute(sql.builder.insert("kickside_component_meta"):set_map({
                meta_id = uuid.v7(), component_id = component_id, key = "candidate-class", value = value,
                created_at = time.now():format(time.RFC3339), updated_at = time.now():format(time.RFC3339),
            }):run_with(d))
        end

        local function seed()
            local d = db()
            insert_component(d, root, impl.root)
            insert_component(d, child, impl.child, root)
            insert_component(d, grouped, impl.grouped)
            insert_component(d, hidden, impl.hidden)
            grant(d, root, "user", owner)
            grant(d, grouped, "group", group)
            add_meta(d, root, "parent")
            add_meta(d, child, "target")
            add_meta(d, grouped, "target")
            release(d)
        end

        local function cleanup()
            local d = db()
            for _, component_id in ipairs(ids) do
                execute(sql.builder.delete("kickside_component_meta"):where("component_id = ?", component_id):run_with(d))
                execute(sql.builder.delete("kickside_component_access"):where("component_id = ?", component_id):run_with(d))
                execute(sql.builder.delete("kickside_component_ancestor"):where("component_id = ?", component_id):run_with(d))
                execute(sql.builder.delete("kickside_components"):where("component_id = ?", component_id):run_with(d))
            end
            release(d)
        end

        local function seen(rows)
            local output = {}
            for _, row in ipairs(rows or {}) do output[row.component_id] = true end
            return output
        end

        local function legacy_query(reader, build)
            local d = db()
            local query, build_err = build(reader)
            if build_err then release(d); error(tostring(build_err)) end
            local narrowed, narrow_err = implementation_access.narrow(d, query)
            if narrow_err then release(d); error(tostring(narrow_err)) end
            local rows, query_err = narrowed:run_with(d):query()
            release(d)
            if query_err then error(tostring(query_err)) end
            return rows or {}
        end

        local function assert_same_as_legacy(reader)
            local actual, actual_err = reader:all()
            test.is_nil(actual_err, tostring(actual_err))
            local legacy = legacy_query(reader, component_query.select)
            local actual_seen, legacy_seen = seen(actual), seen(legacy)
            for _, component_id in ipairs(ids) do
                test.eq(actual_seen[component_id] == true, legacy_seen[component_id] == true)
            end

            local count, count_err = reader:count()
            test.is_nil(count_err, tostring(count_err))
            local legacy_count = legacy_query(reader, component_query.count)
            test.eq(count, legacy_count[1].count)

            local one, one_err = reader:one()
            test.is_nil(one_err, tostring(one_err))
            local legacy_one = legacy_query(reader, function(state)
                local query, err = component_query.select(state)
                if err then return nil, err end
                return query:limit(1), nil
            end)
            test.eq(one and one.component_id, legacy_one[1] and legacy_one[1].component_id)

            local exists, exists_err = reader:exists()
            test.is_nil(exists_err, tostring(exists_err))
            test.eq(exists, (legacy_count[1].count or 0) > 0)
        end

        test.before_each(function() cleanup(); seed() end)
        test.after_each(cleanup)

        test.it("matches the legacy global implementation authorization result for direct, group, inherited, and denied callers", function()
            local cases = {
                { user = owner, groups = {}, expected = { [root] = true, [child] = true } },
                { user = member, groups = { group }, expected = { [grouped] = true } },
                { user = outsider, groups = {}, expected = {} },
                { user = owner, groups = {}, access_filter = { prefixes = {} }, expected = {} },
            }
            for _, case in ipairs(cases) do
                with_actor(case.user, case.groups, case.access_filter, function()
                    local rows, err = component_reader.new():with_user(case.user):with_access_mask(1):all()
                    test.is_nil(err, tostring(err))
                    local actual = seen(rows)
                    for _, component_id in ipairs(ids) do
                        test.eq(actual[component_id] == true, case.expected[component_id] == true)
                    end
                    assert_same_as_legacy(component_reader.new():with_user(case.user):with_access_mask(1))
                end)
            end
        end)

        test.it("uses the same scoped candidates for metadata, placement, OR identity filters, and pagination", function()
            with_actor(owner, {}, nil, function()
                local meta_rows, meta_err = component_reader.new():with_user(owner):with_access_mask(1)
                    :with_meta({["candidate-class"] = "target"}):all()
                test.is_nil(meta_err, tostring(meta_err))
                test.eq(#(meta_rows or {}), 1)
                test.eq((meta_rows or {})[1].component_id, child)
                assert_same_as_legacy(component_reader.new():with_user(owner):with_access_mask(1)
                    :with_meta({["candidate-class"] = "target"}))

                local child_rows, child_err = component_reader.new():with_user(owner):with_access_mask(1)
                    :with_parent(root):all()
                test.is_nil(child_err, tostring(child_err))
                test.eq(#(child_rows or {}), 1)
                test.eq((child_rows or {})[1].component_id, child)
                assert_same_as_legacy(component_reader.new():with_user(owner):with_access_mask(1):with_parent(root))

                local any_reader, any_err = component_reader.new():with_user(owner):with_access_mask(1)
                    :with_components(hidden):with_impl_ids(impl.child):with_id_match("any")
                test.is_nil(any_err, tostring(any_err))
                local any_rows, rows_err = (any_reader :: any):all()
                test.is_nil(rows_err, tostring(rows_err))
                test.eq(#(any_rows or {}), 1)
                test.eq((any_rows or {})[1].component_id, child)
                assert_same_as_legacy(any_reader :: any)

                local paged_rows, page_err = component_reader.new():with_user(owner):with_access_mask(1)
                    :order_by("component_id", "ASC"):limit(1, 1):all()
                test.is_nil(page_err, tostring(page_err))
                test.eq(#(paged_rows or {}), 1)
                test.is_true((paged_rows or {})[1].component_id == root or (paged_rows or {})[1].component_id == child)
                assert_same_as_legacy(component_reader.new():with_user(owner):with_access_mask(1)
                    :order_by("component_id", "ASC"):limit(1, 1))
            end)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
