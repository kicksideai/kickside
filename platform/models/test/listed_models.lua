-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
-- The model list app:listed_provider declares: one provider model.
local function models(_args: any): any
    return { models = { "listed-model" } }
end

return { models = models }
