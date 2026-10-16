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







        describe("update_connection", function()

            before_each(function()
                local test_connection_data = get_test_connection_data(test_data.schedule_id)
                oauth_repo.create_connection(test_data.component_id, test_connection_data)
            end)

            it("should update all connection fields successfully", function()
                local update_data = {
                    provider = "github",
                    connection_name = "Updated GitHub Connection",
                    connection_description = "Updated description for testing",
                    scopes_granted = "user read:org public_repo",
                    connection_state = "connected",
                    token_type = "bearer",
                    expires_at = time.now():unix() + 7200, -- 2 hours from now
                    refresh_expires_at = time.now():unix() + (60 * 24 * 3600), -- 60 days from now
                    schedule_id = test_data.schedule_id2,
                    tokens = {
                        access_token = "gho_new_github_token_12345",
                        refresh_token = "ghr_new_refresh_token_67890",
                        scope = "user read:org public_repo"
                    },
                    user_profile = {
                        provider_user_id = "987654321",
                        email = "updated@example.com",
                        display_name = "Updated User",
                        username = "updateduser",
                        avatar_url = "https://avatars.githubusercontent.com/updated-avatar"
                    },
                    provider_specific = {
                        login = "updateduser",
                        bio = "Updated bio",
                        location = "Updated Location"
                    },
                    oauth_flow = {
                        state = "updated_state_token"
                    }
                }

                local result, err = oauth_repo.update_connection(test_data.component_id, update_data)

                expect(err).to_be_nil()
                expect(result).not_to_be_nil()
                expect(result.success).to_be_true()
                expect(result.updated_at).not_to_be_nil()

                -- Verify all fields were updated
                local connection, err = oauth_read_repo.get_connection(test_data.component_id)
                expect(err).to_be_nil()

                -- Check metadata fields
                expect(connection.provider).to_equal("github")
                expect(connection.connection_name).to_equal("Updated GitHub Connection")
                expect(connection.connection_description).to_equal("Updated description for testing")
                expect(connection.scopes_granted).to_equal("user read:org public_repo")
                expect(connection.connection_state).to_equal("connected")
                expect(connection.token_type).to_equal("bearer")
                expect(connection.expires_at).to_equal(update_data.expires_at)
                expect(connection.refresh_expires_at).to_equal(update_data.refresh_expires_at)
                expect(connection.schedule_id).to_equal(test_data.schedule_id2)

                -- Check encrypted data
                expect(connection.tokens.access_token).to_equal("gho_new_github_token_12345")
                expect(connection.tokens.refresh_token).to_equal("ghr_new_refresh_token_67890")
                expect(connection.user_profile.email).to_equal("updated@example.com")
                expect(connection.user_profile.display_name).to_equal("Updated User")
                expect(connection.provider_specific.bio).to_equal("Updated bio")
                expect(connection.oauth_flow.state).to_equal("updated_state_token")
            end)

            it("should update only scopes_granted (re-authorization scenario)", function()
                local original_connection, err = oauth_read_repo.get_connection(test_data.component_id)
                expect(err).to_be_nil()

                local update_data = {
                    scopes_granted = "email profile https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/drive",
                    tokens = {
                        access_token = "ya29.reauth_access_token_67890",
                        refresh_token = original_connection.tokens.refresh_token, -- Keep same refresh token
                        scope = "email profile https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/drive"
                    }
                }

                local result, err = oauth_repo.update_connection(test_data.component_id, update_data)

                expect(err).to_be_nil()
                expect(result.success).to_be_true()

                -- Verify scopes were updated but other fields preserved
                local connection, err = oauth_read_repo.get_connection(test_data.component_id)
                expect(err).to_be_nil()
                expect(connection.scopes_granted).to_equal("email profile https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/drive")
                expect(connection.tokens.access_token).to_equal("ya29.reauth_access_token_67890")
                expect(connection.connection_name).to_equal(original_connection.connection_name) -- Unchanged
                expect(connection.provider).to_equal(original_connection.provider) -- Unchanged
                expect(connection.user_profile.email).to_equal(original_connection.user_profile.email) -- Unchanged
            end)

            it("should update partial fields without affecting others", function()
                local original_connection, err = oauth_read_repo.get_connection(test_data.component_id)
                expect(err).to_be_nil()

                local update_data = {
                    connection_name = "Partially Updated Connection",
                    expires_at = time.now():unix() + 5400, -- 1.5 hours from now
                    user_profile = {
                        provider_user_id = original_connection.user_profile.provider_user_id, -- Keep same
                        email = "partially_updated@example.com",
                        display_name = "Partially Updated User",
                        username = original_connection.user_profile.username, -- Keep same
                        avatar_url = original_connection.user_profile.avatar_url -- Keep same
                    }
                }

                local result, err = oauth_repo.update_connection(test_data.component_id, update_data)

                expect(err).to_be_nil()
                expect(result.success).to_be_true()

                -- Verify partial updates
                local connection, err = oauth_read_repo.get_connection(test_data.component_id)
                expect(err).to_be_nil()

                -- Updated fields
                expect(connection.connection_name).to_equal("Partially Updated Connection")
                expect(connection.expires_at).to_equal(update_data.expires_at)
                expect(connection.user_profile.email).to_equal("partially_updated@example.com")
                expect(connection.user_profile.display_name).to_equal("Partially Updated User")

                -- Unchanged fields
                expect(connection.provider).to_equal(original_connection.provider)
                expect(connection.scopes_granted).to_equal(original_connection.scopes_granted)
                expect(connection.tokens.access_token).to_equal(original_connection.tokens.access_token)
                expect(connection.user_profile.username).to_equal(original_connection.user_profile.username)
                expect(connection.provider_specific.locale).to_equal(original_connection.provider_specific.locale)
            end)

            it("should handle empty description update", function()
                local update_data = {
                    connection_description = ""
                }

                local result, err = oauth_repo.update_connection(test_data.component_id, update_data)

                expect(err).to_be_nil()
                expect(result.success).to_be_true()

                -- Verify description was cleared (set to NULL)
                local connection, err = oauth_read_repo.get_connection(test_data.component_id)
                expect(err).to_be_nil()
                expect(connection.connection_description).to_be_nil()
            end)

            it("should handle schedule_id clearing", function()
                local update_data = {
                    schedule_id = ""
                }

                local result, err = oauth_repo.update_connection(test_data.component_id, update_data)

                expect(err).to_be_nil()
                expect(result.success).to_be_true()

                -- Verify schedule_id was cleared
                local connection, err = oauth_read_repo.get_connection(test_data.component_id)
                expect(err).to_be_nil()
                expect(connection.schedule_id).to_be_nil()
            end)

            it("should update client_credentials", function()
                local update_data = {
                    client_credentials = {
                        client_id = "new_client_id_12345",
                        client_secret = "GOCSPX-new_client_secret_67890"
                    }
                }

                local result, err = oauth_repo.update_connection(test_data.component_id, update_data)

                expect(err).to_be_nil()
                expect(result.success).to_be_true()

                -- Verify client credentials were updated
                local connection, err = oauth_read_repo.get_connection(test_data.component_id)
                expect(err).to_be_nil()
                expect(connection.client_credentials.client_id).to_equal("new_client_id_12345")
                expect(connection.client_credentials.client_secret).to_equal("GOCSPX-new_client_secret_67890")
            end)

            it("should fail with missing component_id", function()
                local update_data = { connection_name = "Test" }
                local result, err = oauth_repo.update_connection(nil, update_data)

                expect(result).to_be_nil()
                expect(err).not_to_be_nil()
                expect(err).to_match("Component ID is required")
            end)

            it("should fail with missing connection_data", function()
                local result, err = oauth_repo.update_connection(test_data.component_id, nil)

                expect(result).to_be_nil()
                expect(err).not_to_be_nil()
                expect(err).to_match("Connection data is required")
            end)

            it("should fail with non-existent component_id", function()
                local update_data = { connection_name = "Test" }
                local result, err = oauth_repo.update_connection(uuid.v7(), update_data)

                expect(result).to_be_nil()
                expect(err).not_to_be_nil()
                expect(err).to_match("OAuth connection not found")
            end)

            it("should verify data is properly encrypted after update", function()
                local update_data = {
                    tokens = {
                        access_token = "ya29.super_secret_new_token_99999",
                        refresh_token = "1//04super_secret_refresh_99999"
                    },
                    user_profile = {
                        provider_user_id = "999999999",
                        email = "super_secret@example.com"
                    },
                    client_credentials = {
                        client_secret = "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9999"
                    }
                }

                local result, err = oauth_repo.update_connection(test_data.component_id, update_data)
                expect(err).to_be_nil()

                -- Query database directly to verify encryption
                local db, err = sql.get("app:db")
                expect(err).to_be_nil()
                if not db then error("db unavailable") end

                local query = sql.builder.select("oauth_data_encrypted", "access_token_encrypted")
                    :from("kickside_oauth_connections")
                    :where("component_id = ?", test_data.component_id)

                local executor = query:run_with(db)
                local results, err = executor:query()
                db:release()

                expect(err).to_be_nil()
                expect(#results).to_equal(1)

                local raw_record = results[1]

                -- Verify the sensitive data is not in plain text
                expect(raw_record.oauth_data_encrypted:find("ya29.super_secret_new_token_99999", 1, true)).to_be_nil()
                expect(raw_record.oauth_data_encrypted:find("super_secret@example.com", 1, true)).to_be_nil()
                expect(raw_record.oauth_data_encrypted:find("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9999", 1, true)).to_be_nil()
                expect(raw_record.access_token_encrypted:find("ya29.super_secret_new_token_99999", 1, true)).to_be_nil()

                -- Verify data can be decrypted correctly
                local connection, err = oauth_read_repo.get_connection(test_data.component_id)
                expect(err).to_be_nil()
                expect(connection.tokens.access_token).to_equal("ya29.super_secret_new_token_99999")
                expect(connection.user_profile.email).to_equal("super_secret@example.com")
                expect(connection.client_credentials.client_secret).to_equal("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9999")
            end)

        end)








    end)
end

return test.run_cases(define_tests)
