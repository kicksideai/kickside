# Journal projection reconciler retirement

Owner approval is `2026-10-14 owner: approved DECISIONS.md section B`.

The current published `chestor/journal` 0.2.48 maintenance action includes
`reconcile`. Before updating, the single manual existing-installation procedure
in `scratchpad/sol-lanes/decisions/existing-installation-script.md` inventories
every Journal state projection, calls that current operation to replay the full
history, and records the result. The procedure stops on any failed report row.

The Core declaration fix refreshes a persisted projection event filter when
`ensure=true`. The replacement Journal guard resets and catches up the existing
Core projection, proving that the projection id and the canonical Journal read
model are preserved. The old reconciliation implementation and its drift
detector then have no remaining caller.

`chestor.journal.traits:migrate_legacy_tool` keeps its published registry id and
`handle` method for `reembed`. The reconcile-only `reconciled` output property retires with its action. Journal thread ids, projection ids, cursor ids,
event ids, stored tables, endpoint paths and contracts are unchanged. Existing
projection-input stamp columns and values remain stored; the retired detector no
longer reads them.
