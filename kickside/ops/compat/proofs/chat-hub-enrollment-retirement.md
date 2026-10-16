# Chat hub enrollment retirement

Owner approval: `2026-10-15 owner: no per-message ack machinery`.

Published baseline: kickside/channel 0.2.2. The ingress writer no longer waits up
to 10 seconds for the session hub to acknowledge an accepted turn. The
accepted-turn row written by `persist.accept_turn` is the enrollment, so the
library `kickside.channel.service:turn_enrollment`, the hub messages
`turn_enroll`, `turn_aborted` and `turn_settled`, and the hub's in-memory writer
enrollment bookkeeping are removed. A turn whose writer ends before the hub
receives it stays unappended and is recovered by the hub's boot recovery and
retry deadline. Declined-message witness events are published by the ingress
writer after the same authorization checks the hub applied.

No stored data changes and no registry id other than the library is removed.

Proof: `platform/channel/test/receive_test.lua` (publication admitted only for
its bridge, principal and conversation; ingress write limited to a witness
inbound) and `platform/channel/test/turn_upgrade_test.lua`.
