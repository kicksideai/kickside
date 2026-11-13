-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local json = require("json")
local policy = require("catalog_policy")

type Object = {[string]: unknown}
type Profile = {id: string, config_json: string, secret_json: string?}

return require("migration").define(function()
    migration("encrypt legacy provider headers", function()
        for _, engine in ipairs({"sqlite", "postgres"}) do
            database(engine, function()
                up(function(db)
                    local cursor = ""
                    while true do
                        local rows, read_err = db:query([[SELECT id,config_json,secret_json
                            FROM kickside_model_provider_profiles WHERE id>$1 ORDER BY id LIMIT 50]], {cursor})
                        if read_err then error(read_err) end
                        if #rows == 0 then break end
                        for _, raw in ipairs(rows) do
                            local row = raw :: Profile
                            local decoded, decode_err = json.decode(row.config_json)
                            if decode_err or type(decoded) ~= "table" then
                                error("invalid stored model provider configuration")
                            end
                            local config = decoded :: Object
                            if config.headers ~= nil then
                                local secret, secret_err = policy.decrypt_secret(row.secret_json)
                                if secret_err then error("cannot decrypt stored model provider credentials") end
                                if secret.headers ~= nil then error("conflicting stored model provider headers") end
                                secret.headers = config.headers
                                config.headers = nil
                                local encrypted, encrypt_err = policy.encrypt_secret(secret)
                                if encrypt_err then error("cannot encrypt stored model provider credentials") end
                                local encoded, encode_err = json.encode(config)
                                if encode_err then error("cannot encode stored model provider configuration") end
                                local _, write_err = db:execute([[UPDATE kickside_model_provider_profiles
                                    SET config_json=$1,secret_json=$2 WHERE id=$3]], {encoded,encrypted,row.id})
                                if write_err then error(write_err) end
                            end
                            cursor = row.id
                        end
                    end
                end)
            end)
        end
    end)
end)
