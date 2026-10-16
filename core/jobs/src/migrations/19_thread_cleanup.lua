-- Fresh-install schema. Columns, constraints and indexes are declared at creation.

return require("migration").define(function()
    migration("19 thread cleanup", function()
        database("postgres", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE kickside_job_thread_cleanup (
                    "thread_id" text NOT NULL,
                    "started" boolean NOT NULL DEFAULT false,
                    "next_page_seq" bigint NOT NULL DEFAULT 0,
                    "completed_at" text,
                    CONSTRAINT "kickside_job_thread_cleanup_next_page_seq_check" CHECK (next_page_seq >= 0),
                    CONSTRAINT "kickside_job_thread_cleanup_pkey" PRIMARY KEY (thread_id)
                    )
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE TABLE kickside_job_thread_cleanup_receipt (
                    "thread_id" text NOT NULL,
                    "page_seq" bigint NOT NULL,
                    "processed" bigint NOT NULL,
                    "done" boolean NOT NULL,
                    "discarded_json" text NOT NULL,
                    "unresolved_json" text NOT NULL,
                    "created_at" text NOT NULL,
                    "acknowledged_at" text,
                    CONSTRAINT "kickside_job_thread_cleanup_receipt_page_seq_check" CHECK (page_seq >= 0),
                    CONSTRAINT "kickside_job_thread_cleanup_receipt_processed_check" CHECK (processed >= 0),
                    CONSTRAINT "kickside_job_thread_cleanup_receipt_pkey" PRIMARY KEY (thread_id, page_seq)
                    )
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_job_thread_cleanup_receipt_retention ON kickside_job_thread_cleanup_receipt USING btree (acknowledged_at, created_at)
                ]=])
                if err then error(err) end
            end)
            down(function(db)
                local _, err = db:execute("DROP TABLE kickside_job_thread_cleanup_receipt")
                if err then error(err) end
                local _, err = db:execute("DROP TABLE kickside_job_thread_cleanup")
                if err then error(err) end
            end)
        end)
        database("sqlite", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE kickside_job_thread_cleanup (
                    thread_id TEXT PRIMARY KEY,
                    started INTEGER NOT NULL DEFAULT 0,
                    next_page_seq BIGINT NOT NULL DEFAULT 0 CHECK(next_page_seq >= 0),
                    completed_at TEXT)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE TABLE kickside_job_thread_cleanup_receipt (
                    thread_id TEXT NOT NULL, page_seq BIGINT NOT NULL CHECK(page_seq >= 0),
                    processed BIGINT NOT NULL CHECK(processed >= 0), done INTEGER NOT NULL,
                    discarded_json TEXT NOT NULL, unresolved_json TEXT NOT NULL,
                    created_at TEXT NOT NULL, acknowledged_at TEXT,
                    PRIMARY KEY(thread_id,page_seq))
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_job_thread_cleanup_receipt_retention
                    ON kickside_job_thread_cleanup_receipt(acknowledged_at,created_at)
                ]=])
                if err then error(err) end
            end)
            down(function(db)
                local _, err = db:execute("DROP TABLE kickside_job_thread_cleanup_receipt")
                if err then error(err) end
                local _, err = db:execute("DROP TABLE kickside_job_thread_cleanup")
                if err then error(err) end
            end)
        end)
    end)
end)
