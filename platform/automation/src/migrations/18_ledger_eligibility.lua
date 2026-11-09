return require("migration").define(function()
    migration("18 ledger eligibility", function()
        for _, dialect in ipairs({"postgres", "sqlite"}) do
            database(dialect, function()
                up(function(db)
                    local function execute(statement)
                        local _,err=db:execute(statement)
                        if err then error(tostring(err)) end
                    end
                    execute("ALTER TABLE kickside_trigger_item_ledger ADD COLUMN classification TEXT")
                    execute("ALTER TABLE kickside_trigger_item_ledger ADD COLUMN eligible_at DOUBLE PRECISION")
                    execute([[CREATE INDEX idx_trigger_ledger_front ON kickside_trigger_item_ledger
                        (owner_id,source_port,item_key,delivery_order,identity_key)
                        WHERE state IN ('retrying','waiting','uncertain','parked')]])
                    execute([[CREATE INDEX idx_trigger_ledger_eligible ON kickside_trigger_item_ledger
                        (owner_id,source_port,eligible_at,delivery_order,item_key,identity_key) WHERE eligible_at IS NOT NULL]])
                    execute([[CREATE INDEX idx_trigger_ledger_eligible_item ON kickside_trigger_item_ledger
                        (owner_id,source_port,item_key) WHERE eligible_at IS NOT NULL]])
                    execute([[CREATE INDEX idx_trigger_ledger_identity ON kickside_trigger_item_ledger
                        (owner_id,source_port,identity_key)]])
                    execute("UPDATE kickside_trigger_item_ledger SET expires_at=NULL WHERE state='resolved'")
                    local clock=dialect == "postgres" and "EXTRACT(EPOCH FROM next_attempt_at::timestamptz)"
                        or "julianday(next_attempt_at)"
                    local value="CASE WHEN state IN ('retrying','waiting','parked') AND identity_parked=false THEN COALESCE("
                        .. clock .. ",-1e30) END"
                    local differs=dialect == "postgres" and " IS DISTINCT FROM " or " IS NOT "
                    local function refresh(ref)
                        local scope="owner_id=" .. ref .. ".owner_id AND source_port=" .. ref .. ".source_port AND item_key=" .. ref .. ".item_key"
                        local head="(SELECT identity_key FROM kickside_trigger_item_ledger WHERE " .. scope
                            .. " AND state IN ('retrying','waiting','uncertain','parked') ORDER BY delivery_order,identity_key LIMIT 1)"
                        return "UPDATE kickside_trigger_item_ledger SET eligible_at=NULL WHERE " .. scope
                            .. " AND eligible_at IS NOT NULL AND identity_key" .. differs .. head .. "; "
                            .. "UPDATE kickside_trigger_item_ledger SET eligible_at=" .. value .. " WHERE " .. scope
                            .. " AND identity_key=" .. head .. " AND eligible_at" .. differs .. "(" .. value .. "); "
                    end
                    local columns="owner_id,source_port,item_key,identity_key,state,next_attempt_at,delivery_order,identity_parked"
                    if dialect == "postgres" then
                        execute("CREATE FUNCTION kickside_ledger_eligibility() RETURNS trigger AS $body$ BEGIN "
                            .. "IF TG_OP='DELETE' THEN " .. refresh("OLD") .. " ELSIF TG_OP='UPDATE' THEN "
                            .. "IF (OLD.owner_id,OLD.source_port,OLD.item_key) IS DISTINCT FROM (NEW.owner_id,NEW.source_port,NEW.item_key) THEN "
                            .. refresh("OLD") .. " END IF; END IF; "
                            .. "IF TG_OP<>'DELETE' THEN " .. refresh("NEW") .. " END IF; RETURN NULL; END $body$ LANGUAGE plpgsql")
                        execute("CREATE TRIGGER kickside_ledger_eligibility AFTER INSERT OR DELETE OR UPDATE OF " .. columns
                            .. " ON kickside_trigger_item_ledger FOR EACH ROW EXECUTE FUNCTION kickside_ledger_eligibility()")
                    else
                        for _,spec in ipairs({{name="insert",event="INSERT",body=refresh("NEW")},
                            {name="delete",event="DELETE",body=refresh("OLD")},
                            {name="update",event="UPDATE OF " .. columns,body=refresh("NEW")},
                            {name="move",event="UPDATE OF owner_id,source_port,item_key",
                                condition=" WHEN OLD.owner_id IS NOT NEW.owner_id OR OLD.source_port IS NOT NEW.source_port OR OLD.item_key IS NOT NEW.item_key",
                                body=refresh("OLD")}}) do
                            execute("CREATE TRIGGER kickside_ledger_eligibility_" .. spec.name .. " AFTER " .. spec.event
                                .. " ON kickside_trigger_item_ledger" .. (spec.condition or "") .. " BEGIN " .. spec.body .. " END")
                        end
                    end
                    -- Only the item ledger is visited. The partial front index
                    -- finds each identity's predecessor without a table scan.
                    execute("UPDATE kickside_trigger_item_ledger AS l SET eligible_at=" .. value
                        .. " WHERE state IN ('retrying','waiting','parked') AND identity_parked=false AND identity_key="
                        .. "(SELECT identity_key FROM kickside_trigger_item_ledger p WHERE p.owner_id=l.owner_id"
                        .. " AND p.source_port=l.source_port AND p.item_key=l.item_key"
                        .. " AND p.state IN ('retrying','waiting','uncertain','parked') ORDER BY delivery_order,identity_key LIMIT 1)")
                end)
            end)
        end
    end)
end)
