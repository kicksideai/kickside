-- Trusted-read guard.
--
-- component.lua exposes a trusted read tier (no actor gate): list_system,
-- open_private, list_for_subject, get_private_context, system_delete,
-- resolve_path_prefixes. This suite walks the repo tree, counts every
-- module-qualified call into that tier, and requires each caller site to be in
-- trusted_read_allowlist with an exact count. A new caller (unlisted) or an
-- undeclared extra call (count drift) fails the suite, so widening the trusted
-- tier is a conscious, allowlisted act.
--
-- Mechanism: the component-test harness registry holds only the component module
-- and its harness resources, not the platform/core caller modules, so an
-- in-process registry scan cannot see the call sites at all. The suite instead
-- reads source via the app:repo_root fs.directory and keys the allowlist by
-- repo-relative path (a faithful proxy for the registry entry).

local test = require("test")
local fs = require("fs")
local allowlist = require("allowlist")

local REPO_FS = "app:repo_root"

-- Directory names never worth walking for module source (build output, vcs,
-- vendored deps, packed harness state, static bundles).
local SKIP_DIRS: { [string]: boolean } = {
    [".git"] = true,
    [".wippy"] = true,
    ["node_modules"] = true,
    ["dist"] = true,
    ["build"] = true,
    ["vendor"] = true,
    ["static"] = true,
    ["storage"] = true,
    ["test"] = true,
    ["tests"] = true,
}

-- A path is excluded from the scan when it is the tier's own source (definitions,
-- not a caller) or any test source (co-located *_test.lua or a /test/ harness dir).
local function is_excluded(path: string): boolean
    if path == allowlist.SELF_PATH then
        return true
    end
    if path:sub(-9) == "_test.lua" then
        return true
    end
    if path:find("/test/", 1, true) or path:sub(1, 5) == "test/" then
        return true
    end
    return false
end

-- Count module-qualified calls `<qualifier>.<method>(` in file content. The
-- leading [%w_]+%. anchors a real call through a required module handle and keeps
-- a bare local definition or a longer sibling name (list_system_foo) from matching.
local function count_calls(content: string, method: string): number
    local n = 0
    local pattern = "[%w_]+%." .. method .. "%s*%("
    for _ in content:gmatch(pattern) do
        n = n + 1
    end
    return n
end

-- Scan one .lua file for every tier method; return method->count for matches only.
local function scan_file(vol: any, path: string): { [string]: number }?
    local content = vol:readfile(path)
    if type(content) ~= "string" or content == "" then
        return nil
    end
    local hits: { [string]: number } = {}
    local any = false
    for _, method in ipairs(allowlist.METHODS) do
        local n = count_calls(content, method)
        if n > 0 then
            hits[method] = n
            any = true
        end
    end
    if not any then
        return nil
    end
    return hits
end

-- Recursively walk the repo tree collecting scan[path] = { method = count }.
local function walk(vol: any, dir: string, out: { [string]: { [string]: number } })
    for entry in vol:readdir(dir == "" and "." or dir) do
        local name = tostring(entry.name)
        if name ~= "." and name ~= ".." then
            local child = dir == "" and name or (dir .. "/" .. name)
            if entry.type == "file" then
                if name:sub(-4) == ".lua" and not is_excluded(child) then
                    local hits = scan_file(vol, child)
                    if hits then
                        out[child] = hits
                    end
                end
            elseif not SKIP_DIRS[name] and name:sub(1, 1) ~= "." then
                walk(vol, child, out)
            end
        end
    end
end

local function scan_repo(): { [string]: { [string]: number } }
    local vol, err = fs.get(REPO_FS)
    if not vol then
        error("repo fs unavailable: " .. tostring(err))
    end
    local out: { [string]: { [string]: number } } = {}
    walk(vol, "", out)
    return out
end

