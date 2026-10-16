local sql = require("sql")
local test = require("test")
local uuid = require("uuid")
local time = require("time")
local component_reader = require("component_reader") :: any

local function define_tests()
    test.describe("Component Reader", function()
        -- Test data with unique identifiers to avoid conflicts
        local test_data = {
            user_id = "test-reader-" .. uuid.v4():sub(1, 8),
            component_id = uuid.v7(),
            impl_id = "kickside.test:reader_test"
        }

        -- Helper to get database
        local function get_db()
            local db, err = sql.get("app:db")
            if err then
                error("Failed to connect to database: " .. tostring(err))
            end
            return db
        end

        local function create_test_component()
            local db = get_db()
            local ts = time.now():format(time.RFC3339)

            sql.builder.insert("kickside_components"):set_map({
                component_id = test_data.component_id,
                impl_id = test_data.impl_id,
                private_context = '{"test": true}',
                created_at = ts,
                updated_at = ts,
            }):run_with(db):exec()

            sql.builder.insert("kickside_component_access"):set_map({
                access_id = uuid.v7(),
                component_id = test_data.component_id,
                source_component_id = test_data.component_id,
                subject_id = test_data.user_id,
                subject_type = "user",
                access_mask = 15,
                created_at = ts,
            }):run_with(db):exec()

            sql.builder.insert("kickside_component_meta"):set_map({
                meta_id = uuid.v7(),
                component_id = test_data.component_id,
                key = "class",
                value = "test",
                created_at = ts,
                updated_at = ts,
            }):run_with(db):exec()

            sql.builder.insert("kickside_component_meta"):set_map({
                meta_id = uuid.v7(),
                component_id = test_data.component_id,
                key = "provider",
                value = "test_provider",
                created_at = ts,
                updated_at = ts,
            }):run_with(db):exec()

            db:release()
        end

        -- Cleanup helper
        local function cleanup_test_component()
            local db = get_db()
            sql.builder.delete("kickside_component_meta"):where("component_id = ?", test_data.component_id):run_with(db):exec()
            sql.builder.delete("kickside_component_access"):where("component_id = ?", test_data.component_id):run_with(db):exec()
            sql.builder.delete("kickside_components"):where("component_id = ?", test_data.component_id):run_with(db):exec()
            db:release()
        end

        -- Clean up before and after each test
        test.before_each(function()
            cleanup_test_component()
            create_test_component()
        end)

        test.after_each(function()
            cleanup_test_component()
        end)

        test.describe("basic functionality", function()
            test.it("should create a new reader instance", function()
                local reader = component_reader.new()
                test.not_nil(reader)
                test.is_nil(reader._user_id)
                test.is_true(reader._include_meta)
            end)

            test.it("should be immutable", function()
                local reader1 = component_reader.new()
                local reader2 = reader1:with_user("test-user")

                test.neq(reader1, reader2)
                test.is_nil(reader1._user_id)
                test.eq(reader2._user_id, "test-user")
            end)
        end)

        test.describe("component querying", function()
            test.it("should find components by user and component ID", function()
                local reader = component_reader.new()
                    :with_user(test_data.user_id)
                    :with_components(test_data.component_id)

                local components = reader:all()

                test.eq(#components, 1)
                test.eq(components[1].component_id, test_data.component_id)
                test.eq(components[1].impl_id, test_data.impl_id)
            end)

            test.it("should return one component", function()
                local reader = component_reader.new()
                    :with_user(test_data.user_id)
                    :with_components(test_data.component_id)

                local component = reader:one()

                test.not_nil(component)
                test.eq(component.component_id, test_data.component_id)
            end)

            test.it("should count components", function()
                local reader = component_reader.new()
                    :with_user(test_data.user_id)
                    :with_components(test_data.component_id)

                test.eq(reader:count(), 1)
            end)

            test.it("should check if components exist", function()
                local reader = component_reader.new()
                    :with_user(test_data.user_id)
                    :with_components(test_data.component_id)

                test.is_true(reader:exists())

                local non_existent_reader = component_reader.new()
                    :with_user(test_data.user_id)
                    :with_components(uuid.v7())

                test.is_false(non_existent_reader:exists())
            end)
        end)

        test.describe("metadata filtering", function()
            test.it("should filter by metadata even when meta output is disabled", function()
                local reader = component_reader.new()
                    :with_user(test_data.user_id)
                    :with_meta({ provider = "test_provider" })
                    :include_options({ meta = false })

                local components = reader:all()

                test.eq(#components, 1)
                test.eq(components[1].component_id, test_data.component_id)
                test.is_nil(components[1].meta) -- meta not included in output
            end)

            test.it("should not find components with wrong metadata", function()
                local reader = component_reader.new()
                    :with_user(test_data.user_id)
                    :with_meta({ provider = "wrong_provider" })

                test.eq(#reader:all(), 0)
            end)

            test.it("should filter by multiple metadata fields", function()
                local reader = component_reader.new()
                    :with_user(test_data.user_id)
                    :with_meta({ class = "test", provider = "test_provider" })

                local components = reader:all()

                test.eq(#components, 1)
                test.eq(components[1].component_id, test_data.component_id)
            end)

            test.it("AND-combines multiple meta filters: one wrong value excludes the row", function()
                -- class matches, provider does not; the row must be excluded since
                -- every meta filter is a separate AND-ed subquery.
                local reader = component_reader.new()
                    :with_user(test_data.user_id)
                    :with_meta({ class = "test", provider = "wrong_provider" })

                test.eq(#reader:all(), 0)
                test.eq(reader:count(), 0)
            end)

            test.it("combines impl_id and meta filters (both must match)", function()
                local match = component_reader.new()
                    :with_user(test_data.user_id)
                    :with_impl_ids(test_data.impl_id)
                    :with_meta({ class = "test", provider = "test_provider" })

                local components = match:all()
                test.eq(#components, 1)
                test.eq(components[1].component_id, test_data.component_id)

                -- Right meta but a non-matching impl_id removes the row.
                local mismatch = component_reader.new()
                    :with_user(test_data.user_id)
                    :with_impl_ids("kickside.test:does_not_exist")
                    :with_meta({ class = "test", provider = "test_provider" })

                test.eq(#mismatch:all(), 0)
                test.eq(mismatch:count(), 0)
            end)
        end)

        test.describe("text filtering", function()
            test.it("matches a case-insensitive substring of a metadata value, the impl id, or the component id", function()
                local by_meta = component_reader.new():with_user(test_data.user_id):with_text("TEST_PROV")
                test.eq(#by_meta:all(), 1)
                test.eq(by_meta:count(), 1)
                test.eq(#component_reader.new():with_user(test_data.user_id):with_text("reader_test"):all(), 1)
                local id_part = test_data.component_id:sub(-8)
                test.eq(#component_reader.new():with_user(test_data.user_id):with_text(id_part):all(), 1)
            end)

            test.it("treats LIKE metacharacters in the text literally", function()
                local reader = component_reader.new():with_user(test_data.user_id):with_text("test%provider")
                test.eq(#reader:all(), 0)
                test.eq(reader:count(), 0)
                test.eq(#component_reader.new():with_user(test_data.user_id):with_text("no-such-text"):all(), 0)
            end)
        end)

        test.describe("include options", function()
            test.it("should include metadata by default", function()
                local reader = component_reader.new()
                    :with_user(test_data.user_id)
                    :with_components(test_data.component_id)

                local components = reader:all()

                test.eq(#components, 1)
                test.not_nil(components[1].meta)
                test.eq(components[1].meta.class, "test")
                test.eq(components[1].meta.provider, "test_provider")
            end)

            test.it("should exclude metadata when requested", function()
                local reader = component_reader.new()
                    :with_user(test_data.user_id)
                    :with_components(test_data.component_id)
                    :include_options({ meta = false })

                local components = reader:all()

                test.eq(#components, 1)
                test.is_nil(components[1].meta)
            end)

            test.it("should include private context when requested", function()
                local reader = component_reader.new()
                    :with_user(test_data.user_id)
                    :with_components(test_data.component_id)
                    :include_options({ private_context = true })

                local components = reader:all()

                test.eq(#components, 1)
                test.not_nil(components[1].private_context)
                test.is_true(components[1].private_context.test)
            end)

            test.it("should include access level when requested", function()
                local reader = component_reader.new()
                    :with_user(test_data.user_id)
                    :with_components(test_data.component_id)
                    :include_options({ access_level = true })

                local components = reader:all()

                test.eq(#components, 1)
                test.eq(components[1].access_level, 15)
            end)
        end)

        test.describe("filtering", function()
            test.it("should filter by implementation ID", function()
                local reader = component_reader.new()
                    :with_user(test_data.user_id)
                    :with_impl_ids(test_data.impl_id)

                local components = reader:all()

                local found_our_component = false
                for _, comp in ipairs(components) do
                    test.eq(comp.impl_id, test_data.impl_id)
                    if comp.component_id == test_data.component_id then
                        found_our_component = true
                    end
                end
                test.is_true(found_our_component)
            end)

            test.it("should filter by access mask", function()
                local reader = component_reader.new()
                    :with_user(test_data.user_id)
                    :with_components(test_data.component_id)
                    :with_access_mask(1) -- READ; our component has 15 which includes 1

                local components = reader:all()

                test.eq(#components, 1)
                test.eq(components[1].component_id, test_data.component_id)
            end)
        end)

        test.describe("edge cases", function()
            test.it("should handle empty results", function()
                local reader = component_reader.new()
                    :with_user("non-existent-user")

                test.eq(type(reader:all()), "table")
                test.eq(#reader:all(), 0)
                test.is_nil(reader:one())
                test.eq(reader:count(), 0)
                test.is_false(reader:exists())
            end)

            test.it("should handle nil metadata filter", function()
                local reader = component_reader.new()
                    :with_user(test_data.user_id)
                    :with_meta(nil)

                test.eq(type(reader:count()), "number")
            end)

            test.it("a component id that is not a UUID names no component on every engine", function()
                local malformed = "missing-component-" .. uuid.v4()
                local reader = component_reader.new()
                    :with_user(test_data.user_id)
                    :with_components(malformed)
                local rows, all_err = reader:all()
                test.is_nil(all_err, tostring(all_err))
                test.eq(#(rows :: any), 0)
                local one, one_err = reader:one()
                test.is_nil(one_err, tostring(one_err))
                test.is_nil(one)
                local count, count_err = reader:count()
                test.is_nil(count_err, tostring(count_err))
                test.eq(count, 0)

                local mixed, mixed_err = component_reader.new()
                    :with_user(test_data.user_id)
                    :with_components({ malformed, test_data.component_id })
                    :all()
                test.is_nil(mixed_err, tostring(mixed_err))
                test.eq(#(mixed :: any), 1)
                test.eq((mixed :: any)[1].component_id, test_data.component_id)
            end)

            test.it("should handle empty component array", function()
                local reader = component_reader.new()
                    :with_user(test_data.user_id)
                    :with_components({})

                test.eq(type(reader:count()), "number")
            end)
        end)

        test.describe("pagination", function()
            test.it("should limit results", function()
                local reader = component_reader.new()
                    :with_user(test_data.user_id)
                    :limit(1)

                local components = reader:all()

                local valid_count = (#components == 0) or (#components == 1)
                test.is_true(valid_count)
            end)

            test.it("should order results", function()
                local reader = component_reader.new()
                    :with_user(test_data.user_id)
                    :order_by("created_at", "ASC")

                test.eq(type(reader:count()), "number")
            end)

            test.it("rejects invalid order fields before building SQL", function()
                local reader = component_reader.new()
                    :with_user(test_data.user_id)
                    :order_by("created_at; DROP TABLE kickside_components", "ASC")

                local rows, err = reader:all()
                test.is_nil(rows)
                test.not_nil(err)
                test.is_true(tostring(err):find("invalid component order field", 1, true) ~= nil,
                    "unexpected order error: " .. tostring(err))
            end)

            test.it("rejects invalid order directions before building SQL", function()
                local reader = component_reader.new()
                    :with_user(test_data.user_id)
                    :order_by("created_at", "ASC; DROP TABLE kickside_components")

                local row, err = reader:one()
                test.is_nil(row)
                test.not_nil(err)
                test.is_true(tostring(err):find("invalid component order direction", 1, true) ~= nil,
                    "unexpected order error: " .. tostring(err))
            end)

            test.it("rejects a mutated raw order field", function()
                local reader = component_reader.new():with_user(test_data.user_id)
                local mutable = reader :: any
                mutable._order_by = "updated_at DESC; DROP TABLE kickside_components"

                local rows, err = reader:all()
                test.is_nil(rows)
                test.not_nil(err)
                test.is_true(tostring(err):find("invalid component order field", 1, true) ~= nil,
                    "unexpected order error: " .. tostring(err))
            end)

            test.it("count and exists ignore limit/offset and reflect the full filtered set", function()
                -- count() builds its own query without limit/offset, so a limit of 1
                -- must not shrink the reported total for a single-row filter.
                local reader = component_reader.new()
                    :with_user(test_data.user_id)
                    :with_components(test_data.component_id)
                    :limit(1, 0)

                test.eq(reader:count(), 1)
                test.is_true(reader:exists())

                -- An offset past the only matching row yields no rows from all(),
                -- while count()/exists() still see the row.
                local offset_reader = component_reader.new()
                    :with_user(test_data.user_id)
                    :with_components(test_data.component_id)
                    :limit(10, 5)

                test.eq(#offset_reader:all(), 0)
                test.eq(offset_reader:count(), 1)
                test.is_true(offset_reader:exists())
            end)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
