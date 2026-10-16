-- Fresh-install schema. Columns, constraints and indexes are declared at creation.

return require("migration").define(function()
    migration("08 derived acl", function()
        database("postgres", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE kickside_component_ancestor (
                    "component_id" uuid NOT NULL,
                    "ancestor_id" uuid NOT NULL,
                    "depth" integer NOT NULL,
                    CONSTRAINT "kickside_component_ancestor_depth_check" CHECK (depth >= 0),
                    CONSTRAINT "kickside_component_ancestor_check" CHECK (depth = 0 AND component_id = ancestor_id OR depth > 0 AND component_id <> ancestor_id),
                    CONSTRAINT "kickside_component_ancestor_pkey" PRIMARY KEY (component_id, ancestor_id),
                    CONSTRAINT "kickside_component_ancestor_component_id_fkey" FOREIGN KEY (component_id) REFERENCES kickside_components(component_id) ON DELETE CASCADE,
                    CONSTRAINT "kickside_component_ancestor_ancestor_id_fkey" FOREIGN KEY (ancestor_id) REFERENCES kickside_components(component_id) ON DELETE CASCADE
                    )
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_component_ancestor_parent ON kickside_component_ancestor USING btree (ancestor_id, component_id)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_component_ancestor_depth ON kickside_component_ancestor USING btree (component_id, depth, ancestor_id)
                ]=])
                if err then error(err) end
            end)
            down(function(db)
                local _, err = db:execute("DROP TABLE kickside_component_ancestor")
                if err then error(err) end
            end)
        end)
        database("sqlite", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE kickside_component_ancestor ( component_id TEXT NOT NULL REFERENCES "kickside_components"(component_id) ON DELETE CASCADE, ancestor_id TEXT NOT NULL REFERENCES "kickside_components"(component_id) ON DELETE CASCADE, depth INTEGER NOT NULL CHECK(depth>=0), PRIMARY KEY(component_id,ancestor_id), CHECK((depth=0 AND component_id=ancestor_id) OR (depth>0 AND component_id<>ancestor_id)))
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_component_ancestor_parent ON kickside_component_ancestor(ancestor_id,component_id)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_component_ancestor_depth ON kickside_component_ancestor(component_id,depth,ancestor_id)
                ]=])
                if err then error(err) end
            end)
            down(function(db)
                local _, err = db:execute("DROP TABLE kickside_component_ancestor")
                if err then error(err) end
            end)
        end)
    end)
end)
