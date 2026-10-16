local test = require("test")
local fixture = require("fixture")
local sql = require("sql")
local crypto = require("crypto")
local uuid = require("uuid")
local funcs = require("funcs")
local security = require("security")
local channel = require("channel")
local time = require("time")
local reader = require("reader")

local function legacy_id(class, ref)
    local hex = crypto.hmac.sha256("kickside.thread", class .. ":" .. ref)
    return string.format("%s-%s-%s-%s-%s", hex:sub(1,8), hex:sub(9,12),
        "5" .. hex:sub(14,16), hex:sub(17,20), hex:sub(21,32))
end

local function v8_id(class, ref)
    local encoded = "kickside.thread.key/v2;" .. tostring(#class) .. ":" .. class .. tostring(#ref) .. ":" .. ref
    local hex = crypto.hmac.sha256("kickside.thread", encoded)
    local variant = string.format("%x", (tonumber(hex:sub(17,17),16) :: number) % 4 + 8)
    return string.format("%s-%s-8%s-%s%s-%s", hex:sub(1,8), hex:sub(9,12), hex:sub(14,16),
        variant, hex:sub(18,20), hex:sub(21,32))
end

local function query(statement, params)
    local db, err = sql.get("app:db")
    test.is_nil(err)
    local rows, read_err = db:query(statement, params or {})
    db:release()
    test.is_nil(read_err)
    return rows
end

local function bind_existing(class, ref, id)
    local db, db_err=sql.get("app:db")
    test.is_nil(db_err)
    local dialect, dialect_err=db:type()
    test.is_nil(dialect_err)
    local digest=crypto.hmac.sha256("kickside.thread","kickside.thread.key/v2;"..tostring(#class)..":"..class..tostring(#ref)..":"..ref)
    local expression=dialect==sql.type.POSTGRES and "decode('"..digest.."','hex')" or "X'"..digest.."'"
    local _, insert_err=db:execute("INSERT INTO kickside_thread_natural_key (key_digest,key_class,key_ref,thread_id,origin,ready) VALUES ("..expression..",$1,$2,$3,'legacy',$4)",
        {class,ref,id,dialect==sql.type.SQLITE and 1 or true})
    db:release()
    test.is_nil(insert_err)
end

local function old_upsert(context, args)
    return funcs.new():with_actor(security.new_actor(context.owner, {security_groups={}}))
        :with_scope(context.test_scope()):call("kickside.core.threads:pre_update_upsert", args)
end

local function race(context, args, old_first, expected_id, expected_created)
    local start, done = channel.new(8), channel.new(8)
    for i=1,8 do
        coroutine.spawn(function()
            start:receive()
            local result, err
            if old_first and i % 2 == 0 then result, err = old_upsert(context,args)
            else result, err = context.as_owner("upsert",args) end
            done:send({result=result,err=err})
        end)
    end
    for _=1,8 do start:send(true) end
    local id, created = nil, 0
    for _=1,8 do
        local selected=channel.select({done:case_receive(),time.after("20s"):case_receive()})
        test.eq(selected.channel,done,"racing upsert completes within 20s")
        test.is_nil(selected.value.err)
        local result=selected.value.result
        if id then test.eq(result.thread_id,id) else id=result.thread_id end
        if result.created then created=created+1 end
    end
    test.eq(created,expected_created == nil and 1 or expected_created)
    test.eq(id,expected_id or legacy_id(args.thread_class,args.external_ref))
    test.eq(#query("SELECT id FROM kickside_thread WHERE id=$1",{id}),1)
    test.eq(#query("SELECT thread_id FROM kickside_thread_natural_key WHERE thread_id=$1",{id}),1)
end

local function define_tests()
    test.describe("thread natural key integrity", function()
        test.it("keeps delimiter-containing natural key tuples distinct and individually idempotent", function()
            for _, reverse in ipairs({false, true}) do
                local context = fixture.new()
                local keys = {
                    {thread_class = "natural:" .. context.suffix, external_ref = "tail"},
                    {thread_class = "natural", external_ref = context.suffix .. ":tail"},
                }
                if reverse then keys[1], keys[2] = keys[2], keys[1] end
                local identities = {}
                for i, key in ipairs(keys) do
                    local created, create_err = context.as_owner("upsert", key)
                    test.is_nil(create_err)
                    identities[i] = created.thread_id
                end
                test.neq(identities[1], identities[2])
                for i, key in ipairs(keys) do
                    local replay, replay_err = context.as_owner("upsert", key)
                    test.is_nil(replay_err)
                    test.eq(replay.thread_id, identities[i])
                    test.is_false(replay.created)
                end
            end
        end)

        test.it("preserves the existing natural upsert creation response shape", function()
            for _, class in ipairs({"response", " \t "}) do
                local c = fixture.new()
                local old, old_err = old_upsert(c, {
                    thread_class = class, external_ref = "old:" .. c.suffix, attrs = {value = "old"},
                })
                test.is_nil(old_err)
                local current, current_err = c.as_owner("upsert", {
                    thread_class = class, external_ref = "new:" .. c.suffix, attrs = {value = "new"},
                })
                test.is_nil(current_err)
                test.eq(current.thread.thread_class, old.thread.thread_class)
                local replay, replay_err = c.as_owner("upsert", {
                    thread_class = class, external_ref = "new:" .. c.suffix,
                })
                test.is_nil(replay_err)
                test.eq(replay.thread_id, current.thread_id)
                test.is_false(replay.created)
                for key, value in pairs(old.thread) do
                    test.eq(type(current.thread[key]), type(value), "creation preserves thread field " .. key)
                end
                for key, value in pairs(current.thread) do
                    test.eq(type(old.thread[key]), type(value), "creation retains the existing thread view")
                end
            end
        end)

        test.it("authorizes and hydrates an already loaded canonical thread", function()
            local c = fixture.new()
            local created, create_err = c.as_owner("upsert", {
                thread_class = "loaded:" .. c.suffix, external_ref = "ref", attrs = {value = "loaded"},
            })
            test.is_nil(create_err)
            local row = query("SELECT * FROM kickside_thread WHERE id=$1", {created.thread_id})[1]
            local function read_as(actor)
                return funcs.new():with_actor(security.new_actor(actor, {security_groups={}}))
                    :with_scope(c.test_scope()):call("kickside.core.threads:loaded_read_probe", row)
            end
            local loaded, load_err = read_as(c.owner)
            test.is_nil(load_err)
            test.eq(loaded.id, created.thread_id)
            test.eq(loaded.attrs.value, "loaded")
            local denied, denial = read_as(c.stranger)
            test.is_nil(denied)
            test.eq(denial:kind(), errors.PERMISSION_DENIED)
        end)

        test.it("preserves old ids after manual legacy binding",function()
            local c=fixture.new()
            local args={thread_class="legacy:"..c.suffix,external_ref="opaque:é:ref"}
            local old,err=old_upsert(c,args)
            test.is_nil(err)
            bind_existing(args.thread_class,args.external_ref,old.thread_id)
            local replay,replay_err=c.as_owner("upsert",args)
            test.is_nil(replay_err)
            test.eq(replay.thread_id,old.thread_id)
            test.is_false(replay.created)
            test.eq(replay.thread_id,legacy_id(args.thread_class,args.external_ref))
            test.eq(#query("SELECT thread_id FROM kickside_thread_natural_key WHERE thread_id=$1",{old.thread_id}),1)
        end)
        test.it("requires manual binding before metadata edits and preserves the legacy id",function()
            local c=fixture.new()
            local args={thread_class="edit:"..c.suffix,external_ref="before"}
            local old,err=old_upsert(c,args)
            test.is_nil(err)
            local _,unbound_err=c.as_owner("update",{thread_id=old.thread_id,thread_class="after",attrs={changed=true}})
            test.eq(unbound_err:kind(),errors.CONFLICT)
            test.eq(unbound_err:details().reason,"legacy_natural_key_manual_adoption_required")
            test.eq(#query("SELECT thread_id FROM kickside_thread_natural_key WHERE thread_id=$1",{old.thread_id}),0)
            bind_existing(args.thread_class,args.external_ref,old.thread_id)
            local _,edit_err=c.as_owner("update",{thread_id=old.thread_id,thread_class="after",attrs={changed=true}})
            test.is_nil(edit_err)
            local replay,replay_err=c.as_owner("upsert",args)
            test.is_nil(replay_err)
            test.eq(replay.thread_id,old.thread_id)
            test.eq(replay.thread.thread_class,"after")
        end)
        test.it("allocates v8 only for a verified legacy collision",function()
            local c=fixture.new()
            local old,err=old_upsert(c,{thread_class="collision:"..c.suffix,external_ref="tail"})
            test.is_nil(err)
            bind_existing("collision:"..c.suffix,"tail",old.thread_id)
            local distinct,distinct_err=c.as_owner("upsert",{thread_class="collision",external_ref=c.suffix..":tail"})
            test.is_nil(distinct_err)
            test.neq(old.thread_id,distinct.thread_id)
            test.eq(distinct.thread_id:sub(15,15),"8")
            local valid,valid_err=uuid.validate(distinct.thread_id)
            test.is_nil(valid_err)
            test.is_true(valid)
            test.is_true(string.find("89ab",distinct.thread_id:sub(20,20),1,true)~=nil)
        end)
        test.it("refuses unverifiable legacy metadata without splitting",function()
            local c=fixture.new()
            local class,ref="unproven:"..c.suffix,"ref"
            local created,err=c.as_owner("create",{id=legacy_id(class,ref),thread_class=class,attrs={}})
            test.is_nil(err)
            local replay,replay_err=c.as_owner("upsert",{thread_class=class,external_ref=ref})
            test.is_nil(replay)
            test.eq(replay_err:kind(),errors.CONFLICT)
            test.not_nil(replay_err)
            test.eq(#query("SELECT thread_id FROM kickside_thread_natural_key WHERE thread_id=$1",{created.thread_id}),0)
        end)
        test.it("captures raw bytes before display class trimming",function()
            local c=fixture.new()
            local args={thread_class="  raw:"..c.suffix.."  ",external_ref=" ref:é "}
            local first,err=c.as_owner("upsert",args)
            test.is_nil(err)
            test.eq(first.thread_id,legacy_id(args.thread_class,args.external_ref))
            local replay,replay_err=c.as_owner("upsert",args)
            test.is_nil(replay_err)
            test.eq(replay.thread_id,first.thread_id)
        end)
        test.it("does not treat denied canonical access as absence",function()
            local c=fixture.new()
            local args={thread_class="private:"..c.suffix,external_ref="ref"}
            local first,err=c.as_owner("upsert",args)
            test.is_nil(err)
            local hidden,hidden_err=c.run_as(c.stranger,"upsert",args)
            test.is_nil(hidden)
            test.eq(hidden_err:kind(),errors.PERMISSION_DENIED)
            test.eq(#query("SELECT thread_id FROM kickside_thread_natural_key WHERE thread_id=$1",{first.thread_id}),1)
        end)
        test.it("retains incomplete identity and resumes initialization on replay",function()
            local c=fixture.new()
            local args={thread_class="test.empty.invalid.projection",external_ref=c.suffix,
                impl_id="app:threads_empty_invalid_projection_kind"}
            local result,err=c.as_owner("upsert",args)
            test.is_nil(result)
            test.not_nil(err)
            local id=legacy_id(args.thread_class,args.external_ref)
            test.eq(#query("SELECT id FROM kickside_thread WHERE id=$1",{id}),1)
            test.not_nil(c.component_row_exists(id))
            local mapped=query("SELECT ready FROM kickside_thread_natural_key WHERE thread_id=$1",{id})
            test.is_true(mapped[1].ready==false or mapped[1].ready==0)
            local retry,retry_err=c.as_owner("upsert",{thread_class=args.thread_class,external_ref=args.external_ref})
            test.is_nil(retry)
            test.not_nil(retry_err)
            test.eq(#query("SELECT id FROM kickside_thread WHERE id=$1",{id}),1)
        end)
        test.it("explicit identity takes precedence over a complete natural tuple",function()
            local c=fixture.new()
            local id=uuid.v4()
            local result,err=c.as_owner("upsert",{thread_id=id,thread_class="explicit",external_ref="ref"})
            test.is_nil(err)
            test.eq(result.thread_id,id)
            test.eq(#query("SELECT thread_id FROM kickside_thread_natural_key WHERE thread_id=$1",{id}),0)
        end)
        test.it("preserves opaque reference bytes through allocation and legacy binding",function()
            local db,db_err=sql.get("app:db")
            test.is_nil(db_err)
            local dialect,dialect_err=db:type()
            db:release()
            test.is_nil(dialect_err)
            for _,ref in ipairs({"control\0ref:é", "line\nref", " \t "}) do
                local c=fixture.new()
                local class="bytes:"..c.suffix
                local old,old_err=old_upsert(c,{thread_class=class,external_ref=ref})
                if dialect==sql.type.POSTGRES and ref:find("\0",1,true) then
                    test.is_nil(old)
                    test.not_nil(old_err)
                    test.is_true(tostring(old_err):find("22P05",1,true)~=nil)
                    local rejected,reject_err=c.as_owner("upsert",{thread_class=class,external_ref=ref})
                    test.is_nil(rejected)
                    test.not_nil(reject_err)
                    test.eq(reject_err:kind(),old_err:kind())
                    test.is_true(tostring(reject_err):find("22P05",1,true)~=nil)
                    local id=legacy_id(class,ref)
                    test.eq(#query("SELECT id FROM kickside_thread WHERE id=$1",{id}),0)
                    test.eq(#query("SELECT thread_id FROM kickside_thread_natural_key WHERE thread_id=$1",{id}),0)
                else
                    test.is_nil(old_err)
                    bind_existing(class,ref,old.thread_id)
                    local bound,bound_err=c.as_owner("upsert",{thread_class=class,external_ref=ref})
                    test.is_nil(bound_err)
                    test.eq(bound.thread_id,old.thread_id)
                    test.is_false(bound.created)
                    local fresh,fresh_err=c.as_owner("upsert",{thread_class=class..":new",external_ref=ref})
                    test.is_nil(fresh_err)
                    test.eq(fresh.thread_id,legacy_id(class..":new",ref))
                    local stored=query("SELECT key_ref FROM kickside_thread_natural_key WHERE thread_id=$1",{fresh.thread_id})
                    test.eq(stored[1].key_ref,ref)
                    local replay,replay_err=c.as_owner("upsert",{thread_class=class..":new",external_ref=ref})
                    test.is_nil(replay_err)
                    test.eq(replay.thread_id,fresh.thread_id)
                end
            end
        end)

        test.it("accepts long opaque refs without indexing tuple bytes",function()
            local c=fixture.new()
            local args={thread_class="long:"..c.suffix,external_ref=string.rep("é:opaque:",2000)}
            local first,err=c.as_owner("upsert",args)
            test.is_nil(err)
            local replay,replay_err=c.as_owner("upsert",args)
            test.is_nil(replay_err)
            test.eq(replay.thread_id,first.thread_id)
        end)
        test.it("refuses a full digest collision without adopting the mapped thread",function()
            local c=fixture.new()
            local class,ref="digest:"..c.suffix,"ref"
            local id=uuid.v4()
            local created,err=c.as_owner("create",{id=id,thread_class="unrelated"})
            test.is_nil(err)
            local digest=crypto.hmac.sha256("kickside.thread","kickside.thread.key/v2;"..tostring(#class)..":"..class..tostring(#ref)..":"..ref)
            local db,db_err=sql.get("app:db")
            test.is_nil(db_err)
            local kind,kind_err=db:type()
            test.is_nil(kind_err)
            local expression=kind==sql.type.POSTGRES and "decode('"..digest.."','hex')" or "X'"..digest.."'"
            local _,insert_err=db:execute("INSERT INTO kickside_thread_natural_key (key_digest,key_class,key_ref,thread_id,origin,ready) VALUES ("..expression..",$1,$2,$3,'v2',$4)",{"different","tuple",id,kind==sql.type.SQLITE and 1 or true})
            db:release()
            test.is_nil(insert_err)
            local result,resolve_err=c.as_owner("upsert",{thread_class=class,external_ref=ref})
            test.is_nil(result)
            test.eq(resolve_err:kind(),errors.CONFLICT)
            test.eq(resolve_err:details().reason,"natural_key_digest_collision")
        end)
        test.it("racing colliding tuples arbitrate distinct durable identities",function()
            local c=fixture.new()
            local keys={{thread_class="pair:"..c.suffix,external_ref="tail"},
                {thread_class="pair",external_ref=c.suffix..":tail"}}
            local start,done=channel.new(2),channel.new(2)
            for i,key in ipairs(keys) do
                coroutine.spawn(function()
                    start:receive()
                    local result,err=c.as_owner("upsert",key)
                    done:send({index=i,result=result,err=err})
                end)
            end
            start:send(true);start:send(true)
            local results={}
            for _=1,2 do
                local selected=channel.select({done:case_receive(),time.after("20s"):case_receive()})
                test.eq(selected.channel,done)
                test.is_nil(selected.value.err)
                results[selected.value.index]=selected.value.result
            end
            test.neq(results[1].thread_id,results[2].thread_id)
            for i,key in ipairs(keys) do
                local replay,err=c.as_owner("upsert",key)
                test.is_nil(err)
                test.eq(replay.thread_id,results[i].thread_id)
                test.is_false(replay.created)
            end
        end)
        test.it("refuses a truncated uuid collision without attaching an unrelated component",function()
            local c=fixture.new()
            local class,ref="truncated",c.suffix..":tail"
            local old,old_err=old_upsert(c,{thread_class=class..":"..c.suffix,external_ref="tail"})
            test.is_nil(old_err)
            bind_existing(class..":"..c.suffix,"tail",old.thread_id)
            local digest=crypto.hmac.sha256("kickside.thread","kickside.thread.key/v2;"..tostring(#class)..":"..class..tostring(#ref)..":"..ref)
            local id=string.format("%s-%s-8%s-%x%s-%s",digest:sub(1,8),digest:sub(9,12),digest:sub(14,16),
                (tonumber(digest:sub(17,17),16) :: number)%4+8,digest:sub(18,20),digest:sub(21,32))
            local unrelated,unrelated_err=c.as_owner("create",{id=id,thread_class="unrelated"})
            test.is_nil(unrelated_err)
            local result,err=c.as_owner("upsert",{thread_class=class,external_ref=ref})
            test.is_nil(result)
            test.eq(err:kind(),errors.CONFLICT)
            test.eq(err:details().reason,"natural_key_uuid_collision")
            test.eq(#query("SELECT thread_id FROM kickside_thread_natural_key WHERE thread_id=$1",{id}),0)
            test.eq(c.component_id_of(id),unrelated.thread_id)
        end)
        test.it("racing new upserts commit one identity",function()
            local c=fixture.new()
            race(c,{thread_class="race:"..c.suffix,external_ref="new"},false)
        end)
        test.it("racing v2 natural upserts commit one identity",function()
            local c=fixture.new()
            local first={thread_class="v2:"..c.suffix,external_ref="tail"}
            local old,old_err=old_upsert(c,first)
            test.is_nil(old_err)
            bind_existing(first.thread_class,first.external_ref,old.thread_id)
            local args={thread_class="v2",external_ref=c.suffix..":tail"}
            race(c,args,false,v8_id(args.thread_class,args.external_ref))
            test.neq(old.thread_id,v8_id(args.thread_class,args.external_ref))
        end)
        test.it("old and new upserts overlap on the legacy primary key",function()
            for _=1,4 do
                local c=fixture.new()
                local args={thread_class="overlap:"..c.suffix,external_ref="old:new"}
                local old,old_err=old_upsert(c,args)
                test.is_nil(old_err)
                bind_existing(args.thread_class,args.external_ref,old.thread_id)
                race(c,args,true,nil,0)
            end
        end)
    end)
end

return { run = test.run_cases(define_tests), loaded = function(row) return reader.get_loaded(row) end }
