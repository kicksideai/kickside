-- SSRF guard + prompt-content bounds for server-side URL fetches. The uploads and
-- knowledge fetch_url tools fetch model/user-supplied URLs server-side and feed
-- fetched bodies into uploads/LLM prompts, so both must reject internal targets and
-- bound content. One copy here, in the uploads layer both callers depend on, rather
-- than a guard per call site.

local net_safety = {}

-- Upper bound on fetched content concatenated into an LLM prompt. Content past this
-- is truncated (the call still runs) so a single large page cannot blow the model's
-- context window or run up token cost.
net_safety.MAX_PROMPT_CONTENT_CHARS = 100000

-- Reject anything that isn't a plain http(s) request to a public host — loopback,
-- private/link-local ranges (incl. the 169.254.169.254 cloud metadata IP),
-- bare/internal hostnames, IPv6 literals, and embedded credentials. Host-based
-- (not DNS-rebinding-proof) but blocks the common SSRF vectors.
function net_safety.is_safe_public_url(url: any): (boolean, string?)
    if type(url) ~= "string" then return false, "url must be a string" end
    local scheme, host = url:match("^(%a[%w+.-]*)://([^/:?#%[]*)")
    if not scheme then return false, "url must be http or https" end
    scheme = scheme:lower()
    if scheme ~= "http" and scheme ~= "https" then
        return false, "url must be http or https"
    end
    if not host or host == "" then return false, "url host is missing" end
    if url:find("://[^/]*@") or url:find("://%[") then
        return false, "url host not allowed"
    end
    host = host:lower()
    if host == "localhost" or host == "0.0.0.0" then
        return false, "url host not allowed"
    end
    local o1, o2 = host:match("^(%d+)%.(%d+)%.%d+%.%d+$")
    if o1 then
        local a, b = tonumber(o1) :: number, tonumber(o2) :: number
        if a == 127 or a == 10 or a == 0 or a >= 224
            or (a == 169 and b == 254)
            or (a == 192 and b == 168)
            or (a == 172 and b >= 16 and b <= 31) then
            return false, "url host not allowed"
        end
    elseif not host:find("%.") or host:find("%.internal$") or host:find("%.local$") then
        return false, "url host not allowed"
    end
    return true, nil
end

-- Truncate content to at most max_chars (defaults to MAX_PROMPT_CONTENT_CHARS).
-- Returns the (possibly shortened) string and whether truncation happened.
function net_safety.cap_content(content: any, max_chars: number?): (string, boolean)
    if type(content) ~= "string" then return "", false end
    local limit = (max_chars or net_safety.MAX_PROMPT_CONTENT_CHARS) :: integer
    if #content <= limit then return content, false end
    return content:sub(1, limit), true
end

return net_safety
