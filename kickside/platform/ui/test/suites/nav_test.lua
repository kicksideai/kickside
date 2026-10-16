local test = require("test")
local nav = require("nav")
local ui_types = require("ui_types")

-- Declared items injected directly so the suite exercises the merge logic
-- without the registry.
local function declared(): { nav.Item }
    return {
        { id = "a", label = "Home", icon = "i", path = "/", route_name = "home", category = "", order = 0, source = "declared", hidden = false },
        { id = "b", label = "Inbox", icon = "i", path = "/inbox", route_name = "inbox", category = "work", order = 40, source = "declared", hidden = false },
        { id = "c", label = "System", icon = "i", path = "/system", route_name = "system", category = "admin", order = 100, source = "declared", hidden = false },
    }
end

local function declared_plus(extra: { nav.Item }): { nav.Item }
    local out = declared()
    for _, it in ipairs(extra) do out[#out + 1] = it end
    return out
end

local function find_item(result, route_name)
    for _, it in ipairs(result.items) do
        if it.route_name == route_name then return it end
    end
    return nil
end

local function find_cat(result, key)
    for _, c in ipairs(result.categories) do
        if c.key == key then return c end
    end
    return nil
end

local function define_tests()
    test.describe("KickSide Nav", function()
        test.it("defaults to vertical layout and groups declared items", function()
            local r = nav.effective({}, declared())
            test.eq(r.layout, ui_types.LAYOUT.VERTICAL)
            test.eq(#r.items, 3)
            -- root (home), then work, then admin by category order (default 500 each → by label)
            test.not_nil(find_cat(r, ""))
            test.not_nil(find_cat(r, "work"))
        end)

        test.it("honors horizontal layout", function()
            local r = nav.effective({ layout = "horizontal" }, declared())
            test.eq(r.layout, ui_types.LAYOUT.HORIZONTAL)
        end)

        test.it("override hides an item", function()
            local r = nav.effective({ overrides = { inbox = { hidden = true } } }, declared())
            test.eq(find_item(r, "inbox"), nil)
            test.eq(#r.items, 2)
        end)

        test.it("override reorders and recategorizes", function()
            local r = nav.effective({ overrides = { system = { order = 1, category = "work" } } }, declared())
            local sys = find_item(r, "system")
            test.not_nil(sys)
            test.eq(sys.order, 1)
            test.eq(sys.category, "work")
            -- system now lives under the work category
            local work = find_cat(r, "work")
            test.not_nil(work)
            local found = false
            for _, it in ipairs(work.items) do if it.route_name == "system" then found = true end end
            test.eq(found, true)
        end)

        test.it("appends a custom item", function()
            local r = nav.effective({
                custom_items = { { id = "docs", label = "Docs", path = "/docs", category = "work", order = 5 } },
            }, declared())
            local docs = find_item(r, "")
            -- custom item has empty route_name; locate by id
            local present = false
            for _, it in ipairs(r.items) do if it.id == "docs" then present = true; test.eq(it.source, "custom") end end
            test.eq(present, true)
        end)

        test.it("sanitizes custom component tags and unsafe paths", function()
            local r = nav.effective({
                custom_items = {
                    { id = "bad", label = "Bad", path = "//evil.test", render = "component", component_tag = "script" },
                    { id = "good", label = "Good", path = "/good", render = "component", component_tag = "kickside-good" },
                },
            }, {})
            local bad = nil
            local good = nil
            for _, it in ipairs(r.items) do
                if it.id == "bad" then bad = it end
                if it.id == "good" then good = it end
            end
            test.not_nil(bad)
            test.eq(bad.path, "/")
            test.eq(bad.component_tag, "")
            test.not_nil(good)
            test.eq(good.component_tag, "kickside-good")
        end)

        test.it("orders categories by the admin-declared order", function()
            local r = nav.effective({
                categories = {
                    { key = "admin", label = "Administration", order = 10 },
                    { key = "work", label = "Workspace", order = 5 },
                },
            }, declared())
            -- root always first; then work (5) before admin (10)
            test.eq(r.categories[1].key, "")
            test.eq(r.categories[2].key, "work")
            test.eq(r.categories[2].label, "Workspace")
            test.eq(r.categories[3].key, "admin")
        end)

        test.it("drops empty categories", function()
            local r = nav.effective({
                categories = { { key = "empty", label = "Nothing", order = 1 } },
            }, declared())
            test.eq(find_cat(r, "empty"), nil)
        end)

        test.it("labels a module-contributed category, admin categories win the key", function()
            local items = declared_plus({
                { id = "cat-item", label = "Catalog item", icon = "i", path = "/product",
                  route_name = "product", category = "catalog", order = 10, source = "provider", hidden = false },
            })
            -- Contributed category names the group the item asked for.
            local r = nav.effective({}, items, false, { { key = "catalog", title = "Catalog", order = 20 } })
            local catalog = find_cat(r, "catalog")
            test.not_nil(catalog)
            test.eq(catalog.label, "Catalog")
            -- The admin's own category owns the label and order on a key conflict.
            local r2 = nav.effective({ categories = { { key = "catalog", label = "Waren", order = 3 } } },
                items, false, { { key = "catalog", title = "Catalog", order = 20 } })
            local catalog2 = find_cat(r2, "catalog")
            test.not_nil(catalog2)
            test.eq(catalog2.label, "Waren")
            test.eq(catalog2.order, 3)
        end)

        test.it("an unnamed category still renders under its raw key", function()
            local items = declared_plus({
                { id = "orphan", label = "Orphan", icon = "i", path = "/orphan",
                  route_name = "orphan", category = "nameless", order = 10, source = "provider", hidden = false },
            })
            local r = nav.effective({}, items)
            local cat = find_cat(r, "nameless")
            test.not_nil(cat)
            test.eq(cat.label, "nameless")
        end)

        test.it("first source wins a duplicate route_name or path", function()
            -- A dynamic item shadowing the declared /system surface loses; declared
            -- items are collected first (the registry provider has the top priority).
            local items = declared_plus({
                { id = "kind.system", label = "Kind system", icon = "i", path = "/system",
                  route_name = "objects-kind-system", category = "", order = 1, source = "provider", hidden = false },
                { id = "kind.dup", label = "Dup route", icon = "i", path = "/other",
                  route_name = "system", category = "", order = 1, source = "provider", hidden = false },
                { id = "kind.ok", label = "Products", icon = "i", path = "/product",
                  route_name = "objects-kind-product", category = "", order = 1, source = "provider", hidden = false },
            })
            local r = nav.effective({}, items)
            local by_id = {}
            for _, it in ipairs(r.items) do by_id[it.id] = it end
            test.is_nil(by_id["kind.system"])
            test.is_nil(by_id["kind.dup"])
            test.not_nil(by_id["kind.ok"])
            -- The declared surfaces are all still there.
            test.eq(#r.items, 4)
        end)

        test.it("no items means an empty nav, never a registry scan", function()
            local r = nav.effective({})
            test.eq(#r.items, 0)
            test.eq(#r.categories, 0)
        end)

        test.it("normalize_provided demands a stable id and an intact path", function()
            local ok = nav.normalize_provided({
                id = "msmakouz.objects:kind.product", title = "Products", path = "/product",
                route_name = "objects-kind-product", icon = "tabler:package", order = 60,
                render = "component", component_tag = "ui-resource-page",
            }, "msmakouz.objects:nav_provider")
            test.not_nil(ok)
            test.eq(ok.source, "provider")
            test.eq(ok.provider, "msmakouz.objects:nav_provider")
            test.eq(ok.component_tag, "ui-resource-page")
            -- No id, no item: the admin overrides key on it.
            test.is_nil(nav.normalize_provided({ title = "No id", path = "/x" }, "p"))
            -- A path the sanitizer would rewrite is refused outright, so a malformed
            -- path can never collapse to "/" and hijack the landing surface.
            test.is_nil(nav.normalize_provided({ id = "a", title = "Evil", path = "//evil.test" }, "p"))
            test.is_nil(nav.normalize_provided({ id = "a", title = "Scheme", path = "https://evil.test" }, "p"))
            test.is_nil(nav.normalize_provided({ id = "a", title = "Relative", path = "product" }, "p"))
            -- A label is required (an unlabeled row is not a menu entry).
            test.is_nil(nav.normalize_provided({ id = "a", path = "/x" }, "p"))
            -- Unsafe tags are still stripped, exactly as on the declared path.
            local tagged = nav.normalize_provided({ id = "a", title = "T", path = "/x",
                render = "component", component_tag = "script" }, "p")
            test.not_nil(tagged)
            test.eq(tagged.component_tag, "")
        end)

        test.it("derives declared source only from the trusted registry binding", function()
            -- The registry binding is the only trusted declaration source; raw
            -- provider payload cannot choose its own provenance.
            local from_registry = nav.normalize_provided(
                { id = "app:system", title = "System", path = "/system" },
                "kickside.ui:registry_nav_provider_binding", "declared")
            test.not_nil(from_registry)
            test.eq(from_registry.source, "declared")
            test.eq(from_registry.provider, "kickside.ui:registry_nav_provider_binding")
            -- A module cannot pass itself off as a declaration by putting a source
            -- claim in its result; collector-derived provenance always wins.
            for _, claim in ipairs({ "declared", "custom", "trusted", "" }) do
                local it = nav.normalize_provided(
                    { id = "x", title = "X", path = "/x", source = claim }, "acme:nav")
                test.not_nil(it)
                test.eq(it.source, "provider")
                test.eq(it.provider, "acme:nav")
            end
        end)

        test.it("normalize_category accepts title or label and rejects a bad key", function()
            local spec = nav.normalize_category({ key = "catalog", title = "Catalog", icon = "tabler:box", order = 7 })
            test.not_nil(spec)
            test.eq(spec.label, "Catalog")
            test.eq(spec.icon, "tabler:box")
            test.eq(spec.order, 7)
            test.eq(nav.normalize_category({ key = "catalog", label = "Waren" }).label, "Waren")
            test.is_nil(nav.normalize_category({ key = "" }))
            test.is_nil(nav.normalize_category({ key = "bad key" }))
            -- An unset icon stays nil rather than defaulting to the fallback glyph.
            test.is_nil(nav.normalize_category({ key = "plain", title = "Plain" }).icon)
        end)

        test.it("keeps pre-auth logo URLs same-origin and app-owned", function()
            test.eq(ui_types.safe_logo_url(""), "")
            test.eq(ui_types.safe_logo_url("/kickside-branding/logo-a.png"), "/kickside-branding/logo-a.png")
            test.eq(ui_types.safe_logo_url("/kickside-branding/logo-a.webp?v=1"), "/kickside-branding/logo-a.webp?v=1")
            test.eq(ui_types.safe_logo_url("/app/kickside-icon.svg"), "/app/kickside-icon.svg")
            test.eq(ui_types.safe_logo_url("/app/wippy-logo.svg"), "/app/wippy-logo.svg")
            test.eq(ui_types.safe_logo_url("https://example.test/logo.svg"), "")
            test.eq(ui_types.safe_logo_url("//example.test/logo.svg"), "")
            test.eq(ui_types.safe_logo_url("data:image/svg+xml,<svg/>"), "")
            test.eq(ui_types.safe_logo_url("/kickside-branding/logo-a.svg"), "")
            test.eq(ui_types.safe_logo_url("/app/login.html"), "")
            test.eq(ui_types.safe_logo_url("/uploads/logo.svg"), "")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(o) return run_cases(o) end }
