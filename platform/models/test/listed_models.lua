-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
-- The model list app:listed_provider declares: one provider model.
local function models(args: any): any
    if args.profile_id == "fixture-empty-list" then return { models = {} } end
    if args.profile_id == "fixture-missing-list" then return {} end
    if args.profile_id == "fixture-map-list" then return { models = { x = "model" } } end
    if args.profile_id == "fixture-invalid-id" then return { models = { false } } end
    return { models = { "listed-model" } }
end

return { models = models }
