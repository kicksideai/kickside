-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
-- A new forward ID also covers installations where repair 13 was recorded
-- before its worker notification failed. Do not alias it to migration 13.
return require("repair").define("14 stranded drive wake recovery")
