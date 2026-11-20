-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0

return require("migration").define(function()
    migration("31 remove legacy Jobs thread cascades", function()
        database("postgres", function()
            up(function(db)
                -- Jobs detaches retained thread links and removes thread-owned
                -- history in its cleanup pages. The original CASCADE links
                -- also make a claim's run insert lock the Core thread after
                -- Jobs rows, opposite to Core append and wake.
                local _, err = db:execute([[
                    DO $migration$
                    DECLARE
                        child record;
                        legacy record;
                        parents text[] := '{}';
                        children text[] := '{}';
                        changes text[] := '{}';
                        alteration text;
                        relation_list text;
                        prior_timeout text;
                    BEGIN
                        FOR child IN
                            SELECT rel.oid, format('%I.%I', ns.nspname, rel.relname) AS qualified,
                                   col.attnum, col.attnotnull
                            FROM pg_catalog.pg_class rel
                            JOIN pg_catalog.pg_namespace ns ON ns.oid = rel.relnamespace
                            JOIN pg_catalog.pg_attribute col ON col.attrelid = rel.oid AND col.attname = 'thread_id'
                            WHERE rel.oid IN (
                                pg_catalog.to_regclass('kickside_job'), pg_catalog.to_regclass('kickside_job_run'))
                            ORDER BY rel.relname
                        LOOP
                            alteration := CASE WHEN child.attnotnull THEN 'ALTER COLUMN thread_id DROP NOT NULL' END;
                            FOR legacy IN
                                SELECT c.conname, format('%I.%I', ns.nspname, parent.relname) AS qualified_parent
                                FROM pg_catalog.pg_constraint c
                                JOIN pg_catalog.pg_class parent ON parent.oid = c.confrelid
                                JOIN pg_catalog.pg_namespace ns ON ns.oid = parent.relnamespace
                                JOIN pg_catalog.pg_attribute target ON target.attrelid = parent.oid AND target.attname = 'id'
                                WHERE c.conrelid = child.oid AND c.contype = 'f' AND c.confdeltype = 'c'
                                  AND c.conkey = ARRAY[child.attnum] AND c.confkey = ARRAY[target.attnum]
                                  AND parent.relname = 'kickside_thread'
                                ORDER BY c.conname
                            LOOP
                                parents := array_append(parents, legacy.qualified_parent);
                                alteration := concat_ws(', ', alteration, format('DROP CONSTRAINT %I', legacy.conname));
                            END LOOP;
                            IF alteration IS NOT NULL THEN
                                children := array_append(children, child.qualified);
                                changes := array_append(changes, format('ALTER TABLE %s %s', child.qualified, alteration));
                            END IF;
                        END LOOP;
                        IF cardinality(changes) = 0 THEN RETURN; END IF;

                        -- Dropping these FKs takes a relation lock on Core as well.
                        -- Acquire the whole set without waiting behind live workers.
                        SELECT concat_ws(', ', string_agg(DISTINCT p, ', ' ORDER BY p),
                            array_to_string(children, ', ')) INTO relation_list FROM unnest(parents) AS p;
                        EXECUTE 'LOCK TABLE ' || relation_list || ' IN ACCESS EXCLUSIVE MODE NOWAIT';
                        prior_timeout := current_setting('lock_timeout');
                        IF (SELECT setting::int FROM pg_catalog.pg_settings WHERE name = 'lock_timeout') NOT BETWEEN 1 AND 2000 THEN
                            PERFORM set_config('lock_timeout', '2s', true);
                        END IF;
                        FOREACH alteration IN ARRAY changes LOOP
                            EXECUTE alteration;
                        END LOOP;
                        PERFORM set_config('lock_timeout', prior_timeout, true);
                    END
                    $migration$
                ]])
                if err then error(err) end
            end)
            -- Fresh schemas have no such constraints. Reintroducing them on
            -- downgrade would invalidate established detached links.
            down(function(_db) end)
        end)
        database("sqlite", function()
            -- The historical SQLite 07 rebuild removed these links.
            up(function(_db) end)
            down(function(_db) end)
        end)
    end)
end)
