local sql = require("sql")
local consts = require("mcp_consts")

-- Credential lifecycle and read-only management queries.
return function(M: any, db_open: any, now_unix: any, decode_restrictions: any)
    -- The old credential remains visible for 30 days after revocation or
    -- expiration, then the retention tick reclaims it. Active rows are retained.
    function M.prune_retired(limit: integer): (integer?, error?)
        if type(limit) ~= "number" or limit ~= math.floor(limit) or limit < 1 or limit > 500 then
            return nil, (errors.new({ message = "credential prune limit must be in [1,500]",
                kind = errors.INVALID, retryable = false }) :: error)
        end
        local db, db_err = db_open()
        if not db then
            return nil, (errors.new({ message = tostring(db_err), kind = errors.UNAVAILABLE,
                retryable = true }) :: error)
        end
        local cutoff = now_unix() - 30 * 86400
        local total = 0
        for _, spec in ipairs({
            { predicate = "status='revoked' AND revoked_at IS NOT NULL AND revoked_at <= $1",
                ordering = "revoked_at", cap = math.floor(limit / 2) },
            { predicate = "expires_at > 0 AND expires_at <= $1",
                ordering = "expires_at", cap = limit - math.floor(limit / 2) },
        }) do
            if spec.cap > 0 then
                local table_name = consts.TABLES.CREDENTIALS
                local result, err = db:execute("WITH expired AS (SELECT credential_id FROM " .. table_name
                    .. " WHERE " .. spec.predicate .. " ORDER BY " .. spec.ordering
                    .. ",credential_id LIMIT $2) DELETE FROM " .. table_name
                    .. " WHERE credential_id IN (SELECT credential_id FROM expired)", { cutoff, spec.cap })
                if err then
                    db:release()
                    return nil, (errors.new({ message = "credential prune failed: " .. tostring(err),
                        kind = errors.INTERNAL, retryable = true }) :: error)
                end
                local count = result and tonumber(result.rows_affected)
                if not count then
                    db:release()
                    return nil, (errors.new({ message = "credential prune returned no affected-row count",
                        kind = errors.INTERNAL, retryable = true }) :: error)
                end
                total = total + count
            end
        end
        db:release()
        return total, nil
    end

    function M.delete_for_actor(actor_id: any): (boolean, error?)
        if type(actor_id) ~= "string" or actor_id == "" then
            return false, (errors.new({ message = "actor_id is required", kind = errors.INVALID }) :: error)
        end
        local db, db_err = db_open()
        if not db then return false, (errors.new({ message = "MCP database unavailable: " .. tostring(db_err),
            kind = errors.UNAVAILABLE, retryable = true }) :: error) end
        local tx, begin_err = db:begin({ isolation = sql.isolation.SERIALIZABLE })
        if begin_err or not tx then
            db:release()
            return false, (errors.new({ message = "actor credential delete begin failed: " .. tostring(begin_err),
                kind = errors.UNAVAILABLE, retryable = true }) :: error)
        end
        local table_name = consts.TABLES.CREDENTIALS
        local result, del_err = tx:execute("WITH page AS (SELECT credential_id FROM " .. table_name
            .. " WHERE actor_id=$1 ORDER BY credential_id LIMIT $2) DELETE FROM " .. table_name
            .. " WHERE credential_id IN (SELECT credential_id FROM page)", { actor_id, 100 })
        if del_err then tx:rollback(); db:release(); return false, (errors.new({ message = "delete by actor failed: " .. tostring(del_err),
            kind = errors.INTERNAL, retryable = true }) :: error) end
        if not result or tonumber(result.rows_affected) == nil then
            tx:rollback(); db:release()
            return false, (errors.new({ message = "actor credential delete returned no result",
                kind = errors.INTERNAL, retryable = true }) :: error)
        end
        local remaining, read_err = tx:query("SELECT credential_id FROM " .. table_name
            .. " WHERE actor_id=$1 LIMIT 1", { actor_id })
        if read_err or type(remaining) ~= "table" then
            tx:rollback(); db:release()
            return false, (errors.new({ message = "actor credential continuation read failed: "
                .. tostring(read_err or "missing rows"), kind = errors.INTERNAL, retryable = true }) :: error)
        end
        local more = remaining[1] ~= nil
        local _, commit_err = tx:commit()
        db:release()
        if commit_err then return false, (errors.new({ message = "actor credential page commit failed: "
            .. tostring(commit_err), kind = errors.UNAVAILABLE, retryable = true }) :: error) end
        if more then return false, (errors.new({ message = "actor credentials need another cleanup page",
            kind = errors.CONFLICT, retryable = true }) :: error) end
        return true, nil
    end

    function M.cleanup_principal(args: any): any
        local actor_id = type(args) == "table" and tostring((args :: any).actor_id or (args :: any).user_id or (args :: any).principal_id or "") or ""
        local ok, err = M.delete_for_actor(actor_id)
        if not ok then return { success = false, error = err } end
        return { success = true }
    end

    -- list: an actor's credentials (never the token hash).
    function M.list(actor_id: any): (any?, string?)
        if type(actor_id) ~= "string" or actor_id == "" then
            return nil, "actor_id is required"
        end
        local db, db_err = db_open()
        if not db then return nil, db_err end
        local rows, q_err = sql.builder.select(
            "credential_id", "token_prefix", "whitelist_json",
            "label", "status", "policy_json", "expires_at",
            "created_at", "updated_at", "last_used_at", "execution_identity_json"
        )
            :from(consts.TABLES.CREDENTIALS)
            :where("actor_id = ?", actor_id)
            :order_by("created_at DESC")
            :run_with(db):query()
        db:release()
        if q_err then return nil, "list failed: " .. tostring(q_err) end
        for _, row in ipairs((rows or {}) :: { any }) do
            local decode_err = decode_restrictions(row)
            if decode_err then return nil, decode_err end
            row.execution_identity_json = nil
        end
        return rows or {}, nil
    end

    -- get: a single credential's actor + status (no token), for ownership gating in the
    -- management API. Returns nil when absent.
    function M.get(credential_id: any): (any?, string?)
        if type(credential_id) ~= "string" or credential_id == "" then
            return nil, "credential_id is required"
        end
        local db, db_err = db_open()
        if not db then return nil, db_err end
        local rows, q_err = sql.builder.select("credential_id", "actor_id", "status")
            :from(consts.TABLES.CREDENTIALS)
            :where("credential_id = ?", credential_id)
            :limit(1)
            :run_with(db):query()
        db:release()
        if q_err then return nil, "get failed: " .. tostring(q_err) end
        if not rows or #rows == 0 then return nil, nil end
        return rows[1], nil
    end


end
