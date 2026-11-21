local test = require("test")
local nav_badges = require("nav_badges")
local ui_types = require("ui_types")

-- Build a declared badged nav item via the real normalize path so the resolver is
-- exercised end to end.
local function badged_item(id: string, impl: string, field: string, hide_zero: boolean): any
    return {
        id = id,
        badge = ui_types.normalize_badge({
            source = "component_meta",
            component = { scope = "actor", cardinality = "singleton", impl_id = impl },
            field = field,
            field_type = "integer",
            style = "count",
            hide_zero = hide_zero,
            tone = "accent",
        }),
    }
end

-- A nav item with no badge.
local function plain_item(id: string): any
    return { id = id }
end

-- A query stub: returns rows for the requested impl_ids from a fixture keyed by
-- impl_id, and counts invocations to prove a single query.
local function stub_query(rows_by_impl: { [string]: any }, counter: { n: number }): any
    return function(filter: any): (any, any)
        counter.n = counter.n + 1
        local out: { any } = {}
        for _, iid in ipairs(filter.impl_ids) do
            local rs = rows_by_impl[iid]
            if rs then
                for _, r in ipairs(rs) do out[#out + 1] = r end
            end
        end
        return out, nil
    end
end

local function define_tests()
    test.describe("KickSide Nav Badges", function()
        test.it("resolves a value from the actor's component meta, coercing TEXT", function()
            local items: { any } = { badged_item("inbox", "kickside.inbox:inbox_binding", "pending_count", true) }
            local counter = { n = 0 }
            nav_badges.resolve(items, stub_query({
                ["kickside.inbox:inbox_binding"] = {
                    { component_id = "c1", impl_id = "kickside.inbox:inbox_binding", meta = { pending_count = "3" } },
                },
            }, counter))
            local b = items[1].badge
            test.not_nil(b)
            test.eq(b.value, 3)
            test.eq(b.component_id, "c1")
            test.eq(b.tone, "accent")
            test.eq(ui_types.badge_visible(b), true)
        end)

        test.it("hide_zero suppresses a coerced TEXT zero (badge kept for subscription)", function()
            local items: { any } = { badged_item("inbox", "kickside.inbox:inbox_binding", "pending_count", true) }
            local counter = { n = 0 }
            nav_badges.resolve(items, stub_query({
                ["kickside.inbox:inbox_binding"] = {
                    { component_id = "c1", impl_id = "kickside.inbox:inbox_binding", meta = { pending_count = "0" } },
                },
            }, counter))
            local b = items[1].badge
            test.not_nil(b)
            test.eq(b.value, 0)
            test.eq(b.component_id, "c1")
            test.eq(ui_types.badge_visible(b), false)
        end)

        test.it("omits the badge when the actor has no component (fail closed)", function()
            local items: { any } = { badged_item("inbox", "kickside.inbox:inbox_binding", "pending_count", true) }
            local counter = { n = 0 }
            nav_badges.resolve(items, stub_query({}, counter))
            local first: any = items[1]
            test.eq(first.badge, nil)
        end)

        test.it("keeps component_id but no value when the field is absent", function()
            local items: { any } = { badged_item("inbox", "kickside.inbox:inbox_binding", "pending_count", true) }
            local counter = { n = 0 }
            nav_badges.resolve(items, stub_query({
                ["kickside.inbox:inbox_binding"] = {
                    { component_id = "c1", impl_id = "kickside.inbox:inbox_binding", meta = { item_count = "9" } },
                },
            }, counter))
            local b = items[1].badge
            test.not_nil(b)
            test.eq(b.value, nil)
            test.eq(b.component_id, "c1")
            test.eq(ui_types.badge_visible(b), false)
        end)

        test.it("omits the badge when a singleton returns more than one row and no actor is threaded (fail closed)", function()
            local items: { any } = { badged_item("inbox", "kickside.inbox:inbox_binding", "pending_count", true) }
            local counter = { n = 0 }
            nav_badges.resolve(items, stub_query({
                ["kickside.inbox:inbox_binding"] = {
                    { component_id = "c1", impl_id = "kickside.inbox:inbox_binding", meta = { pending_count = "1" } },
                    { component_id = "c2", impl_id = "kickside.inbox:inbox_binding", meta = { pending_count = "2" } },
                },
            }, counter))
            test.eq(items[1].badge, nil)
        end)

        -- scope=actor singleton: an admin can READ many users' inbox components, so the
        -- access-filtered read returns several rows for one impl_id. The badge must still
        -- resolve to the ACTOR'S OWN row (matched by protected custody), never another user's,
        -- and never drop just because more than one row is readable.
        test.it("resolves a scope=actor singleton to the actor's OWN component among many readable rows", function()
            local items: { any } = { badged_item("inbox", "kickside.inbox:inbox_binding", "pending_count", true) }
            local counter = { n = 0 }
            nav_badges.resolve(items, stub_query({
                ["kickside.inbox:inbox_binding"] = {
                    { component_id = "other", impl_id = "kickside.inbox:inbox_binding", principal_owner = "user-2", meta = { owner = "admin", pending_count = "9" } },
                    { component_id = "own", impl_id = "kickside.inbox:inbox_binding", principal_owner = "admin", meta = { pending_count = "1" } },
                    { component_id = "other2", impl_id = "kickside.inbox:inbox_binding", principal_owner = "user-3", meta = { pending_count = "5" } },
                },
            }, counter), nil, "admin")
            local b = items[1].badge
            test.not_nil(b)
            test.eq(b.value, 1)
            test.eq(b.component_id, "own")
            test.eq(ui_types.badge_visible(b), true)
        end)

        test.it("resolves the actor's own single readable row when the owner is threaded", function()
            local items: { any } = { badged_item("inbox", "kickside.inbox:inbox_binding", "pending_count", true) }
            nav_badges.resolve(items, stub_query({
                ["kickside.inbox:inbox_binding"] = {
                    { component_id = "own", impl_id = "kickside.inbox:inbox_binding", principal_owner = "user-7", meta = { pending_count = "2" } },
                },
            }, { n = 0 }), nil, "user-7")
            local b = items[1].badge
            test.not_nil(b)
            test.eq(b.value, 2)
            test.eq(b.component_id, "own")
        end)

        test.it("hide_zero suppresses the actor's own zero among many readable rows (badge kept)", function()
            local items: { any } = { badged_item("inbox", "kickside.inbox:inbox_binding", "pending_count", true) }
            nav_badges.resolve(items, stub_query({
                ["kickside.inbox:inbox_binding"] = {
                    { component_id = "other", impl_id = "kickside.inbox:inbox_binding", principal_owner = "user-2", meta = { pending_count = "9" } },
                    { component_id = "own", impl_id = "kickside.inbox:inbox_binding", principal_owner = "admin", meta = { pending_count = "0" } },
                },
            }, { n = 0 }), nil, "admin")
            local b = items[1].badge
            test.not_nil(b)
            test.eq(b.value, 0)
            test.eq(b.component_id, "own")
            test.eq(ui_types.badge_visible(b), false)
        end)

        test.it("omits the badge when the actor owns none of the readable rows (fail closed)", function()
            local items: { any } = { badged_item("inbox", "kickside.inbox:inbox_binding", "pending_count", true) }
            nav_badges.resolve(items, stub_query({
                ["kickside.inbox:inbox_binding"] = {
                    { component_id = "other", impl_id = "kickside.inbox:inbox_binding", principal_owner = "user-2", meta = { pending_count = "9" } },
                },
            }, { n = 0 }), nil, "admin")
            test.eq(items[1].badge, nil)
        end)

        test.it("batches actor singleton addresses and preserves protected-owner selection for other badges", function()
            local items: { any } = {
                badged_item("retained", "test:retained", "pending_count", true),
                badged_item("fresh", "test:fresh", "pending_count", true),
                badged_item("repeated", "test:retained", "pending_count", true),
                badged_item("owned", "test:owned", "pending_count", true),
            }
            local filters: { any } = {}
            local function query(filter: any): (any, any)
                filters[#filters + 1] = filter
                if filter.component_ids then
                    return {
                        { component_id = "wrong-id", impl_id = "test:retained", principal_owner = "actor",
                            meta = { pending_count = "9" } },
                        { component_id = "legacy-address", impl_id = "test:retained", meta = { pending_count = "3" } },
                        { component_id = "fresh-address", impl_id = "test:fresh", meta = { pending_count = "0" } },
                    }, nil
                end
                return {
                    { component_id = "owned", impl_id = "test:owned", principal_owner = "actor",
                        meta = { pending_count = "2" } },
                }, nil
            end
            local function singleton_id(impl_id: string, actor_id: string): string?
                test.eq(actor_id, "actor")
                if impl_id == "test:retained" then return "legacy-address" end
                if impl_id == "test:fresh" then return "fresh-address" end
                return nil
            end

            nav_badges.resolve(items, query, 1, "actor", singleton_id)

            test.eq(#filters, 2)
            test.eq(#filters[1].component_ids, 2)
            test.eq(filters[1].component_ids[1], "legacy-address")
            test.eq(filters[1].component_ids[2], "fresh-address")
            test.eq(filters[1].principal_owner, nil)
            test.eq(filters[1].include.meta, true)
            test.eq(filters[1].access_mask, 1)
            test.eq(#filters[2].impl_ids, 1)
            test.eq(filters[2].impl_ids[1], "test:owned")
            test.eq(filters[2].principal_owner, "actor")
            test.eq(filters[2].include.principal_owner, true)
            test.eq(filters[2].access_mask, 1)
            test.eq(items[1].badge.value, 3)
            test.eq(items[1].badge.component_id, "legacy-address")
            test.eq(items[2].badge.component_id, "fresh-address")
            test.eq(ui_types.badge_visible(items[2].badge), false)
            test.eq(items[3].badge.value, 3)
            test.eq(items[4].badge.value, 2)
        end)

        test.it("omits a provisioned badge without an exact readable binding and address", function()
            local items: { any } = { badged_item("single", "test:personal", "pending_count", true) }
            local queries = 0
            nav_badges.resolve(items, function(filter: any): (any, any)
                queries = queries + 1
                test.eq(filter.component_ids[1], "actor-address")
                return {
                    { component_id = "actor-address", impl_id = "test:wrong", meta = { pending_count = "4" } },
                    { component_id = "other-address", impl_id = "test:personal", principal_owner = "actor",
                        meta = { owner = "actor", pending_count = "3" } },
                }, nil
            end, 1, "actor", function(): string return "actor-address" end)
            test.eq(queries, 1)
            test.eq(items[1].badge, nil)
        end)

        test.it("leaves a non-badged item untouched", function()
            local items: { any } = {
                plain_item("home"),
                badged_item("inbox", "kickside.inbox:inbox_binding", "pending_count", true),
            }
            local counter = { n = 0 }
            nav_badges.resolve(items, stub_query({
                ["kickside.inbox:inbox_binding"] = {
                    { component_id = "c1", impl_id = "kickside.inbox:inbox_binding", meta = { pending_count = "2" } },
                },
            }, counter))
            test.eq((items[1] :: any).badge, nil)
            test.eq((items[2] :: any).badge.value, 2)
        end)

        test.it("issues exactly one query for many badges", function()
            local items: { any } = {
                badged_item("inbox", "kickside.inbox:inbox_binding", "pending_count", true),
                badged_item("other", "kickside.other:binding", "pending_count", true),
                -- second item on the same impl to prove impl_ids are deduped
                badged_item("inbox2", "kickside.inbox:inbox_binding", "pending_count", true),
            }
            local counter = { n = 0 }
            nav_badges.resolve(items, stub_query({
                ["kickside.inbox:inbox_binding"] = {
                    { component_id = "c1", impl_id = "kickside.inbox:inbox_binding", meta = { pending_count = "4" } },
                },
                ["kickside.other:binding"] = {
                    { component_id = "c2", impl_id = "kickside.other:binding", meta = { pending_count = "7" } },
                },
            }, counter))
            test.eq(counter.n, 1)
            test.eq(items[1].badge.value, 4)
            test.eq(items[2].badge.value, 7)
            test.eq(items[3].badge.value, 4)
        end)

        test.it("selects active_tone only when a truthy boolean tone_field is set", function()
            local spec = ui_types.normalize_badge({
                source = "component_meta",
                component = { scope = "actor", cardinality = "singleton", impl_id = "kickside.inbox:inbox_binding" },
                field = "pending_count",
                field_type = "integer",
                style = "count",
                hide_zero = true,
                tone = "accent",
                active_tone = "danger",
                tone_field = "has_urgent",
            })
            local active: { any } = { { id = "a", badge = spec } }
            nav_badges.resolve(active, stub_query({
                ["kickside.inbox:inbox_binding"] = {
                    { component_id = "c1", impl_id = "kickside.inbox:inbox_binding", meta = { pending_count = "2", has_urgent = "true" } },
                },
            }, { n = 0 }))
            test.eq(active[1].badge.tone, "danger")

            local calm: { any } = { { id = "a", badge = ui_types.normalize_badge({
                source = "component_meta",
                component = { scope = "actor", cardinality = "singleton", impl_id = "kickside.inbox:inbox_binding" },
                field = "pending_count", field_type = "integer", style = "count", hide_zero = true,
                tone = "accent", active_tone = "danger", tone_field = "has_urgent",
            }) } }
            nav_badges.resolve(calm, stub_query({
                ["kickside.inbox:inbox_binding"] = {
                    { component_id = "c1", impl_id = "kickside.inbox:inbox_binding", meta = { pending_count = "2", has_urgent = "false" } },
                },
            }, { n = 0 }))
            test.eq(calm[1].badge.tone, "accent")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(o: any): any return run_cases(o) end }
