-- Explicit roster of every module-qualified call into the component trusted-read tier.
--
-- component.lua exports six reads that skip the actor access gate (the trusted tier,
-- distinct from the access-checked public tier): list_system, open_private,
-- list_for_subject, get_private_context, system_delete, resolve_path_prefixes.
-- The two tiers stay separate on purpose; the risk is a new caller silently reaching
-- for a trusted read. Every such call site is listed here with an exact count so the
-- guard suite fails on an unlisted caller or an undeclared extra call.
--
-- Keyed by repo-relative caller PATH (the scan reads files, so the path is the faithful
-- proxy for the registry entry; the resolved entry id is recorded on `entry`). A single
-- file is one key even when several registry entries bind it (responder.lua binds one
-- runtime plus five method entries in kickside.channel.responder).

local M = {}

type CallSite = {
    count: number, -- exact number of module-qualified calls in the file
    why: string, -- one-line justification for the trusted read
    entry: string, -- resolved registry entry id (traceability; not the scan key)
}

type CallerAllow = { [string]: CallSite } -- method -> site
type Allowlist = { [string]: CallerAllow } -- caller path -> methods

-- The trusted-read methods, in export order. The scanner counts a call as
-- `<qualifier>.<method>(` for each of these.
M.METHODS = {
    "list_system",
    "open_private",
    "list_for_subject",
    "get_private_context",
    "system_delete",
    "resolve_path_prefixes",
    "component_owner",
    "component_owner_record",
} :: { string }

-- The self file whose method DEFINITIONS live here; excluded from the scan so the
-- tier's own source never counts as a caller.
M.SELF_PATH = "core/component/src/component.lua"

