local test = require("test")
local fs = require("fs")
local registry = require("registry")
local http_client = require("http_client")
local json = require("json")
local principal_fixture = require("principal_fixture")
local sql = require("sql")
local base64 = require("base64")

local function base_url(): string
    local entry = registry.get("app:gateway") :: any
    local port = tostring(entry.data.addr):match(":(%d+)$")
    assert(port, "gateway port unavailable")
    return "http://127.0.0.1:" .. port
end

local function volume(id: string): any
    local vol, err = fs.get(id)
    assert(vol, tostring(err))
    return vol
end

local function source_snapshot(): string
    local source = volume("app:module_source")
    local files: { string } = {}
    local info = source:stat("branding")
    if info then
        local iter, state = source:readdir("branding")
        for item in iter, state do
            files[#files + 1] = item.name .. ":" .. tostring(source:readfile("branding/" .. item.name))
        end
    end
    table.sort(files)
    return table.concat(files, "\n")
end

local function admin_token(): string
    return principal_fixture.token("app:ui_test_admin")
end

local function decoded(response: any, err: any): any
    test.is_nil(err)
    test.not_nil(response)
    test.eq(response.status_code, 200, tostring(response.body))
    local body, jerr = json.decode(tostring(response.body))
    test.is_nil(jerr)
    test.eq(body.success, true, tostring(body.error))
    return body
end

local function save_logo(token: string, url: string)
    local response, err = http_client.put(base_url() .. "/api/auth/nav/config", {
        timeout = 10,
        headers = { Authorization = "Bearer " .. token, ["Content-Type"] = "application/json" },
        body = json.encode({ logo_url = url }),
    })
    decoded(response, err)
end

local function define_tests()
    test.describe("instance branding storage", function()
        test.it("initializes the legacy fallback under the host project without changing module source", function()
            test.not_nil(volume("kickside.ui:legacy_branding_fs"):stat("."))
            test.not_nil(volume("app:project_fs"):stat("branding"))
            test.is_nil(volume("app:module_source"):stat("branding"))
            local configured = registry.get("kickside.ui:legacy_branding_config") :: any
            test.eq(configured.data.fs, "app:branding_fs", "the explicit host binding must remain selected")
        end)

        test.it("declares the raster upload contract to the appearance editor", function()
            local response, err = http_client.get(base_url() .. "/api/auth/nav/list?manage=1", {
                timeout = 10, headers = { Authorization = "Bearer " .. admin_token() },
            })
            local contract = decoded(response, err).logo_upload
            test.not_nil(contract)
            test.eq(contract.max_bytes, 2 * 1024 * 1024)
            test.eq(#contract.formats, 4)
            test.eq(contract.formats[1].mime, "image/png")
            test.eq(contract.formats[2].extensions[2], "jpeg")
        end)

        local accepted = {
            { "png", "image/png" }, { "jpg", "image/jpeg" }, { "jpeg", "image/jpeg" },
            { "webp", "image/webp" }, { "gif", "image/gif" }, { "PNG", "image/png" },
        }
        local rejected = {
            { "svg", "image/svg+xml" }, { "png", "image/svg+xml" },
            { "svg", "image/png" }, { "png", "image/jpeg" },
            { "bmp", "image/bmp" }, { "avif", "image/avif" },
            { "ico", "image/x-icon" }, { "txt", "text/plain" },
            { "png", "application/octet-stream" }, { "png", "text/html" },
        }
        for _, cases in ipairs({ accepted, rejected }) do
            for _, case in ipairs(cases) do
                local ext, mime = tostring(case[1]), tostring(case[2])
                local allowed = cases == accepted
                test.it((allowed and "accepts " or "rejects ") .. ext .. " as " .. mime, function()
                    local boundary = "BrandingTypeFixture"
                    local bytes = "<svg xmlns='http://www.w3.org/2000/svg'/>"
                    if allowed then
                        local fixture_ext = ext:lower()
                        if fixture_ext == "jpeg" then fixture_ext = "jpg" end
                        bytes = volume("app:module_source"):readfile("test/fixtures/logo." .. fixture_ext)
                    end
                    local response, err = http_client.post(base_url() .. "/api/auth/nav/logo", {
                        timeout = 10,
                        headers = { Authorization = "Bearer " .. admin_token(),
                            ["Content-Type"] = "multipart/form-data; boundary=" .. boundary },
                        body = "--" .. boundary .. '\r\nContent-Disposition: form-data; name="logo"; filename="example.' .. ext
                            .. '"\r\nContent-Type: ' .. mime .. '\r\n\r\n' .. bytes .. "\r\n--" .. boundary .. "--\r\n",
                    })
                    test.is_nil(err)
                    test.eq(response.status_code, allowed and 200 or 400, tostring(response.body))
                    if allowed then
                        local body = decoded(response, err)
                        local served, serve_err = http_client.get(base_url() .. body.url, { timeout = 10 })
                        test.is_nil(serve_err)
                        test.eq(served.headers["Content-Type"], mime)
                        test.eq(served.headers["X-Content-Type-Options"], "nosniff")
                    end
                end)
            end
        end

        test.it("serves a missing stored logo without importing files or writing state", function()
            local token = admin_token()
            save_logo(token, "/kickside-branding/logo.webp")
            local db, db_err = sql.get("app:db")
            assert(db, tostring(db_err))
            local _, delete_err = db:execute("DELETE FROM kickside_settings WHERE namespace = 'kickside.ui' AND key = 'branding_image'")
            test.is_nil(delete_err)
            local response, err = http_client.get(base_url() .. "/api/public/branding/logo", { timeout = 10 })
            test.is_nil(err)
            test.eq(response.status_code, 404)
            local rows, count_err = db:query("SELECT COUNT(*) AS count FROM kickside_settings WHERE namespace = 'kickside.ui' AND key = 'branding_image'")
            db:release()
            test.is_nil(count_err)
            test.eq(tonumber(rows[1].count), 0, "a logo read must not create persisted state")
            save_logo(token, "")
        end)
        test.it("preserves configured titles verbatim", function()
            local token = admin_token()
            local before, before_err = http_client.get(base_url() .. "/api/public/branding", { timeout = 10 })
            local original = decoded(before, before_err).title
            for _, title in ipairs({ "Northwind Operations", "Kickside" }) do
                local response, err = http_client.put(base_url() .. "/api/auth/nav/config", {
                    timeout = 10,
                    headers = { Authorization = "Bearer " .. token, ["Content-Type"] = "application/json" },
                    body = json.encode({ title = title }),
                })
                decoded(response, err)
                local saved, saved_err = http_client.get(base_url() .. "/api/public/branding", { timeout = 10 })
                test.eq(decoded(saved, saved_err).title, title)
            end
            local response, err = http_client.put(base_url() .. "/api/auth/nav/config", {
                timeout = 10,
                headers = { Authorization = "Bearer " .. token, ["Content-Type"] = "application/json" },
                body = json.encode({ title = original }),
            })
            decoded(response, err)
        end)

        test.it("uploads and serves the configured instance bytes without changing module source", function()
            local storage = registry.get("app:branding_fs") :: any
            local config = registry.get("app:instance_config") :: any
            test.eq(storage.data.directory, config.data.root .. "/branding", "filesystem must resolve the configured instance path")
            local before = source_snapshot()
            local token = admin_token()
            local boundary = "KicksideBrandingFixture"
            local bytes = "RIFF\4\0\0\0WEBP"
            local response, err = http_client.post(base_url() .. "/api/auth/nav/logo", {
                timeout = 10,
                headers = { Authorization = "Bearer " .. token,
                    ["Content-Type"] = "multipart/form-data; boundary=" .. boundary },
                body = "--" .. boundary .. '\r\nContent-Disposition: form-data; name="logo"; filename="example.webp"\r\nContent-Type: image/webp\r\n\r\n'
                    .. bytes .. "\r\n--" .. boundary .. "--\r\n",
            })
            local body = decoded(response, err)
            test.eq(body.url, "/api/public/branding/logo")
            local stored, db_err = sql.get("app:db")
            assert(stored, tostring(db_err))
            local rows, qerr = stored:query("SELECT value FROM kickside_settings WHERE namespace = 'kickside.ui' AND key = 'branding_image'")
            test.is_nil(qerr)
            stored:release()
            local after = source_snapshot()
            local served, serve_err = http_client.get(base_url() .. body.url, { timeout = 10 })
            test.is_nil(serve_err)
            test.eq(served.status_code, 200)
            test.eq(tostring(served.body), bytes)
            local image = json.decode(rows[1].value)
            test.eq(base64.decode(image.bytes), bytes, "upload stores exact bytes in UI-owned state")
            test.eq(image.content_type, "image/webp")
            test.eq(served.headers["Content-Type"], "image/webp")
            test.not_nil(served.headers["Etag"])
            local cached, cache_err = http_client.get(base_url() .. body.url, { timeout = 10, headers = { ["If-None-Match"] = served.headers["Etag"] } })
            test.is_nil(cache_err)
            test.eq(cached.status_code, 304)
            test.eq(after, before, "module source must stay untouched")
        end)

        test.it("exposes the saved logo to the unauthenticated login page and clears to the default mark", function()
            local token = admin_token()
            save_logo(token, "")
            local fresh, fresh_err = http_client.get(base_url() .. "/api/public/branding", { timeout = 10 })
            local defaults = decoded(fresh, fresh_err)
            test.eq(defaults.logo_url, "")
            test.eq(defaults.title, "KickSide")
            save_logo(token, "/api/public/branding/logo")
            local branded, brand_err = http_client.get(base_url() .. "/api/public/branding", { timeout = 10 })
            test.eq(decoded(branded, brand_err).logo_url, "/api/public/branding/logo")
            save_logo(token, "")
            local cleared, clear_err = http_client.get(base_url() .. "/api/public/branding", { timeout = 10 })
            test.eq(decoded(cleared, clear_err).logo_url, "")
        end)
    end)
end

return { run = test.run_cases(define_tests) }
