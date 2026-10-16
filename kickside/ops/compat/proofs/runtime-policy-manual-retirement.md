# Application runtime policy retirement

Owner 2026-10-14 Section A retires the legacy application policy declarations after
the single existing-installation script inventories and removes their stored uses.
The verified `kickside/kickside` 0.2.12 Hub pack contains all 16 retired identities.
These are the 16 replaced aliases with empty group lists. The other 18 original
policies still grant active application capabilities and retain their ids and rules.

Before the update, the operator runs the exact count, change and verification steps
in `scratchpad/sol-lanes/decisions/existing-installation-script.md`. The script
removes only referenced allow grants from custom scopes through the existing scope
writer and reconciles their projection. It revokes affected active MCP credentials
through their existing owner; it never replaces a narrow id with a broader compact
policy. Pending/recoverable identity carriers block the update until resolved.
Revoked credentials and completed audit history retain their original JSON.

All live source callers use the retained compact policy set. The application user
group keeps the same effective permissions. The compact runtime policy test retains
its fixed 34-rule baseline and evaluates the same action/resource matrix against
the current group; temporary test oracle policies replace retired registry lookups.
Tests that inspect a retired isolated policy disappear with that declaration.
No group, endpoint, contract, event or stored schema changes.
