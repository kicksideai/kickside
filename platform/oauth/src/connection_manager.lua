local contract = require("contract")
local uuid = require("uuid")
local security = require("security")
local oauth_repo = require("oauth_repo")
local oauth_read_repo = require("oauth_read_repo")
local oauth_token_repo = require("oauth_token_repo")
local refresh_schedule = require("refresh_schedule")
local component = require("component")
local logger = require("logger"):named("kickside.oauth.connection_manager")

local M = {}

local PROVIDER_DISCOVERY_CONTRACT = "kickside.oauth.discovery:provider_discovery"
local NEEDS_REAUTH_STATE = "needs_reauth"

local function current_runtime_identity()
    local actor = security.actor()
    local scope = security.scope()
    if not actor or not scope then
        return nil, nil, "security actor and scope are required"
    end
    return actor, scope, nil
end

local function connection_data_from(oauth_connection: any, provider_name: string, connection_name: string, connection_description: string?, user_context: any): { [string]: any }
    return {
        provider = provider_name,
        connection_name = connection_name,
        connection_description = connection_description or "",
        scopes_granted = oauth_connection.scopes_granted,
        connection_state = oauth_connection.connection_state,
        token_type = oauth_connection.token_type,
        expires_at = oauth_connection.expires_at,
        refresh_expires_at = oauth_connection.refresh_expires_at,
        tokens = {
            access_token = oauth_connection.access_token,
            refresh_token = oauth_connection.refresh_token,
            id_token = oauth_connection.id_token,
            scope = oauth_connection.scope
        },
        client_credentials = oauth_connection.client_credentials or {},
        user_profile = user_context,
        provider_specific = oauth_connection.provider_specific or {},
        oauth_flow = oauth_connection.oauth_flow or {}
    }
end

function M.public_meta(provider_name: string, connection_name: string, connection_description: string?, oauth_connection: any): { [string]: any }
    local state = oauth_connection.connection_state or "connected"
    local meta: any = {
        class = "connection",
        oauth_connection = true,
        provider = provider_name,
        title = connection_name,
        type = "OAuth Connection",
        comment = connection_description or ("OAuth connection to " .. provider_name),
        connection_state = state,
        reauth_reason = "",
        scopes_granted = oauth_connection.scopes_granted or "",
    }
    if oauth_connection.expires_at then
        meta.expires_at = tostring(oauth_connection.expires_at)
    end
    if oauth_connection.refresh_expires_at then
        meta.refresh_expires_at = tostring(oauth_connection.refresh_expires_at)
    end
    return meta
end

function M.set_public_meta(component_id: string, fields: { [string]: any }?): string?
    local has_fields = false
    for _ in pairs(fields or {}) do
        has_fields = true
        break
    end
    if not has_fields then return nil end

    local ok, update_err = component.set_meta(component_id, fields :: { [string]: any })
    if update_err then return tostring(update_err) end
    if not ok then return "component metadata update failed" end
    return nil
end


