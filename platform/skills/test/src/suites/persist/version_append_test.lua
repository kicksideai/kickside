local test = require("test")
local json = require("json")
local version_append = require("version_append")

local RECORD = {
    skill_id = "skill-1",
    version = 2,
    body = "# Refined",
    files = { { path = "SKILL.md", artifact_id = "artifact-1" } },
}

local function event(body: any): any
    local encoded, encode_err = json.encode(body)
    if encode_err then error(tostring(encode_err)) end
    return {
        type = "kickside.skills.events:skill.updated",
        body = encoded,
        external_source = "kickside.skills",
        external_id = "version:2",
        external_version = "2",
    }
end

local function duplicate_threads(found: any): any
    return {
        emit = function()
            return { inserted = 0, duplicates = 1, max_seq = 2 }, nil
        end,
        find_event_by_external = function(_, args)
            test.eq(args.thread_id, "skill-1")
            test.eq(args.event_type, "kickside.skills.events:skill.updated")
            test.eq(args.external_source, "kickside.skills")
            test.eq(args.external_id, "version:2")
            test.eq(args.external_version, "2")
            return { event = found }, nil
        end,
    }
end

local function append(threads: any, record: any): error?
    return version_append.append(
        threads,
        "skill-1",
        "kickside.skills.events:skill.updated",
        record,
        "kickside.skills:skill",
        "kickside.skill"
    )
end

local function define_tests()
    test.describe("Skills version append", function()
        test.it("preserves typed emit and history failures", function()
            local failure = errors.new({ kind = errors.UNAVAILABLE, message = "history offline",
                retryable = true, details = { source = "threads" } })
            test.eq(append({ emit = function() return nil, failure end }, RECORD), failure)
            local _, err = version_append.latest({ list_events = function() return nil, failure end },
                "skill-1", "created", "updated")
            test.is_true(errors.is(err, errors.UNAVAILABLE))
            test.is_true(err:retryable())
            test.eq(err:details().source, "threads")
        end)

        test.it("classifies a missing skill history as not found", function()
            local _, err = version_append.latest({ list_events = function() return { events = {} }, nil end },
                "skill-1", "created", "updated")
            test.is_true(errors.is(err, errors.NOT_FOUND))
        end)

        test.it("finds the latest version beyond unrelated event traffic", function()
            local unrelated: { any } = {}
            for index = 1, 1000 do
                unrelated[index] = { type = "kickside.skills.events:file.transferred", seq = index + 2, body = "{}" }
            end
            local created = event({ skill_id = "skill-1", version = 1, body = "Initial." })
            created.type = "created"
            created.seq = 1
            local updated = event(RECORD)
            updated.type = "updated"
            updated.seq = 1002
            local filtered = 0
            local calls: { any } = {}
            local body, err = version_append.latest({
                list_events = function(_, args)
                    calls[#calls + 1] = args
                    if args.event_type == "created" then
                        filtered = filtered + 1
                        return { events = { created } }, nil
                    end
                    if args.event_type == "updated" then
                        filtered = filtered + 1
                        return { events = { updated } }, nil
                    end
                    return { events = unrelated }, nil
                end,
            }, "skill-1", "created", "updated")
            test.is_nil(err)
            test.eq(filtered, 2)
            test.eq(#calls, 2)
            test.eq(calls[1].thread_id, "skill-1")
            test.eq(calls[1].event_type, "created")
            test.eq(calls[1].limit, 1)
            test.eq(calls[2].event_type, "updated")
            test.eq(calls[2].limit, 1)
            test.eq(body.version, 2)
            test.eq(body.body, "# Refined")
        end)

        test.it("accepts an exact durable duplicate as a replay", function()
            local err = append(duplicate_threads(event(RECORD)), RECORD)
            test.is_nil(err)
        end)

        test.it("rejects a same-version duplicate with different content", function()
            local winner = {
                skill_id = "skill-1",
                version = 2,
                body = "# Concurrent winner",
                files = RECORD.files,
            }
            local err = append(duplicate_threads(event(winner)), RECORD)
            test.contains(tostring(err), "skill version conflict")
            test.contains(tostring(err), "version 2")
            test.is_true(errors.is(err, errors.CONFLICT))
        end)

        test.it("does not accept an unverified duplicate", function()
            local err = append(duplicate_threads(nil), RECORD)
            test.contains(tostring(err), "duplicate verification failed")
            test.contains(tostring(err), "not found")
        end)

        test.it("preserves an exact external lookup failure", function()
            local failure = errors.new({ kind = errors.UNAVAILABLE, message = "external identity lookup offline" })
            local err = append({
                emit = function()
                    return { inserted = 0, duplicates = 1, max_seq = 2 }, nil
                end,
                find_event_by_external = function()
                    return nil, failure
                end,
            }, RECORD)
            test.eq(err, failure)
        end)

        test.it("verifies an old duplicate through its exact external identity", function()
            local later_events: { any } = {}
            for index = 1, 1000 do
                later_events[index] = {
                    type = "kickside.skills.events:skill.updated",
                    body = "{}",
                    external_source = "kickside.skills",
                    external_id = "version:" .. tostring(index + 2),
                    external_version = tostring(index + 2),
                }
            end
            local listed = 0
            local lookup: any = nil
            local err = append({
                emit = function()
                    return { inserted = 0, duplicates = 1, max_seq = 1002 }, nil
                end,
                list_events = function()
                    listed = listed + 1
                    return { events = later_events }, nil
                end,
                find_event_by_external = function(_, args)
                    lookup = args
                    return { event = event(RECORD) }, nil
                end,
            }, RECORD)
            test.is_nil(err)
            test.eq(listed, 0)
            test.eq(lookup.thread_id, "skill-1")
            test.eq(lookup.event_type, "kickside.skills.events:skill.updated")
            test.eq(lookup.external_source, "kickside.skills")
            test.eq(lookup.external_id, "version:2")
            test.eq(lookup.external_version, "2")
        end)

        test.it("does not read history after a fresh insert", function()
            local listed = 0
            local err = append({
                emit = function()
                    return { inserted = 1, duplicates = 0, max_seq = 2 }, nil
                end,
                list_events = function()
                    listed = listed + 1
                    return { events = {} }, nil
                end,
            }, RECORD)
            test.is_nil(err)
            test.eq(listed, 0)
        end)
    end)
end

return { run = test.run_cases(define_tests) }
