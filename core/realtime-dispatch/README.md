# kickside/realtime-dispatch

Bounded audience dispatch through the selected realtime owner.

Open `kickside.contract:realtime_batch` and call `notify({user_ids, topic, data})`.
The audience contains one to 128 users and is authorized as a whole. The selected
scalar Realtime binding owns transport; this module adds no durable delivery
promise or database.

## Development

Use the Wippy release pinned in [CI](../../.github/workflows/ci.yml).
From this module directory, run `make lockrefresh`,
`make lint`, and `make test`. The harness supplies the scalar owner fixtures.

## Reference

- [Module reference](src/README.md)
