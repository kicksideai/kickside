local natural_key = require("natural_key")
local common = require("contract_common")
local crud = require("threads_thread_crud")
local reader = require("threads_reader")
local component = require("threads_component")
local sql_boundary = require("sql_boundary")
local committed_error = require("committed_error")

local M = {}

local function finish(id: string, ready: any, created: boolean, loaded: table?): (any?, error?)
    local thread, read_err
    if loaded then
        thread, read_err = reader.get_loaded(loaded)
    else
        local db, db_err = common.open_db()
        if db_err then return nil, db_err end
        thread, read_err = reader.get(db,id)
        read_err = sql_boundary.release(db, read_err, "release natural thread read connection")
    end
    if read_err or not thread then return nil, read_err end
    if ready ~= true and ready ~= 1 then
        local identity, identity_err = common.declared_identity(id)
        if identity_err or not identity then return nil, identity_err end
        local impl_id, impl_err = component.impl_id(id)
        if impl_err then return nil, impl_err end
        local work, work_err = common.open_db()
        if work_err then return nil, work_err end
        local completed, complete_err = crud.finish(work,id,{impl_id=impl_id},common.actor_id(),identity,common.is_maintenance_actor())
        if not complete_err then complete_err = natural_key.mark_ready(work,id) end
        complete_err = sql_boundary.release(work, complete_err, "release natural thread completion connection")
        if complete_err then return nil, complete_err end
        if created then thread = completed.thread end
    end
    if created then
        local emit_err = common.emit_update(id,"kickside.threads:thread.created",{thread=thread})
        if emit_err then return nil, emit_err end
    end
    return {thread=thread,thread_id=id,created=created,
        rollback=created and {method="delete",args={thread_id=id}} or nil}, nil
end

local function resolve(key: table): (table?, error?)
    local db, db_err = common.open_db()
    if db_err then return nil, db_err end
    local resolution, resolve_err = natural_key.resolve(db,key)
    local diagnostic: {cleanup_error: error?} = {}
    local resolution_err = sql_boundary.release(db, resolve_err, "release natural key resolution connection", diagnostic)
    if diagnostic.cleanup_error then return nil, resolution_err end
    if resolution_err or not resolution then return nil, resolution_err end
    return resolution, nil
end

local function register(args: table, key: table, principal: any, resolution: table): (string?, error?)
    args.id = resolution.allocate_id
    return crud.register_thread_component(args,common.actor_id(),principal,key,resolution.origin)
end

local function attempt(args: table, key: table): (any?, error?)
    local resolution, resolve_err = resolve(key)
    if resolve_err or not resolution then return nil, resolve_err end
    if resolution.thread_id then
        local result, err = finish(tostring(resolution.thread_id),resolution.ready,false,resolution)
        return result, err
    end
    local principal, principal_err = common.actor_principal()
    if principal_err then return nil, principal_err end
    local id, register_err = register(args,key,principal,resolution)
    if id then
        local result, err = finish(id,false,true)
        return result, err and committed_error.new(err) or nil
    end
    if natural_key.transient(register_err) then return nil, register_err end
    if not register_err or register_err:kind() ~= errors.CONFLICT then return nil, register_err end

    -- The natural-key binding commits with the winning component registration.
    -- A registration loser can therefore resolve that binding directly once the
    -- database has released its unique constraint wait.
    local winner, winner_err = resolve(key)
    if winner_err or not winner then return nil, winner_err end
    if winner.thread_id then
        return finish(tostring(winner.thread_id),winner.ready,false,winner)
    end
    if winner.allocate_id == resolution.allocate_id then
        if winner.origin == "v2" then return nil, natural_key.conflict("natural_key_uuid_collision") end
        return nil, register_err
    end

    -- A distinct tuple can share the legacy id. Resolving after that registration
    -- commits selects its v8 identity; register that newly allocated identity.
    local allocated_id, allocated_err = register(args,key,principal,winner)
    if allocated_id then
        local result, err = finish(allocated_id,false,true)
        return result, err and committed_error.new(err) or nil
    end
    if natural_key.transient(allocated_err) then return nil, allocated_err end
    if not allocated_err or allocated_err:kind() ~= errors.CONFLICT then return nil, allocated_err end

    local committed, committed_err = resolve(key)
    if committed_err or not committed then return nil, committed_err end
    if committed.thread_id then
        return finish(tostring(committed.thread_id),committed.ready,false,committed)
    end
    if committed.allocate_id == winner.allocate_id and committed.origin == "v2" then
        return nil, natural_key.conflict("natural_key_uuid_collision")
    end
    return nil, allocated_err
end

function M.upsert(args: table): (any?, error?)
    local key = natural_key.key(args.thread_class,args.external_ref)
    local create_args: table = {}
    for k,v in pairs(args) do create_args[k]=v end
    create_args.external_ref = nil
    local attrs: table = {}
    for k,v in pairs(type(args.attrs)=="table" and args.attrs or {}) do attrs[k]=v end
    attrs.external_ref=args.external_ref
    create_args.attrs=attrs
    return attempt(create_args,key)
end

return M
