-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local sql = require("sql")
local json = require("json")
local fields = require("secret_fields")
local document = require("secrets_document")
local types = require("component_types")
local meta_ops = require("meta_ops")
local persisted_json = require("persisted_json")
local cleanup = require("error_envelope").cleanup

type Params = {string | integer}
type Report = {converted: integer, invalid: integer, needs_continue: boolean}
type Candidate = {component_id: string, impl_id: string, private_context: unknown, encrypted_secrets: string?, secrets_generation: integer?, secrets_incarnation: string?}
type Selection = {component_id: string}
type Scan = {cursor: string, complete: boolean, invalid: integer}
local M = {}

-- Registry revisions are the authoritative declaration invalidation boundary. A
-- worker scans every declared kind once for each revision, then the partial index
-- handles only pre-encryption rows until declarations change again.
local scan_revision: string? = nil
local scans: {[string]: Scan} = {}

-- Classify legacy rows before pagination so malformed rows cannot consume every batch.
local function validity(engine: string, declarations: types.SecretField[], parameters: Params): (string?, error?)
    local predicates: {string} = {}
    for _, field in ipairs(declarations) do
        for depth = 1, #field.path do
            local expression: string
            local presence: string
            if engine == sql.type.POSTGRES then
                local arguments: {string} = {}
                for i = 1, depth do
                    parameters[#parameters + 1] = field.path[i]
                    arguments[#arguments + 1] = "$" .. tostring(#parameters)
                end
                local value = "jsonb_extract_path(private_context," .. table.concat(arguments, ",") .. ")"
                expression = "jsonb_typeof(" .. value .. ")"
                presence = "(" .. expression .. "='object' AND jsonb_typeof(" .. value .. "->'set')='boolean')"
            else
                local path = "$"
                for i = 1, depth do
                    local part, encode_err = json.encode(field.path[i])
                    if encode_err then return nil, encode_err end
                    path = path .. "." .. (part :: string)
                end
                parameters[#parameters + 1] = path
                expression = "json_type(private_context,?" .. tostring(#parameters) .. ")"
                presence = "false"
                if depth == #field.path then
                    parameters[#parameters + 1] = path .. '."set"'
                    presence = "(" .. expression .. "='object' AND json_type(private_context,?" .. tostring(#parameters) .. ") IN ('true','false'))"
                end
            end
            local expected = depth == #field.path and "string" or "object"
            if engine ~= sql.type.POSTGRES and expected == "string" then expected = "text" end
            local valid = "COALESCE(" .. expression .. ",'absent') IN ('" .. expected .. "','absent','null')"
            if depth == #field.path then
                valid = "(" .. valid .. " OR (encrypted_secrets IS NOT NULL AND " .. presence .. "))"
            end
            predicates[#predicates + 1] = valid
        end
    end
    local check = table.concat(predicates, " AND ")
    if engine == sql.type.POSTGRES then
        return "CASE WHEN private_context IS NULL THEN 1 WHEN jsonb_typeof(private_context)='object' AND " .. check .. " THEN 1 ELSE 0 END", nil
    end
    return "CASE WHEN private_context IS NULL OR private_context='' THEN 1 WHEN json_valid(private_context) THEN CASE WHEN json_type(private_context)='object' AND " .. check .. " THEN 1 ELSE 0 END ELSE 0 END", nil
end

local function convert(db: sql.DB, id: string): (boolean?, error?)
    local tx, begin_err = db:begin()
    if begin_err then return nil, begin_err end
    local primary = meta_ops.lock_component_tx(tx, id)
    local row: Candidate? = nil
    if not primary then
        local rows, read_err = tx:query("SELECT component_id,impl_id,private_context,encrypted_secrets,secrets_generation,secrets_incarnation FROM kickside_components WHERE component_id=$1", {id})
        primary = read_err
        if rows and rows[1] then row = rows[1] :: Candidate end
    end
    local changed = false
    if not primary and row then
        local raw = row.private_context
        if raw == nil or raw == "" then raw = "{}" end
        local context, decode_err = persisted_json.decode_table(raw, "component.private_context")
        primary = decode_err
        local complete = false
        if not primary and row.encrypted_secrets ~= nil then
            local declarations, declaration_err = document.write_paths(row.impl_id, row.encrypted_secrets, row.secrets_generation, row.secrets_incarnation)
            primary = declaration_err
            local stored_paths, paths_err = document.paths(row.encrypted_secrets, row.secrets_generation, row.secrets_incarnation)
            primary = primary or paths_err
            if not primary then
                local effective = declarations :: types.SecretField[]
                local existing = stored_paths :: types.SecretField[]
                complete = #effective == #existing and fields.complete(effective, context :: types.JsonMap)
                if not complete then
                    local secrets, decrypt_err = document.decode(row.component_id, row.encrypted_secrets, row.secrets_generation, row.secrets_incarnation)
                    primary = decrypt_err
                    if not primary then context, primary = fields.merge(stored_paths :: types.SecretField[], context :: types.JsonMap, secrets :: types.JsonMap) end
                end
            end
        end
        if not primary and not complete then
            local visible, secret_write, prepare_err = document.prepare(row.component_id, row.impl_id, context :: types.JsonMap, row.encrypted_secrets, row.secrets_generation, row.secrets_incarnation)
            primary = prepare_err
            if not primary and secret_write then
                local encoded, encode_err = json.encode(visible)
                primary = encode_err
                if not primary then
                    local result, write_err = tx:execute("UPDATE kickside_components SET private_context=$1,encrypted_secrets=$2,secrets_generation=$3,secrets_incarnation=$4 WHERE component_id=$5", {encoded, secret_write.encrypted, secret_write.generation, secret_write.incarnation, row.component_id})
                    primary = write_err
                    changed = result and result.rows_affected == 1
                end
            end
        end
    end
    if primary then
        return nil, cleanup(function(): (boolean?, error?) return tx:rollback() end, primary, "rollback component secret migration")
    end
    local _, commit_err = tx:commit()
    if commit_err then return nil, commit_err end
    return changed, nil
end

local function placeholder(engine: string, parameters: Params): string
    return engine == sql.type.POSTGRES and "$" .. tostring(#parameters) or "?" .. tostring(#parameters)
end

local function select_pending(db: sql.DB, engine: string, kind: types.SecretKind, declarations: types.SecretField[],
    scan: boolean, cursor: string?, remaining: integer): ({Selection}?, error?)
    local parameters: Params = {kind.id}
    local valid, valid_err = validity(engine, declarations, parameters)
    if valid_err then return nil, valid_err end
    local filter = scan and "true" or "encrypted_secrets IS NULL"
    if cursor ~= nil then
        parameters[#parameters + 1] = cursor
        filter = filter .. " AND component_id > " .. placeholder(engine, parameters)
    end
    local rows, query_err = db:query("SELECT component_id FROM kickside_components WHERE impl_id=$1 AND " .. filter
        .. " AND (" .. valid .. ")=1 ORDER BY component_id LIMIT " .. tostring(remaining + 1), parameters)
    if query_err then return nil, query_err end
    return rows :: {Selection}, nil
end

local function invalid_rows(db: sql.DB, engine: string, kind: types.SecretKind, declarations: types.SecretField[],
    full_revision_scan: boolean): (integer?, error?)
    local parameters: Params = {kind.id}
    local valid, valid_err = validity(engine, declarations, parameters)
    if valid_err then return nil, valid_err end
    local pending = full_revision_scan and "" or " AND encrypted_secrets IS NULL"
    local rows, query_err = db:query("SELECT COUNT(*) AS count FROM kickside_components WHERE impl_id=$1" .. pending
        .. " AND (" .. valid .. ")=0", parameters)
    if query_err then return nil, query_err end
    local count = tonumber(rows[1].count)
    return count and math.floor(count) or 0, nil
end

function M.run(limit: integer): (Report?, error?)
    if limit < 1 or limit > 50 or limit % 1 ~= 0 then
        return nil, errors.new({kind = errors.INVALID, message = "component secret migration batch must be 1..50"})
    end
    local kinds, revision, declaration_err = fields.declarations()
    if declaration_err then return nil, declaration_err end
    if revision == nil then return nil, errors.new({kind = errors.INTERNAL, retryable = false,
        message = "component secret declaration revision is unavailable"}) end
    if scan_revision ~= revision then
        scan_revision, scans = revision, {}
        for _, kind in ipairs(kinds or {}) do scans[kind.id] = {cursor = "", complete = false, invalid = 0} end
    end
    local db, db_err = sql.get(types.db_id())
    if db_err then return nil, db_err end
    local engine, primary = db:type()
    local report: Report = {converted = 0, invalid = 0, needs_continue = false}
    local attempted = 0
    for _, kind in ipairs(kinds or {}) do
        if primary then break end
        local scan = scans[kind.id]
        if scan == nil then scan = {cursor = "", complete = false, invalid = 0}; scans[kind.id] = scan end
        local declarations = kind.meta.secret_fields
        local remaining = limit - attempted
        if remaining <= 0 then
            report.needs_continue = true
            break
        end
        local full_scan = not scan.complete
        local cursor = full_scan and scan.cursor ~= "" and scan.cursor or nil
        local selected, select_err = select_pending(db, engine, kind, declarations, full_scan, cursor, remaining)
        primary = select_err
        local scanned_invalid = false
        if not primary then
            local count = #selected
            local processed = math.min(remaining, count)
            for index = 1, processed do
                attempted = attempted + 1
                local changed, convert_err = convert(db, selected[index].component_id)
                if convert_err then
                    local details = convert_err:details()
                    local code = type(details) == "table" and details.code or nil
                    if code == "component_secrets_integrity" or code == "component_secrets_envelope" or code == "component_secrets_cannot_decrypt"
                        or code == "component_secrets_inconsistent" or code == "component_secret_field"
                        or code == "persisted_data" then
                        report.invalid = report.invalid + 1
                        scan.invalid = scan.invalid + 1
                    else primary = convert_err; break end
                elseif changed then report.converted = report.converted + 1 end
            end
            if not primary and not scan.complete then
                if count > remaining then
                    scan.cursor = selected[processed].component_id
                    report.needs_continue = true
                else
                    scan.complete = true
                    local invalid, invalid_err = invalid_rows(db, engine, kind, declarations, true)
                    primary = invalid_err
                    if not primary and invalid then
                        scan.invalid = scan.invalid + invalid
                        report.invalid = report.invalid + invalid
                    end
                    scanned_invalid = true
                end
            elseif not primary and count > remaining then
                report.needs_continue = true
            end
        end
        if not primary and scan.complete and not scanned_invalid then
            local invalid, invalid_err = invalid_rows(db, engine, kind, declarations, false)
            primary = invalid_err
            if not primary and invalid then
                if invalid > scan.invalid then report.invalid = report.invalid + invalid - scan.invalid end
                scan.invalid = invalid
            end
        end
    end
    if not primary then
        for _, scan in pairs(scans) do if not scan.complete then report.needs_continue = true; break end end
    end
    primary = cleanup(function(): (boolean?, error?) return db:release() end, primary, "release component secret migration database")
    if primary then return nil, primary end
    return report, nil
end

return M
