-- Fresh-install schema. Columns, constraints and indexes are declared at creation.

return require("migration").define(function()
    migration("07 retention pins", function()
        database("postgres", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE kickside_retention_pin (
                    "thread_id" uuid NOT NULL,
                    "consumer_key" text NOT NULL,
                    "cursor_seq" bigint NOT NULL DEFAULT 0,
                    "generation" bigint NOT NULL DEFAULT 1,
                    "command_id" text,
                    "command_generation" bigint,
                    CONSTRAINT "kickside_retention_pin_cursor_seq_check" CHECK (cursor_seq >= 0),
                    CONSTRAINT "kickside_retention_pin_generation_check" CHECK (generation > 0),
                    CONSTRAINT "kickside_retention_pin_pkey" PRIMARY KEY (thread_id, consumer_key),
                    CONSTRAINT "kickside_retention_pin_thread_id_fkey" FOREIGN KEY (thread_id) REFERENCES kickside_thread(id) ON DELETE CASCADE
                    )
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_retention_pin_thread_cursor ON kickside_retention_pin USING btree (thread_id, cursor_seq)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE TABLE kickside_retention_pin_tombstone (
                    "thread_id" uuid NOT NULL,
                    "consumer_key" text NOT NULL,
                    "command_id" text NOT NULL,
                    "command_generation" bigint NOT NULL,
                    "pin_generation" bigint NOT NULL,
                    "terminal_op_id" text NOT NULL,
                    "installed_at" text NOT NULL,
                    CONSTRAINT "kickside_retention_pin_tombstone_command_generation_check" CHECK (command_generation > 0),
                    CONSTRAINT "kickside_retention_pin_tombstone_pin_generation_check" CHECK (pin_generation > 0),
                    CONSTRAINT "kickside_retention_pin_tombstone_pkey" PRIMARY KEY (thread_id, consumer_key),
                    CONSTRAINT "kickside_retention_pin_tombstone_thread_id_fkey" FOREIGN KEY (thread_id) REFERENCES kickside_thread(id) ON DELETE CASCADE
                    )
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_pin_tombstone_installed ON kickside_retention_pin_tombstone USING btree (installed_at)
                ]=])
                if err then error(err) end
            end)
            down(function(db)
                local _, err = db:execute("DROP TABLE kickside_retention_pin_tombstone")
                if err then error(err) end
                local _, err = db:execute("DROP TABLE kickside_retention_pin")
                if err then error(err) end
            end)
        end)
        database("sqlite", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE kickside_retention_pin (
                    thread_id TEXT NOT NULL REFERENCES kickside_thread(id) ON DELETE CASCADE,
                    consumer_key TEXT NOT NULL,
                    cursor_seq INTEGER NOT NULL DEFAULT 0 CHECK (cursor_seq >= 0),
                    generation INTEGER NOT NULL DEFAULT 1 CHECK (generation > 0),
                    command_id TEXT,
                    command_generation INTEGER,
                    PRIMARY KEY (thread_id, consumer_key)
                    )
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_retention_pin_thread_cursor ON kickside_retention_pin(thread_id, cursor_seq)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE TABLE kickside_retention_pin_tombstone (
                    thread_id TEXT NOT NULL REFERENCES kickside_thread(id) ON DELETE CASCADE,
                    consumer_key TEXT NOT NULL,
                    command_id TEXT NOT NULL,
                    command_generation INTEGER NOT NULL CHECK (command_generation > 0),
                    pin_generation INTEGER NOT NULL CHECK (pin_generation > 0),
                    terminal_op_id TEXT NOT NULL,
                    installed_at TEXT NOT NULL,
                    PRIMARY KEY (thread_id, consumer_key)
                    )
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_pin_tombstone_installed ON kickside_retention_pin_tombstone(installed_at)
                ]=])
                if err then error(err) end
            end)
            down(function(db)
                local _, err = db:execute("DROP TABLE kickside_retention_pin_tombstone")
                if err then error(err) end
                local _, err = db:execute("DROP TABLE kickside_retention_pin")
                if err then error(err) end
            end)
        end)
    end)
end)