-- Pure checker: compare a scan result against the allowlist, returning a flat list
-- of violation messages. Forward pass flags an unlisted (path, method) caller;
-- reverse pass flags any declared site whose scanned count (0 when absent) differs
-- from its declaration, catching an undeclared extra call and a stale entry alike.
local function check(scan: { [string]: { [string]: number } }, allow: any): { string }
    local violations: { string } = {}
    for path, methods in pairs(scan) do
        for method, count in pairs(methods) do
            local listed = allow[path] and allow[path][method]
            if not listed then
                violations[#violations + 1] =
                    "unlisted trusted-read caller: " .. path .. " ." .. method .. "() x" .. tostring(count)
            end
        end
    end
    for path, methods in pairs(allow) do
        for method, site in pairs(methods) do
            local found = (scan[path] and scan[path][method]) or 0
            if found ~= site.count then
                violations[#violations + 1] =
                    "count drift: " .. path .. " ." .. method .. "() scanned " ..
                    tostring(found) .. " declared " .. tostring(site.count)
            end
        end
    end
    return violations
end

-- A clean scan mirror built from the allowlist (each declared count), used to seed
-- the synthetic failure-mode fixtures so they diverge from a known-good baseline.
local function scan_from_allowlist(allow: any): { [string]: { [string]: number } }
    local out: { [string]: { [string]: number } } = {}
    for path, methods in pairs(allow) do
        out[path] = {}
        for method, site in pairs(methods) do
            out[path][method] = site.count
        end
    end
    return out
end

local function has_substr(list: { string }, needle: string): boolean
    for _, s in ipairs(list) do
        if s:find(needle, 1, true) then
            return true
        end
    end
    return false
end

local function define_tests()
    test.describe("component trusted-read guard", function()
        local repo_scan: { [string]: { [string]: number } }? = nil
        local function scan_once(): { [string]: { [string]: number } }
            if repo_scan == nil then repo_scan = scan_repo() end
            return repo_scan :: { [string]: { [string]: number } }
        end
        test.it("the real repo scan matches the allowlist exactly (zero violations)", function()
            local scan = scan_once()
            local violations = check(scan, allowlist.ALLOW)
            test.eq(#violations, 0, "trusted-read violations:\n  " .. table.concat(violations, "\n  "))
        end)

        test.it("every allowlisted caller was actually observed by the scan", function()
            -- Guards against the allowlist rotting into fiction: a declared path/method
            -- the scan never sees means the site moved or the path is wrong.
            local scan = scan_once()
            for path, methods in pairs(allowlist.ALLOW) do
                for method in pairs(methods) do
                    local seen = scan[path] and scan[path][method]
                    test.is_true(seen ~= nil and seen > 0,
                        "allowlisted site never observed: " .. path .. " ." .. method .. "()")
                end
            end
        end)

        test.it("flags an unlisted caller (new file reaching for a trusted read)", function()
            local fixture = scan_from_allowlist(allowlist.ALLOW)
            fixture["platform/newmod/src/sneaky.lua"] = { list_system = 1 }
            local violations = check(fixture, allowlist.ALLOW)
            test.is_true(
                has_substr(violations, "unlisted trusted-read caller: platform/newmod/src/sneaky.lua .list_system()"),
                "expected an unlisted-caller violation"
            )
        end)

        test.it("flags an allowlisted caller with an undeclared extra call", function()
            local fixture = scan_from_allowlist(allowlist.ALLOW)
            local reaper: any = fixture["core/core/src/lifecycle/reaper.lua"]
            reaper.list_system = (reaper.list_system :: number) + 1
            local violations = check(fixture, allowlist.ALLOW)
            test.is_true(
                has_substr(violations, "count drift: core/core/src/lifecycle/reaper.lua .list_system()"),
                "expected a count-drift violation"
            )
        end)

        test.it("a clean mirror of the allowlist yields zero violations", function()
            local fixture = scan_from_allowlist(allowlist.ALLOW)
            local violations = check(fixture, allowlist.ALLOW)
            test.eq(#violations, 0, "clean mirror unexpectedly flagged: " .. table.concat(violations, "; "))
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
