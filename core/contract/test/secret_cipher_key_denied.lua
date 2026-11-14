-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local cipher = require("secret_cipher")

return {load = function(): (string?, error?)
    return cipher.load_key("app:encryption_key")
end}
