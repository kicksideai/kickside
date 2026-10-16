-- The platform stores text; a Postgres database that is not UTF8 rejects every
-- non-ASCII byte at write time, one commit at a time, long after install. The
-- contract is asserted here, first, loudly: a misprovisioned database refuses
-- to migrate instead of failing in production on its first real name.
-- SQLite stores byte sequences verbatim and needs no assertion.

return require("migration").define(function()
    migration("database encoding is UTF8", function()
        database("postgres", function()
            up(function(db)
                local rows, query_err = db:query(
                    "SELECT pg_encoding_to_char(encoding) AS enc FROM pg_database WHERE datname = current_database()")
                if query_err then error(query_err) end
                if type(rows) ~= "table" or type(rows[1]) ~= "table"
                    or type(rows[1].enc) ~= "string" or rows[1].enc == "" then
                    error(errors.new({message = "database encoding query returns no encoding", kind = errors.INTERNAL,
                        retryable = false, details = {code = "migration_encoding_result", field = "database.encoding"}}))
                end
                local enc = rows[1].enc
                if enc ~= "UTF8" then
                    error(errors.new({message = "database encoding is " .. enc .. "; kickside requires UTF8 — " ..
                        "recreate the database with ENCODING 'UTF8' (TEMPLATE template0) before installing",
                        kind = errors.INVALID, retryable = false,
                        details = {code = "migration_encoding", field = "database.encoding"}}))
                end
            end)
            down(function(_db) end)
        end)

        database("sqlite", function()
            up(function(_db) end)
            down(function(_db) end)
        end)
    end)
end)
