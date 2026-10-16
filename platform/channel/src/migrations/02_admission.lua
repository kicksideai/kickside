-- Fresh-install schema. Columns, constraints and indexes are declared at creation.

return require("migration").define(function()
    migration("02 admission", function()
        database("postgres", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE kickside_channel_admissions (
                    "session_id" text NOT NULL,
                    "provider" text NOT NULL,
                    "external_id" text NOT NULL,
                    "owner_id" text NOT NULL,
                    "record_id" text NOT NULL,
                    "link_id" text NOT NULL,
                    "identity_json" text NOT NULL,
                    "generation" integer NOT NULL,
                    CONSTRAINT "kickside_channel_admissions_generation_check" CHECK (generation >= 0),
                    CONSTRAINT "kickside_channel_admissions_pkey" PRIMARY KEY (session_id)
                    )
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_channel_admission_conversation ON kickside_channel_admissions USING btree (provider, external_id, session_id)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE TABLE kickside_channel_turns (
                    "turn_id" text NOT NULL,
                    "route_json" text NOT NULL,
                    "accepted_at" text NOT NULL,
                    "appended_at" text,
                    "reply_state" text,
                    "reply_hash" text,
                    "reply_message_ref" text,
                    "owner_provider" text,
                    "owner_external_id" text,
                    "retry_at" bigint,
                    CONSTRAINT "kickside_channel_turns_pkey" PRIMARY KEY (turn_id)
                    )
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_channel_turn_session ON kickside_channel_turns USING btree ((((route_json)::jsonb ->> 'session_id'::text)))
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_channel_turn_retention ON kickside_channel_turns USING btree (accepted_at, turn_id) WHERE ((appended_at IS NOT NULL) AND ((reply_state IS NULL) OR (reply_state = 'sent'::text)))
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX kickside_channel_turn_owner ON kickside_channel_turns USING btree (owner_provider, owner_external_id, accepted_at, turn_id)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX kickside_channel_turn_unappended ON kickside_channel_turns USING btree (accepted_at, turn_id) WHERE (appended_at IS NULL)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX kickside_channel_turn_retry_due ON kickside_channel_turns USING btree (retry_at, turn_id) WHERE ((appended_at IS NULL) AND (retry_at IS NOT NULL))
                ]=])
                if err then error(tostring(err)) end
            end)
            down(function(db)
                local _, err = db:execute("DROP TABLE kickside_channel_turns")
                if err then error(tostring(err)) end
                local _, err = db:execute("DROP TABLE kickside_channel_admissions")
                if err then error(tostring(err)) end
            end)
        end)
        database("sqlite", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE kickside_channel_admissions (
                    session_id TEXT PRIMARY KEY,
                    provider TEXT NOT NULL,
                    external_id TEXT NOT NULL,
                    owner_id TEXT NOT NULL,
                    record_id TEXT NOT NULL,
                    link_id TEXT NOT NULL,
                    identity_json TEXT NOT NULL,
                    generation INTEGER NOT NULL CHECK (generation >= 0)
                    )
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE TABLE "kickside_channel_turns" (
                    turn_id TEXT PRIMARY KEY,
                    route_json TEXT NOT NULL,
                    accepted_at TEXT NOT NULL,
                    appended_at TEXT
                    , reply_state TEXT, reply_hash TEXT, reply_message_ref TEXT, owner_provider TEXT, owner_external_id TEXT, retry_at BIGINT)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_channel_turn_session
                    ON "kickside_channel_turns" (json_extract(route_json, '$.session_id'))
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_channel_turn_retention
                    ON "kickside_channel_turns" (accepted_at, turn_id)
                    WHERE appended_at IS NOT NULL AND (reply_state IS NULL OR reply_state = 'sent')
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_channel_admission_conversation
                    ON kickside_channel_admissions(provider,external_id,session_id)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX kickside_channel_turn_owner
                    ON "kickside_channel_turns" (owner_provider,owner_external_id,accepted_at,turn_id)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX kickside_channel_turn_unappended
                    ON "kickside_channel_turns" (accepted_at,turn_id)
                    WHERE appended_at IS NULL
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX kickside_channel_turn_retry_due
                    ON "kickside_channel_turns" (retry_at,turn_id)
                    WHERE appended_at IS NULL AND retry_at IS NOT NULL
                ]=])
                if err then error(tostring(err)) end
            end)
            down(function(db)
                local _, err = db:execute("DROP TABLE kickside_channel_turns")
                if err then error(tostring(err)) end
                local _, err = db:execute("DROP TABLE kickside_channel_admissions")
                if err then error(tostring(err)) end
            end)
        end)
    end)
end)
