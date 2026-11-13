-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local json = require("json")
local policy = require("catalog_policy")

type Profile = {id: string, config_json: string, secret_json: string, status: string, message: string}

return require("migration").define(function()
    migration("encrypt legacy provider headers", function()
        for _, engine in ipairs({"sqlite", "postgres"}) do
            database(engine, function()
                up(function(db, cursor)
                    local rows, read_err = db:query([[SELECT id,config_json,secret_json,status,message
                        FROM kickside_model_provider_profiles WHERE id>$1 ORDER BY id LIMIT 50]], {cursor or ""})
                    if read_err then error(read_err) end
                    if #rows == 0 then return nil end
                    for _, raw in ipairs(rows) do
                        local row = raw :: Profile
                        local decoded, decode_err = json.decode(row.config_json)
                        if decode_err or type(decoded) ~= "table" then
                            error("invalid stored model provider configuration")
                        end
                        local config, moved = policy.split_config(decoded)
                        local has_credentials = next(moved) ~= nil
                        local encrypted, encoded = row.secret_json, row.config_json
                        if has_credentials then
                            local secret, secret_err = policy.decrypt_secret(row.secret_json)
                            if secret_err then error("cannot decrypt stored model provider credentials") end
                            secret = policy.merge_config(moved, secret)
                            local encrypt_err
                            encrypted, encrypt_err = policy.encrypt_secret(secret)
                            if encrypt_err then error("cannot encrypt stored model provider credentials") end
                            local encode_err
                            encoded, encode_err = json.encode(config)
                            if encode_err then error("cannot encode stored model provider configuration") end
                        end
                        local message = row.status == "unhealthy" and "provider request failed" or row.message
                        if has_credentials or message ~= row.message then
                            local _, write_err = db:execute([[UPDATE kickside_model_provider_profiles
                                SET config_json=$1,secret_json=$2,message=$3 WHERE id=$4]], {encoded,encrypted,message,row.id})
                            if write_err then error(write_err) end
                        end
                    end
                    return (rows[#rows] :: Profile).id
                end, "batch")
            end)
        end
    end)
end)
