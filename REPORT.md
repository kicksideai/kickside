<!-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0 -->
# Knowledge dependency installation defaults

Installing a module that depends on Knowledge leaves its HTTP service and router requirements unbound when the host does not supply explicit parameters. Knowledge now defaults those requirements to the standard host gateway and authenticated API router. Explicit bindings still take precedence.

## Validation

The first-agent memory browser guard reproduces a boot failure before these defaults and verifies the real member splash with the defaults. The Knowledge packaging guard checks both defaults in the live registry.

## Compatibility

The existing requirement identities and targets stay unchanged. Hosts with explicit bindings keep their current behavior. The change adds no endpoint, data shape, migration, table write path or retention schedule. It creates no steady-state rows at 10x or 100x load.
