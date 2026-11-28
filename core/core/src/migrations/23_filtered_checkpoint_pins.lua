-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0

local function execute(db, statement)
    local _, err = db:execute(statement)
    if err then error(err) end
end

local function install_postgres(db)
    execute(db, [[DROP TRIGGER trg_kickside_projection_updated_at ON kickside_projection]])
    execute(db, [[CREATE TRIGGER trg_kickside_projection_updated_at
        BEFORE UPDATE ON kickside_projection FOR EACH ROW
        WHEN (OLD.active_filtered_pins=NEW.active_filtered_pins) EXECUTE FUNCTION core_set_updated_at()]])
    execute(db, [[CREATE FUNCTION core_count_filtered_checkpoint_pin() RETURNS trigger LANGUAGE plpgsql AS $$
        BEGIN
            IF TG_OP='INSERT' THEN
                UPDATE kickside_projection SET active_filtered_pins=active_filtered_pins+1
                    WHERE id=CAST(NEW.projection_id AS uuid);
            ELSE
                UPDATE kickside_projection SET active_filtered_pins=active_filtered_pins-1
                    WHERE id=CAST(OLD.projection_id AS uuid);
            END IF;
            RETURN NULL;
        END
    $$]])
    execute(db, [[CREATE TRIGGER core_count_filtered_checkpoint_pin
        AFTER INSERT OR DELETE ON kickside_filtered_checkpoint_pin FOR EACH ROW
        EXECUTE FUNCTION core_count_filtered_checkpoint_pin()]])
    execute(db, [[CREATE FUNCTION core_release_filtered_checkpoint_pin() RETURNS trigger LANGUAGE plpgsql AS $$
        BEGIN
            DELETE FROM kickside_filtered_checkpoint_pin WHERE cursor_id=CAST(OLD.id AS TEXT);
            RETURN NULL;
        END
    $$]])
    execute(db, [[CREATE FUNCTION core_release_filtered_checkpoint_pins_on_reset() RETURNS trigger LANGUAGE plpgsql AS $$
        BEGIN
            UPDATE kickside_projection_cursor SET continuation=''
                WHERE projection_id=NEW.id AND substr(continuation,1,2)='f:';
            RETURN NULL;
        END
    $$]])
end

local function install_sqlite(db)
    execute(db, [[DROP TRIGGER trg_kickside_projection_updated_at]])
    execute(db, [[CREATE TRIGGER trg_kickside_projection_updated_at
        AFTER UPDATE ON kickside_projection FOR EACH ROW
        WHEN OLD.active_filtered_pins=NEW.active_filtered_pins
        BEGIN
            UPDATE kickside_projection SET updated_at=datetime('now') WHERE id=NEW.id;
        END]])
    execute(db, [[CREATE TRIGGER core_count_filtered_checkpoint_pin_insert
        AFTER INSERT ON kickside_filtered_checkpoint_pin FOR EACH ROW
        BEGIN
            UPDATE kickside_projection SET active_filtered_pins=active_filtered_pins+1 WHERE id=NEW.projection_id;
        END]])
    execute(db, [[CREATE TRIGGER core_count_filtered_checkpoint_pin_delete
        AFTER DELETE ON kickside_filtered_checkpoint_pin FOR EACH ROW
        BEGIN
            UPDATE kickside_projection SET active_filtered_pins=active_filtered_pins-1 WHERE id=OLD.projection_id;
        END]])
end

return require("migration").define(function()
    migration("23 filtered checkpoint pins", function()
        for _, dialect in ipairs({"sqlite", "postgres"}) do
            database(dialect, function()
                up(function(db)
                    -- A storage owner can reference this identity in the same
                    -- database. Core never reads or writes the dependent payload.
                    execute(db, [[CREATE TABLE kickside_filtered_checkpoint_pin (
                        cursor_id TEXT PRIMARY KEY NOT NULL,
                        reset_generation BIGINT NOT NULL,
                        event_id TEXT NOT NULL,
                        projection_id TEXT NOT NULL,
                        UNIQUE(cursor_id,reset_generation,event_id)
                    )]])
                    execute(db, [[ALTER TABLE kickside_projection ADD COLUMN active_filtered_pins INTEGER
                        NOT NULL DEFAULT 0 CHECK (active_filtered_pins>=0)]])
                    local sqlite = dialect == "sqlite"
                    if sqlite then install_sqlite(db) else install_postgres(db) end
                    local retire = sqlite
                        and "BEGIN DELETE FROM kickside_filtered_checkpoint_pin WHERE cursor_id=OLD.id; END"
                        or "EXECUTE FUNCTION core_release_filtered_checkpoint_pin()"
                    execute(db, [[CREATE TRIGGER core_release_filtered_checkpoint_pin_delete
                        AFTER DELETE ON kickside_projection_cursor FOR EACH ROW
                        WHEN (substr(OLD.continuation,1,2)='f:') ]] .. retire)
                    execute(db, [[CREATE TRIGGER core_release_filtered_checkpoint_pin_clear
                        AFTER UPDATE OF continuation ON kickside_projection_cursor FOR EACH ROW
                        WHEN (substr(OLD.continuation,1,2)='f:' AND NEW.continuation='') ]] .. retire)
                    local reset = sqlite and [[BEGIN
                        UPDATE kickside_projection_cursor SET continuation=''
                            WHERE projection_id=NEW.id AND substr(continuation,1,2)='f:';
                    END]] or "EXECUTE FUNCTION core_release_filtered_checkpoint_pins_on_reset()"
                    execute(db, [[CREATE TRIGGER core_release_filtered_checkpoint_pins_reset
                        AFTER UPDATE OF reset_generation ON kickside_projection FOR EACH ROW
                        WHEN (OLD.reset_generation<>NEW.reset_generation AND OLD.active_filtered_pins>0) ]] .. reset)
                end)
            end)
        end
    end)
end)
