-- HTTP surface of the MCP OAuth authorization server. Thin adapters over
-- mcp_oauth_flow: the well-known documents and register/token sit on public
-- routers (no session), authorize serves the self-contained consent page, and
-- consent runs on the authenticated API router under the approving actor.

local http = require("http")
local env = require("env")
local security = require("security")
local json = require("json")
local flow = require("mcp_oauth_flow")
local public_url = require("public_url")
local http_headers = require("mcp_http_headers")
local credential_policy = require("credential_policy")
local limits = require("mcp_consts").OAUTH_LIMITS

local M = {}

-- The configured public URL wins; without one, fall back to the request Host so
-- discovery documents always carry absolute URLs (clients reject relative
-- issuers). Proxy deployments must configure PUBLIC_API_URL.
local function write_json(res: any, status: number, payload: any)
    res:set_status(status)
    res:set_content_type("application/json")
    res:write_json(payload)
end

-- application/x-www-form-urlencoded body -> table (the token endpoint's wire
-- format per RFC 6749; register uses JSON).
local function url_decode(s: string): string
    s = s:gsub("+", " ")
    return (s:gsub("%%(%x%x)", function(cc) return string.char(tonumber(cc, 16) :: integer) end))
end

local function parse_form(body: string): any
    local out: { [string]: string } = {}
    for pair in tostring(body):gmatch("[^&]+") do
        local k, v = pair:match("^([^=]+)=(.*)$")
        if k then out[url_decode(k)] = url_decode(v or "") end
    end
    return out
end

function M.well_known_resource()
    local res = http.response()
    if not res then return end
    write_json(res, 200, flow.protected_resource_metadata(public_url.base_url()))
end

function M.well_known_auth_server()
    local res = http.response()
    if not res then return end
    write_json(res, 200, flow.authorization_server_metadata(public_url.base_url()))
end

function M.register()
    local req = http.request({ max_body = limits.REGISTRATION_BODY_BYTES })
    local res = http.response()
    if not req or not res then return end
    http_headers.no_store(res)
    local raw, raw_err = req:body()
    if raw_err or type(raw) ~= "string" then
        write_json(res, 400, { error = "invalid_client_metadata", error_description = "invalid request body" })
        return
    end
    local body, body_err = flow.decode_registration(raw)
    if body_err or type(body) ~= "table" then
        write_json(res, 400, { error = "invalid_client_metadata", error_description = "invalid request body" })
        return
    end
    local client, err = flow.register(body)
    if not client then
        local kind = type(err) == "userdata" and err:kind() or nil
        local limited = kind == errors.RATE_LIMITED
        local infrastructure = kind == errors.INTERNAL or kind == errors.UNAVAILABLE or kind == errors.TIMEOUT
        if limited then res:set_header("Retry-After", "60") end
        write_json(res, limited and 429 or (infrastructure and 503 or 400), {
            error = (limited or infrastructure) and "temporarily_unavailable" or "invalid_client_metadata",
            error_description = tostring(err),
        })
        return
    end
    write_json(res, 201, client)
end

function M.token()
    local req = http.request({ max_body = limits.TOKEN_BODY_BYTES })
    local res = http.response()
    if not req or not res then return end
    http_headers.no_store(res)
    local raw, body_err = req:body()
    if body_err or type(raw) ~= "string" or #raw > limits.TOKEN_BODY_BYTES then
        write_json(res, 400, { error = "invalid_grant", error_description = "invalid request body" })
        return
    end
    local params = parse_form(raw)
    local out, err = flow.exchange(params)
    if not out then
        write_json(res, 400, { error = "invalid_grant", error_description = tostring(err) })
        return
    end
    write_json(res, 200, out)
end

