# Realtime audience dispatch

`kickside.contract:realtime_batch.notify` accepts `user_ids` (one to 128), `topic` and optional `data`. It authorizes the whole audience, deduplicates users, and invokes the selected `kickside.contract:realtime.notify` owner concurrently with its existing scalar `user_id` input. Every response completes before the batch reports success; native errors retain their metadata.

This package has no host requirements and depends only on `kickside/contract`. Relay remains an implementation of the scalar contract. Offline clients reconcile their state on reconnect; realtime dispatch creates no durable delivery promise.

The core leaf owns dispatch and failure semantics. The host selects the scalar contract binding. An unbound scalar capability returns `{success=true, notified=0, status="not_supported"}`; failures from a bound owner propagate as native errors.
