-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
-- Fixed ciphertext emitted by the previous implementation with the synthetic ab key.
local test = require("test")
local env = require("env")
local caller = require("caller")

return {run = test.run_cases(function()
    test.describe("stored ciphertext compatibility", function()
        test.it("reads ciphertext from the previous implementation through the environment key", function()
            local previous, env_err = env.get("ENCRYPTION_KEY")
            test.is_nil(env_err)
            local _, set_err = env.set("ENCRYPTION_KEY", string.rep("ab", 32))
            test.is_nil(set_err)
            local value, err = caller.decrypt("ALktw4L92IkYZUut/beD/5qvM62sf/F/DGHbuF1G/LWXJrElrFg18e9J0xQdGAnVyg==")
            local _, restore_err = env.set("ENCRYPTION_KEY", previous)
            test.is_nil(restore_err)
            test.is_nil(err)
            test.eq(value, "models-fixture-secret")
        end)
    end)
end)}
