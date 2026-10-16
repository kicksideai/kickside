local function incompatible(message: string, field: string): error
    return (errors.new({message = message, kind = errors.CONFLICT, retryable = false,
        details = {code = "migration_schema", field = "kickside_thread_natural_key." .. field}}) :: error)
end

return require("migration").define(function()
    migration("10 thread natural keys", function()
        for _, dialect in ipairs({"postgres","sqlite"}) do
            database(dialect, function()
                up(function(db)
                    local binary = dialect == "postgres" and "BYTEA" or "BLOB"
                    local id = dialect == "postgres" and "UUID" or "TEXT"
                    local ready = dialect == "postgres" and "BOOLEAN" or "INTEGER CHECK(ready IN (0,1))"
                    local size = dialect == "postgres" and "octet_length" or "length"
                    local _, err = db:execute([[CREATE TABLE IF NOT EXISTS kickside_thread_natural_key (
                        key_digest ]] .. binary .. [[ NOT NULL CHECK(]] .. size .. [[(key_digest)=32),
                        key_class TEXT NOT NULL,
                        key_ref TEXT NOT NULL,
                        thread_id ]] .. id .. [[ NOT NULL REFERENCES kickside_thread(id) ON DELETE CASCADE,
                        origin TEXT NOT NULL CHECK(origin IN ('legacy','v2')),
                        ready ]] .. ready .. [[ NOT NULL,
                        PRIMARY KEY(key_digest), UNIQUE(thread_id))]])
                    if err then error(err) end
                    local column_query = dialect == "postgres" and [[SELECT column_name AS name,data_type AS type,is_nullable
                            FROM information_schema.columns WHERE table_schema=current_schema()
                            AND table_name='kickside_thread_natural_key' ORDER BY ordinal_position]]
                        or "PRAGMA table_info(kickside_thread_natural_key)"
                    local constraint_query = dialect == "postgres" and [[SELECT contype,pg_get_constraintdef(oid) AS definition
                            FROM pg_constraint WHERE conrelid='kickside_thread_natural_key'::regclass]]
                        or [[SELECT sql AS definition FROM sqlite_master
                            WHERE type='table' AND name='kickside_thread_natural_key']]
                    local columns, column_err = db:query(column_query)
                    if column_err then error(column_err) end
                    local constraints, constraint_err = db:query(constraint_query)
                    if constraint_err then error(constraint_err) end
                    local names = {"key_digest","key_class","key_ref","thread_id","origin","ready"}
                    local types = {dialect=="postgres" and "bytea" or "blob","text","text",
                        dialect=="postgres" and "uuid" or "text","text",dialect=="postgres" and "boolean" or "integer"}
                    if type(columns) ~= "table" or #columns ~= #names then error(incompatible("incompatible natural key columns", "columns")) end
                    for i,column in ipairs(columns) do
                        if type(column) ~= "table" or type(column.type) ~= "string"
                            or column.name ~= names[i] or string.lower(column.type) ~= types[i]
                            or (dialect=="postgres" and column.is_nullable ~= "NO")
                            or (dialect=="sqlite" and tonumber(column.notnull) ~= 1) then
                            error(incompatible("incompatible natural key column: " .. names[i], names[i]))
                        end
                    end
                    if type(constraints) ~= "table" then
                        error(incompatible("incompatible natural key constraints", "constraints"))
                    end
                    local definitions = {}
                    for _,constraint in ipairs(constraints) do
                        if type(constraint) ~= "table" or type(constraint.definition) ~= "string" then
                            error(incompatible("incompatible natural key constraints", "constraints"))
                        end
                        definitions[#definitions+1] = string.lower(constraint.definition):gsub("%s+", "")
                    end
                    local definition = table.concat(definitions,";")
                    for _,required in ipairs({"primarykey(key_digest)","unique(thread_id)","referenceskickside_thread(id)ondeletecascade"}) do
                        if not string.find(definition,required,1,true) then error(incompatible("incompatible natural key constraint: " .. required, "constraints")) end
                    end
                end)
            end)
        end
    end)
end)