M.ALLOW = {
    ["app/src/app/security/registry/delegation/delegation.lua"] = {
        list_system = {
            count = 1,
            why = "the private host delegation validator checks root existence without returning component metadata or private context",
            entry = "app.security:delegation_validator",
        },
    },
    ["platform/automation/src/declaration_writer.lua"] = {
        get_private_context = {
            count = 1,
            why = "the pending declaration verifier compares protected values with the live baseline after checking operator WRITE and both principals' resource grants; it never returns private context",
            entry = "kickside.automation:declaration_writer_verify",
        },
    },
    ["platform/automation/src/identity_writer.lua"] = {
        list_system = {
            count = 1,
            why = "the trusted identity command executor resolves the installed declaration kind; Component SET verifies its pending owner command and live ADMIN",
            entry = "kickside.automation:identity_writer",
        },
        get_private_context = {
            count = 1,
            why = "the identity command executor validates every stored declaration reference under the selected principal without returning private context",
            entry = "kickside.automation:identity_writer",
        },
    },
    ["core/component/src/persist/pending_delete.lua"] = {
        system_delete = {
            count = 1,
            why = "the existing retention slot resumes an already authorized and fenced component delete",
            entry = "kickside.component.persist:pending_delete",
        },
    },
    ["core/core/src/threads/component_identity.lua"] = {
        get_private_context = {
            count = 1,
            why = "owner loader for a component's stored execution identity: declared thread projections and converge run under it",
            entry = "kickside.core.threads:component_identity",
        },
    },
    ["platform/channel/src/receive.lua"] = {
        list_system = {
            count = 2,
            why = "channel routing resolves the target channel component and the agent-by-id it dispatches to",
            entry = "kickside.channel:receive_func",
        },
    },
    ["platform/channel/src/service/execution_ref.lua"] = {
        list_system = {
            count = 1,
            why = "trusted channel hub verifies the responder component owns the inbound connection and channel before loading its identity",
            entry = "kickside.channel.service:execution_ref",
        },
    },
    ["platform/channel/src/responder/responder.lua"] = {
        list_system = {
            count = 2,
            why = "install-time responder resolves the connection provider component and its status/capability rows",
            entry = "kickside.channel.responder:runtime",
        },
    },
    ["platform/mcp/src/persist/repo.lua"] = {
        resolve_path_prefixes = {
            count = 1,
            why = "MCP endpoint scope narrows to the whitelisted component subtree prefixes",
            entry = "kickside.mcp.persist:repo",
        },
    },
    ["platform/identity/src/link_service.lua"] = {
        list_for_subject = {
            count = 1,
            why = "identity link lists the linking user's user-agent components",
            entry = "kickside.identity:link_service",
        },
    },
    ["platform/oauth/src/binding/get_connection_status_func.lua"] = {
        list_system = {
            count = 1,
            why = "OAuth status reads the connection component backing a provider link",
            entry = "kickside.oauth.binding:get_connection_status_func",
        },
    },
    ["platform/agents/src/traits/redirect_action.lua"] = {
        list_for_subject = {
            count = 2,
            why = "redirect trait lists the user's public agent roster and separately authorizes an exact configured private redirect target",
            entry = "kickside.agents.traits:redirect_action",
        },
    },
    ["platform/agents/src/traits/roster_list.lua"] = {
        list_for_subject = {
            count = 2,
            why = "roster trait lists the user's agent components (with meta and again id-only)",
            entry = "kickside.agents.traits:roster_list",
        },
    },
    ["platform/agents/src/binding/user_agents_func.lua"] = {
        list_for_subject = {
            count = 1,
            why = "user-agent listing enumerates a user's agent components",
            entry = "kickside.agents.binding:user_agents_func",
        },
    },
    ["platform/agents/src/binding/agent_status_func.lua"] = {
        list_system = {
            count = 1,
            why = "agent status reads the agent component regardless of the requesting actor",
            entry = "kickside.agents.binding:agent_status_func",
        },
    },
    ["platform/connection/src/reply_sender.lua"] = {
        list_system = {
            count = 1,
            why = "reply sender resolves the connection component that owns the reply endpoint",
            entry = "kickside.connection:reply_sender",
        },
        open_private = {
            count = 1,
            why = "reply sender opens the connection's private reply-provider contract for send, status and update, only after authorizing the operation (reply proof or connection WRITE, A30)",
            entry = "kickside.connection:reply_sender",
        },
    },
    ["platform/oauth/src/refresh_worker.lua"] = {
        get_private_context = {
            count = 1,
            why = "OAuth refresh job loads the connection's stored execution identity to refresh under it",
            entry = "kickside.oauth:refresh_connection",
        },
    },
    ["platform/automation/src/engine/state.lua"] = {
        list_system = {
            count = 3,
            why = "automation state reads list installed and runtime automations across owners, plus get_runtime's impl type/meta lookup for the trigger-subscription reverse lookup",
            entry = "kickside.automation.engine:state",
        },
        get_private_context = {
            count = 2,
            why = "automation runtime reads resolve each automation's execution identity and state",
            entry = "kickside.automation.engine:state",
        },
    },
    ["platform/automation/src/engine/actions.lua"] = {
        list_system = {
            count = 1,
            why = "resource-ownership lookup resolves the umbrella automation declaring ownership of a resource across owners",
            entry = "kickside.automation.engine:actions",
        },
        get_private_context = {
            count = 1,
            why = "uninstall reads the rollback chain after its DELETE access gate",
            entry = "kickside.automation.engine:actions",
        },
    },
    ["platform/automation/src/engine/state_write.lua"] = {
        get_private_context = {
            count = 1,
            why = "a reconfigure command reads the stored declaration and execution subject (ADMIN-redacted) after the caller's WRITE access gate",
            entry = "kickside.automation.engine:state_write",
        },
    },
    ["core/core/src/threads/contract/events.lua"] = {
        list_system = {
            count = 1,
            why = "a threads.audit.publish scoped append checks whether the canonical lifecycle thread already exists before attaching it",
            entry = "kickside.core.threads:append_event_method",
        },
        component_owner_record = {
            count = 1,
            why = "a threads.audit.publish scoped append reads the component owner to derive its typed thread audience",
            entry = "kickside.core.threads:append_event_method",
        },
    },
    ["core/core/src/threads/contract/event_authorization.lua"] = {
        list_system = {
            count = 2,
            why = "append and primary-emit authorization use the stored kind after canonical component WRITE; first-touch reads existence before registration",
            entry = "kickside.core.threads:append_event_method",
        },
        component_owner_record = {
            count = 1,
            why = "an authorized primary emit preserves the stored component owner and audience when a WRITE grantee attaches its thread",
            entry = "kickside.core.threads:append_event_method",
        },
    },
    ["platform/uploads/src/binding/delete_uploads_func.lua"] = {
        component_owner = {
            count = 1,
            why = "the component deletable contract drains uploads owned by the deleted component's stored actor",
            entry = "kickside.uploads:delete_uploads_func",
        },
    },
    ["core/component/src/binding/list_access_func.lua"] = {
        component_owner = {
            count = 1,
            why = "the share UI reads the owner only after its component ADMIN gate",
            entry = "kickside.component.binding:list_access_func",
        },
    },
    ["core/core/src/lifecycle/reaper.lua"] = {
        list_system = {
            count = 2,
            why = "the lifecycle reaper is the trusted teardown engine and enumerates owned components to delete",
            entry = "kickside.core.lifecycle:reaper",
        },
        system_delete = {
            count = 1,
            why = "the lifecycle reaper performs the trusted cascade delete of each reaped component",
            entry = "kickside.core.lifecycle:reaper",
        },
    },
} :: Allowlist

return M