-- GET /mcp/oauth/authorize — the browser entry of the code flow. Serves the
-- self-contained consent page; the page authenticates with the SPA session
-- token from localStorage (same origin) and drives context + consent over the
-- authenticated API. Unauthenticated visitors are bounced to login and back.
local CONSENT_PAGE = [[<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Connect to KickSide</title>
<style>
:root{color-scheme:light dark;font-family:system-ui,sans-serif}
body{display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;background:Canvas;color:CanvasText}
.card{max-width:26rem;width:100%;padding:2rem;border:1px solid color-mix(in srgb,CanvasText 15%,transparent);border-radius:12px}
h1{font-size:1.1rem;margin:0 0 .5rem}
p{margin:.4rem 0;font-size:.9rem;opacity:.85}
select{width:100%;padding:.5rem;margin:.75rem 0;border-radius:8px}
.row{display:flex;gap:.75rem;margin-top:1.25rem}
button{flex:1;padding:.6rem;border-radius:8px;border:1px solid color-mix(in srgb,CanvasText 25%,transparent);cursor:pointer;font-size:.95rem}
#approve{background:color-mix(in srgb,CanvasText 90%,Canvas);color:Canvas}
#err{color:#c0392b;font-size:.85rem;min-height:1.2em}
</style></head><body><div class="card">
<h1 id="title">Connect to KickSide MCP</h1>
<p id="who">Checking request…</p>
<p id="destination"></p>
<label for="preset" style="font-size:.85rem">Tool preset</label>
<select id="preset"><option value="">All tools I can use</option></select>
<p id="err"></p>
<div class="row"><button id="deny" disabled>Deny</button><button id="approve" disabled>Allow</button></div>
</div><script>
const qs=new URLSearchParams(location.search);
const info=JSON.parse(localStorage.getItem("@wippy_token_info")||"null");
if(!info||!info.token){location.href="/login?next="+encodeURIComponent(location.pathname+location.search);}
const H={Authorization:"Bearer "+(info&&info.token),"Content-Type":"application/json"};
const params={response_type:qs.get("response_type")||"code",client_id:qs.get("client_id"),redirect_uri:qs.get("redirect_uri"),
code_challenge:qs.get("code_challenge"),code_challenge_method:qs.get("code_challenge_method"),state:qs.get("state"),resource:qs.get("resource")};
const err=m=>{document.getElementById("err").textContent=m;};
const load=async path=>{
  const r=await fetch(path,{headers:H});const data=await r.json();
  if(!r.ok||data.success!==true)throw new Error(data.error||"Unable to load consent");
  return data;
};
Promise.all([load("/api/v1/mcp/oauth/context?"+qs.toString()),load("/api/v1/mcp/presets")]).then(([c,p])=>{
  document.getElementById("who").textContent=(c.client_name||"An application")+" wants to use your KickSide tools over MCP.";
  document.getElementById("destination").textContent="Redirect destination: "+(new URL(c.redirect_uri).hostname||c.redirect_uri);
  for(const it of p.presets){const o=document.createElement("option");o.value=it.id;o.textContent=it.title||it.name||it.id;document.getElementById("preset").appendChild(o);}
  document.getElementById("approve").disabled=false;
  document.getElementById("deny").disabled=false;
}).catch(e=>err(e.message));
document.getElementById("deny").onclick=()=>{
  const u=new URL(params.redirect_uri);u.searchParams.set("error","access_denied");
  if(params.state)u.searchParams.set("state",params.state);location.href=u.toString();};
document.getElementById("approve").onclick=async()=>{
  document.getElementById("approve").disabled=true;
  const mint={};const preset=document.getElementById("preset").value;if(preset)mint.policy={preset:preset};
  const r=await fetch("/api/v1/mcp/oauth/consent",{method:"POST",headers:H,body:JSON.stringify({params:params,mint:mint})});
  const j=await r.json();
  if(j.success&&j.redirect_to){location.href=j.redirect_to;}else{err(j.error||"consent failed");document.getElementById("approve").disabled=false;}
};
</script></body></html>]]

local function authorize_params(req: any): any
    return {
        response_type = req:query("response_type"),
        client_id = req:query("client_id"),
        redirect_uri = req:query("redirect_uri"),
        code_challenge = req:query("code_challenge"),
        code_challenge_method = req:query("code_challenge_method"),
        resource = req:query("resource"),
    }
end

function M.authorize()
    local req = http.request()
    local res = http.response()
    if not req or not res then return end
    http_headers.no_store(res)
    res:set_header("Content-Security-Policy", "frame-ancestors 'none'")
    res:set_header("X-Frame-Options", "DENY")
    local client, err = flow.validate_authorize_request(authorize_params(req))
    if not client then
        write_json(res, 400, { error = "invalid_request", error_description = tostring(err) })
        return
    end
    res:set_status(200)
    res:set_content_type("text/html; charset=utf-8")
    res:write(CONSENT_PAGE)
end

-- GET /mcp/oauth/context — authenticated helper for the consent page: validates
-- the authorize query and names the requesting client.
function M.context()
    local req = http.request()
    local res = http.response()
    if not req or not res then return end
    http_headers.no_store(res)
    local actor = security.actor()
    if not actor then
        write_json(res, 401, { success = false, error = "authentication required" })
        return
    end
    local params = authorize_params(req)
    local client, err = flow.validate_authorize_request(params)
    if not client then
        write_json(res, 400, { success = false, error = tostring(err) })
        return
    end
    write_json(res, 200, {
        success = true,
        client_name = client.client_name ~= "" and client.client_name or client.client_id,
        redirect_uri = params.redirect_uri,
        mcp_url = public_url.mcp_url(),
    })
end

-- POST /mcp/oauth/consent — the approving click. Mints the credential under the
-- ambient actor and returns the redirect the browser must follow.
function M.consent()
    local req = http.request()
    local res = http.response()
    if not req or not res then return end
    http_headers.no_store(res)
    local actor = security.actor()
    if not actor then
        write_json(res, 401, { success = false, error = "authentication required" })
        return
    end
    local raw, raw_err = req:body()
    if raw_err or type(raw) ~= "string" then
        write_json(res, 400, { success = false, error = "invalid request body" })
        return
    end
    local body, body_err = credential_policy.decode_request(raw, "consent")
    if body_err or type(body) ~= "table" then
        write_json(res, 400, { success = false, error = tostring(body_err) })
        return
    end
    local params = type(body.params) == "table" and body.params or {}
    params.response_type = params.response_type or "code"
    local granted, err = flow.grant(tostring(actor:id()), params, body.mint or {})
    if not granted then
        write_json(res, type(err) == "userdata" and err:kind() == errors.UNAVAILABLE and 500 or 400,
            { success = false, error = tostring(err) })
        return
    end
    write_json(res, 200, { success = true, redirect_to = granted.redirect_to })
end

return M
