local sql = require("sql")
local test = require("test")
local uuid = require("uuid")
local json = require("json")
local time = require("time")
local env = require("env")
local oauth_repo = require("oauth_repo")
local oauth_read_repo = require("oauth_read_repo")
local oauth_token_repo = require("oauth_token_repo")

-- wippy.test injects describe/it/before_each as globals but exposes assertions as
-- test.* primitives rather than a BDD expect() matcher. These shims back the
-- expect(...).matcher() form this suite is written in with those primitives.
local function expect(value: any): any
    return {
        to_be_nil = function() test.is_nil(value) end,
        not_to_be_nil = function() test.not_nil(value) end,
        to_equal = function(other: any) test.eq(value, other) end,
        not_to_equal = function(other: any) test.neq(value, other) end,
        to_be_true = function() test.is_true(value) end,
        to_match = function(pattern: string) test.matches(value, pattern) end,
    }
end

-- Marks a test as conditionally skipped; the body returns immediately after.
local function pending(_: any) end

local function define_tests()
    describe("OAuth Repository", function()
        -- Test data
        local test_data = {
            component_id = uuid.v7(),
            component_id2 = uuid.v7(),
            component_id3 = uuid.v7(),
            schedule_id = uuid.v7(),
            schedule_id2 = uuid.v7()
        }

        -- Function to create test connection data with current timestamp
        local function get_test_connection_data(schedule_id)
            return {
                provider = "google",
                connection_name = "Test Google Connection",
                connection_description = "Test connection for unit tests",
                schedule_id = schedule_id,
                scopes_granted = "email profile https://www.googleapis.com/auth/gmail.readonly",
                token_type = "Bearer",
                expires_at = time.now():unix() + 3600, -- 1 hour from now
                refresh_expires_at = time.now():unix() + (30 * 24 * 3600), -- 30 days from now
                tokens = {
                    access_token = "ya29.test_access_token_12345",
                    refresh_token = "1//04test_refresh_token_67890",
                    id_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.test",
                    scope = "email profile https://www.googleapis.com/auth/gmail.readonly"
                },
                client_credentials = {
                    client_id = "123456789.apps.googleusercontent.com",
                    client_secret = "GOCSPX-test_client_secret"
                },
                user_profile = {
                    provider_user_id = "123456789",
                    email = "test@example.com",
                    display_name = "Test User",
                    username = "testuser",
                    avatar_url = "https://lh3.googleusercontent.com/test-avatar",
                    verified_email = true
                },
                provider_specific = {
                    locale = "en",
                    picture = "https://lh3.googleusercontent.com/test-picture",
                    given_name = "Test",
                    family_name = "User",
                    hd = "example.com"
                },
                oauth_flow = {
                    code_verifier = "dBjftJeZ4CVP-mB9v-daBfL-mm0X_lbVWdmvt4",
                    code_challenge = "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
                    state = "test_state_random_string",
                    nonce = "test_nonce_12345"
                }
            }
        end

        -- Clean up test data after all tests
        after_all(function()
            local db, err = sql.get("app:db")
            if err then
                error("Failed to connect to database: " .. err)
            end

            -- Delete test connections
            db:execute("DELETE FROM kickside_oauth_connections WHERE component_id IN ($1, $2, $3)",
                { test_data.component_id, test_data.component_id2, test_data.component_id3 })

            db:release()
        end)

        -- Clean up before each test to ensure isolation
        before_each(function()
            local db, err = sql.get("app:db")
            if err then
                error("Failed to connect to database: " .. err)
            end

            -- Clean up our specific test data only (not all test data)
            db:execute("DELETE FROM kickside_oauth_connections WHERE component_id IN ($1, $2, $3)",
                { test_data.component_id, test_data.component_id2, test_data.component_id3 })
            db:release()
        end)










        describe("list_by_schedule_id", function()

            before_each(function()
                -- Create connections with different schedule_ids
                local test_connection_data = get_test_connection_data(test_data.schedule_id)
                oauth_repo.create_connection(test_data.component_id, test_connection_data)

                local github_data = get_test_connection_data(test_data.schedule_id2)
                github_data.provider = "github"
                github_data.connection_name = "Test GitHub Connection"
                oauth_repo.create_connection(test_data.component_id2, github_data)
            end)

            it("should list connections by schedule_id", function()
                local connections, err = oauth_read_repo.list_by_schedule_id(test_data.schedule_id)

                expect(err).to_be_nil()
                expect(connections).not_to_be_nil()
                expect(#connections >= 1).to_be_true() -- At least our test connection should exist

                -- Find our test connection in the results
                local test_connection = nil
                for _, conn in ipairs(connections) do
                    if conn.component_id == test_data.component_id then
                        test_connection = conn
                        break
                    end
                end

                expect(test_connection).not_to_be_nil()
                if not test_connection then error("test_connection is nil") end
                expect(test_connection.schedule_id).to_equal(test_data.schedule_id)
                expect(test_connection.provider).to_equal("google")

                -- Check that encrypted data is not included in any result
                for _, conn in ipairs(connections) do
                    expect((conn :: any).oauth_data_encrypted).to_be_nil()
                end
            end)

            it("should return empty list for non-existent schedule_id", function()
                local connections, err = oauth_read_repo.list_by_schedule_id(uuid.v7())

                expect(err).to_be_nil()
                expect(connections).not_to_be_nil()
                expect(#connections).to_equal(0)
            end)

            it("should fail with missing schedule_id", function()
                local connections, err = oauth_read_repo.list_by_schedule_id(nil)

                expect(connections).to_be_nil()
                expect(err).not_to_be_nil()
                expect(err).to_match("Schedule ID is required")
            end)

            it("should respect limit and offset (pagination)", function()
                -- before_each made one connection on schedule_id; add a second.
                oauth_repo.create_connection(test_data.component_id3, get_test_connection_data(test_data.schedule_id))

                local page1, err1 = oauth_read_repo.list_by_schedule_id(test_data.schedule_id, { limit = 1, offset = 0 })
                expect(err1).to_be_nil()
                expect(#page1).to_equal(1)

                local page2, err2 = oauth_read_repo.list_by_schedule_id(test_data.schedule_id, { limit = 1, offset = 1 })
                expect(err2).to_be_nil()
                expect(#page2).to_equal(1)
                expect(page1[1].component_id).not_to_equal(page2[1].component_id)
            end)

        end)





    end)
end

return test.run_cases(define_tests)
