-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local env=require("env")
local security=require("security")
local secret_cipher=require("secret_cipher")
return {run=function(args)
    local key=assert(env.get("app:projection_owner_cipher_key"))
    local encrypted=assert(secret_cipher.encrypt(args.plaintext,key))
    local plain=assert(secret_cipher.decrypt(encrypted,key))
    return {ciphertext=encrypted,plaintext=plain,actor=security.actor():id()}
end}