function M.register_authorized_connection(args: any): (string?, string?)
    args = type(args) == "table" and args or {}
    local component_id: string? = nil
    if type(args.component_id) == "string" and args.component_id ~= "" then
        component_id = args.component_id
    end
    local oauth_connection = args and args.oauth_connection
    local provider_name = tostring(args.provider_name or "")
    local connection_name = tostring(args.connection_name or "")
    local connection_description: string? = nil
    if type(args.connection_description) == "string" then
        connection_description = args.connection_description
    end
    local user_context = args.user_context

    local actor, scope, security_err = current_runtime_identity()
    if security_err then return nil, security_err end

    local oauth_connection_data = connection_data_from(
        oauth_connection,
        provider_name,
        connection_name,
        connection_description,
        user_context
    )

    if component_id then
        local _, oauth_err = oauth_repo.update_connection(component_id, oauth_connection_data)
        if oauth_err then
            return nil, "Failed to store OAuth connection: " .. oauth_err
        end

        local meta_err = M.set_public_meta(
            component_id,
            M.public_meta(provider_name, connection_name, connection_description, oauth_connection)
        )
        if meta_err then
            return nil, "Failed to update component metadata: " .. tostring(meta_err)
        end

        local _, schedule_err = refresh_schedule.notify()
        if not schedule_err then _, schedule_err = refresh_schedule.arm(component_id) end
        if schedule_err then return nil, schedule_err end
        return component_id
    end

    local new_component_id = uuid.v4()
    local discovery_service, derr = contract.get(PROVIDER_DISCOVERY_CONTRACT)
    if derr then
        return nil, "Failed to get discovery service: " .. derr
    end

    local discovery_instance, oerr = discovery_service:with_actor(actor):with_scope(scope):open()
    if oerr then
        return nil, "Failed to open discovery service: " .. oerr
    end

    local component_contract_info, cerr = discovery_instance:get_component_contract({
        oauth_provider = provider_name
    })
    if cerr or not component_contract_info or component_contract_info.success == false then
        return nil, "Failed to get component contract: " ..
            (cerr or (component_contract_info and component_contract_info.error) or provider_name)
    end

    local _, oauth_err = oauth_repo.create_connection(new_component_id, oauth_connection_data)
    if oauth_err then
        return nil, "Failed to store OAuth connection: " .. oauth_err
    end

    local service, serr = component.get_service()
    if serr or not service then
        oauth_repo.delete_connection(new_component_id)
        return nil, "Failed to open component service: " .. tostring(serr)
    end

    local meta = M.public_meta(provider_name, connection_name, connection_description, oauth_connection)
    meta.display_id = component_contract_info.provider_id

    local result, rerr = service:register({
        component_id = new_component_id,
        impl_id = component_contract_info.component_contract_id,
        meta = meta,
        private_context = { component_id = new_component_id }
    })
    if rerr then
        oauth_repo.delete_connection(new_component_id)
        return nil, "Failed to register component: " .. rerr
    end
    if not result or not result.success then
        oauth_repo.delete_connection(new_component_id)
        return nil, "Failed to register component: " .. ((result and result.error) or "Component registration failed")
    end

    local _, schedule_err = refresh_schedule.notify()
    if not schedule_err then _, schedule_err = refresh_schedule.arm(new_component_id) end
    if schedule_err then return nil, schedule_err end

    return new_component_id
end

function M.mark_needs_reauth(component_id: string, reason: any, expected_generation: integer?): (string?, boolean?)
    local marked, mark_err = oauth_repo.update_connection(component_id, {
        connection_state = NEEDS_REAUTH_STATE
    }, expected_generation)
    if mark_err then
        logger:error("Failed to mark connection as needs_reauth", {
            component_id = component_id,
            error = mark_err
        })
        return "Failed to mark OAuth connection as needs_reauth: " .. tostring(mark_err)
    end

    if marked and marked.stale then return nil, true end
    local _, wake_err = refresh_schedule.notify()
    if wake_err then return tostring(wake_err) end
    local meta_err = M.set_public_meta(component_id, {
        connection_state = NEEDS_REAUTH_STATE,
        reauth_reason = tostring(reason),
    })
    if meta_err then
        logger:error("Failed to update needs_reauth public state", {
            component_id = component_id,
            error = meta_err
        })
        return "Failed to update OAuth public component metadata: " .. tostring(meta_err)
    end

    logger:warn("Connection marked as needs_reauth", {
        component_id = component_id,
        reason = reason
    })
    return nil
end

function M.apply_refreshed_tokens(args: any): (any?, string?)
    local component_id = tostring(args.component_id or "")
    local provider_name = tostring(args.provider_name or "")
    local connection_name = tostring(args.connection_name or "")
    local update_result, err = oauth_token_repo.update_tokens(component_id, args.tokens, args.expires_at, args.expected_generation)
    if err then
        return nil, "Failed to update tokens: " .. err
    end

    if update_result and update_result.stale then return update_result, nil end
    local _, wake_err = refresh_schedule.notify()
    if wake_err then return nil, tostring(wake_err) end
    local _, arm_err = refresh_schedule.arm(component_id)
    if arm_err then return nil, tostring(arm_err) end

    local meta_err = M.set_public_meta(component_id, {
        connection_state = "connected",
        reauth_reason = "",
        expires_at = args.expires_at or "",
        last_token_refresh = update_result and update_result.updated_at or "",
        scopes_granted = args.scopes_granted or "",
    })
    if meta_err then
        return nil, "Token refresh stored but Failed to update OAuth public component metadata: " .. tostring(meta_err)
    end

    return update_result, nil
end

return M
