-- KickSide UI navigation runtime vocabulary and helpers.
--
-- A module or page declares a navigable surface as a registry.entry with
-- meta.type = NAV_ITEM_TYPE carrying { label, icon, path, route_name, category,
-- order }. The nav service discovers them and merges admin system controls
-- (stored as kickside.ui settings) on top, so admins can reshape the UI —
-- reorder, hide, recategorize, add custom categories and pages — without code.

local M = {}

function M.splash_access(required: any, can: (string) -> boolean): (boolean?, error?)
    if required == nil then return true, nil end
    if type(required) ~= "table" then
        return nil, errors.new({message = "splash required_access must be an array", kind = errors.INVALID})
    end
    local count = 0
    for key, resource in pairs(required) do
        count = count + 1
        if type(key) ~= "number" or key % 1 ~= 0 or key < 1 or key > #required
            or type(resource) ~= "string" or resource == "" then
            return nil, errors.new({message = "splash required_access must contain resource ids", kind = errors.INVALID})
        end
    end
    if count ~= #required then
        return nil, errors.new({message = "splash required_access must be a contiguous array", kind = errors.INVALID})
    end
    for _, resource in ipairs(required) do
        if not can(resource) then return false, nil end
    end
    return true, nil
end

-- Registry meta.type a surface declares to appear in navigation.
M.NAV_ITEM_TYPE = "ui.nav_item"
M.NAV_CATEGORY_TYPE = "ui.nav_category"
M.NAV_LIMITS = {
    -- The menu is a request-path fan-out. Keep its work bounded even when an
    -- installation has accumulated many optional modules.
    PROVIDERS = 24,
    ITEMS_PER_PROVIDER = 200,
    CATEGORIES_PER_PROVIDER = 50,
    PROVIDER_TIMEOUT_MS = 250,
}

-- Settings namespace the system controls live under (see _index.yaml
-- kickside.settings:definition entries). All admin overrides flow through the
-- kickside/settings contract, so they are cached and admin-editable.
M.SETTINGS_NS = "kickside.ui"

M.KEY = {
    LAYOUT = "layout",          -- string: vertical | horizontal
    OVERRIDES = "overrides",    -- json: { [route_name|id] = { hidden, order, category, label, icon } }
    CATEGORIES = "categories",  -- json: [ { key, label, icon, order, collapsed } ]
    CUSTOM_ITEMS = "custom_items", -- json: [ { id, label, icon, path, route_name, category, order } ]
    TITLE = "title",            -- string: site title (header + browser tab)
    LOGO_URL = "logo_url",      -- string: public URL of the uploaded logo (empty = default mark)
    HOME = "home",              -- string: path of the surface used as the landing page (empty = "/")
    PRIMARY_COLOR = "primary_color", -- string: base tone hex (#rrggbb), empty = built-in default
}

-- WCAG relative luminance of an sRGB triple (0-255 channels).
function M.tone_rel_luminance(r: number, g: number, b: number): number
    local function lin(c: number): number
        local s = c / 255
        if s <= 0.03928 then return s / 12.92 end
        return ((s + 0.055) / 1.055) ^ 2.4
    end
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
end

function M.tone_contrast(l1: number, l2: number): number
    local hi = math.max(l1, l2)
    local lo = math.min(l1, l2)
    return (hi + 0.05) / (lo + 0.05)
end

-- Legibility floor for a base tone. The generated ramp's -600 shade (the
-- --p-primary-color accent: base mixed 12% toward black) must keep enough contrast
-- against the light surface (#fff — white button text + light accent) and the dark
-- content surface (#0c0e12 — dark accent) or the UI becomes invisible. Mirrors the
-- client guard appearance_tone.ts evaluateTone (same 2.0 floor, ramp, and math), so a
-- syntactically-valid hex the editor would block is also rejected here. Empty / already-
-- invalid values are "legible" (they never reach the ramp). This is the server half of
-- the guard: the editor disables Save; this defends a direct PUT /nav/config too.
local TONE_MIN_CONTRAST = 2.0
function M.is_legible_primary_color(value: string): boolean
    local v = value:gsub("%s", ""):gsub("^#", "")
    if #v == 3 then v = v:sub(1, 1):rep(2) .. v:sub(2, 2):rep(2) .. v:sub(3, 3):rep(2) end
    if #v ~= 6 then return true end
    local r = tonumber(v:sub(1, 2), 16)
    local g = tonumber(v:sub(3, 4), 16)
    local b = tonumber(v:sub(5, 6), 16)
    if not r or not g or not b then return true end
    -- accent = ramp -600 = each channel * 0.88, rounded (matches the resolver/client)
    local al = M.tone_rel_luminance(math.floor(r * 0.88 + 0.5), math.floor(g * 0.88 + 0.5), math.floor(b * 0.88 + 0.5))
    local on_light = M.tone_contrast(al, M.tone_rel_luminance(255, 255, 255))
    local on_dark = M.tone_contrast(al, M.tone_rel_luminance(12, 14, 18))
    return on_light >= TONE_MIN_CONTRAST and on_dark >= TONE_MIN_CONTRAST
end

-- Base tone must be an empty string (no override) or a #rgb / #rrggbb hex, so a bad
-- value cannot corrupt the generated primary ramp. An illegible-but-valid tone (one that
-- would render invisible UI) is also rejected — the same guard the editor enforces — so a
-- direct API write cannot persist an invisible theme. Returns the normalized value or ""
-- (which means "no override → built-in default ramp") when invalid or illegible.
function M.safe_primary_color(value: any): string
    if type(value) ~= "string" then return "" end
    local v: string = value:gsub("%s", "")
    if v == "" then return "" end
    if string.match(v, "^#%x%x%x$") or string.match(v, "^#%x%x%x%x%x%x$") then
        local lowered = string.lower(v)
        if not M.is_legible_primary_color(lowered) then return "" end
        return lowered
    end
    return ""
end

-- Home path must be an in-app route (starts with "/"), never a scheme or
-- protocol-relative URL, so a bad setting cannot redirect the landing page off-app.
function M.safe_home_path(value: any): string
    if type(value) ~= "string" or value == "" then return "" end
    if value:sub(1, 1) ~= "/" then return "" end
    if value:sub(1, 2) == "//" then return "" end
    return value
end

-- Instance branding assets are served publicly under BRANDING_PUBLIC_PATH.
M.BRANDING_PUBLIC_PATH = "/kickside-branding"
M.DEFAULT_TITLE = "KickSide"

M.TRUSTED_APP_LOGOS = {
    ["/app/kickside-icon.svg"] = true,
    ["/app/wippy-logo.svg"] = true,
}

-- Uploaded logos are public on the application origin. SVG is active content;
-- only trusted, bundled SVGs belong in TRUSTED_APP_LOGOS.
M.BRANDING_UPLOAD = {
    max_bytes = 2 * 1024 * 1024,
    formats = {
        { label = "PNG", mime = "image/png", extensions = { "png" } },
        { label = "JPG", mime = "image/jpeg", extensions = { "jpg", "jpeg" } },
        { label = "WebP", mime = "image/webp", extensions = { "webp" } },
        { label = "GIF", mime = "image/gif", extensions = { "gif" } },
    },
}
M.BRANDING_IMAGE_EXT = {}
M.BRANDING_IMAGE_MIME = {}
for _, format in ipairs(M.BRANDING_UPLOAD.formats) do
    for _, ext in ipairs(format.extensions) do
        M.BRANDING_IMAGE_EXT[ext] = true
        M.BRANDING_IMAGE_MIME[ext] = format.mime
    end
end

local function path_without_suffix(value: string): string
    return (value:gsub("[?#].*$", ""))
end

local function safe_branding_ext(path: string): boolean
    local ext = (path:match("%.([%a%d]+)$") or ""):lower()
    return M.BRANDING_IMAGE_EXT[ext] == true
end

-- Public branding is rendered before login. Keep logo URLs same-origin and
-- constrained to app-owned static mounts so a bad setting cannot make the login
-- screen load external trackers or scheme URLs.
function M.safe_logo_url(value: any): string
    if type(value) ~= "string" or value == "" then return "" end
    local path = path_without_suffix(value)
    if path:sub(1, #M.BRANDING_PUBLIC_PATH + 1) == M.BRANDING_PUBLIC_PATH .. "/"
        and safe_branding_ext(path)
    then
        return value
    end
    if path:match("^/[%w/_%-]*branding/logo$") then return value end
    if M.TRUSTED_APP_LOGOS[path] == true then
        return value
    end
    return ""
end

M.LAYOUT = {
    VERTICAL = "vertical",
    HORIZONTAL = "horizontal",
}

M.DEFAULT_LAYOUT = M.LAYOUT.VERTICAL
M.DEFAULT_ORDER = 500

-- Nav badge: an optional binding on a nav_item that surfaces a live component-meta
-- field (e.g. inbox pending_count on the nav badge). `source` is the extension
-- point — a future aggregate is a NEW source value, not a new code path. The badge
-- is resolved by nav_badges (a single access-filtered component.query) after the
-- pure nav merge; nav.effective only carries the declared, validated spec.
M.BADGE = {
    SOURCE = { COMPONENT_META = "component_meta" },
    STYLE = { COUNT = "count", DOT = "dot" },
    SCOPE = { ACTOR = "actor" },
    CARDINALITY = { SINGLETON = "singleton" },
}

-- Declared tone vocabulary. A badge names a tone, never a raw color; the shell maps
-- the tone to its severity tokens. active_tone is selected only by a boolean
-- tone_field — never inferred from a count.
M.BADGE_TONES = {
    neutral = true, accent = true, success = true, info = true, warn = true, danger = true,
}

-- Field types used to coerce TEXT component meta into a typed badge value, mirroring
-- the automation public_state read coercion so both consumers read the same shape.
M.BADGE_FIELD_TYPES = {
    integer = true, number = true, boolean = true, checkbox = true,
    object = true, array = true, text = true, string = true,
}

-- Declared spec (source..tone_field) plus the resolver-filled fields (value,
-- component_id) and the client tone-reevaluation inputs (base_tone). One type flows
-- from declaration through resolution to the shell.
type Badge = {
    source: string,
    impl_id: string,
    scope: string,
    cardinality: string,
    field: string,
    field_type: string,
    style: string,
    hide_zero: boolean,
    tone: string,
    base_tone: string,
    active_tone: string?,
    tone_field: string?,
    value: number?,
    component_id: string?,
}

-- Component ids and meta keys are the only free-form badge inputs; both are
-- whitelisted to safe identifiers so a bad declaration yields no badge, never a
-- nav error.
local function badge_identifier(value: any): string?
    if type(value) == "string" and string.match(value, "^[%w][%w_.:-]*$") then return value :: string end
    return nil
end

local function badge_field_key(value: any): string?
    if type(value) == "string" and string.match(value, "^[%w_][%w_]*$") then return value :: string end
    return nil
end

local function badge_tone(value: any, fallback: string): string
    if type(value) == "string" and M.BADGE_TONES[value] then return value :: string end
    return fallback
end

-- normalize_badge validates a declared badge block into a typed spec, or nil when
-- it is absent or malformed (an invalid badge is simply no badge). Only the
-- component_meta source is understood today; other sources normalize to nil.
function M.normalize_badge(raw: any): Badge?
    if type(raw) ~= "table" then return nil end
    local b = raw :: { [string]: any }
    if b.source ~= M.BADGE.SOURCE.COMPONENT_META then return nil end
    if type(b.component) ~= "table" then return nil end
    local c = b.component :: { [string]: any }
    local impl_id = badge_identifier(c.impl_id)
    if not impl_id then return nil end
    local field = badge_field_key(b.field)
    if not field then return nil end
    local field_type = (type(b.field_type) == "string" and M.BADGE_FIELD_TYPES[b.field_type])
        and (b.field_type :: string) or "text"
    local style = (b.style == M.BADGE.STYLE.DOT) and M.BADGE.STYLE.DOT or M.BADGE.STYLE.COUNT
    local base_tone = badge_tone(b.tone, "neutral")
    local active_tone = (type(b.active_tone) == "string" and M.BADGE_TONES[b.active_tone])
        and (b.active_tone :: string) or nil
    return {
        source = M.BADGE.SOURCE.COMPONENT_META,
        impl_id = impl_id,
        scope = M.BADGE.SCOPE.ACTOR,
        cardinality = M.BADGE.CARDINALITY.SINGLETON,
        field = field,
        field_type = field_type,
        style = style,
        hide_zero = b.hide_zero == true,
        tone = base_tone,
        base_tone = base_tone,
        active_tone = active_tone,
        tone_field = badge_field_key(b.tone_field),
        value = nil,
        component_id = nil,
    }
end

-- Coerce a raw (TEXT) component-meta value to its declared field type; returns nil
-- when the value is absent or cannot be coerced. Mirrors the automation public_state
-- read coercion and the client componentRealtime coercion.
function M.coerce_field_value(field_type: string, value: any): any
    if value == nil then return nil end
    if field_type == "boolean" or field_type == "checkbox" then
        if type(value) == "boolean" then return value end
        if type(value) == "string" then
            local lowered = string.lower(value)
            if lowered == "true" then return true end
            if lowered == "false" then return false end
        end
        return nil
    end
    if field_type == "number" or field_type == "integer" then
        if type(value) == "number" then return value end
        if type(value) == "string" then
            local n = tonumber(value)
            if n ~= nil then return n end
        end
        return nil
    end
    return value
end

-- badge_visible is the single display predicate shared by the resolver tests and
-- mirrored client-side: a count needs a numeric value and is hidden at 0 when
-- hide_zero; a dot shows on presence and is hidden at an explicit 0 when hide_zero.
function M.badge_visible(badge: Badge): boolean
    if badge.style == M.BADGE.STYLE.DOT then
        if badge.value == nil then return true end
        return not (badge.hide_zero and badge.value == 0)
    end
    if type(badge.value) ~= "number" then return false end
    return not (badge.hide_zero and badge.value == 0)
end

-- Cross-module contract ports this module depends on. Kept here (the module's
-- one canonical place for ids) rather than inlined at each call site.
M.CONTRACT = {
    SETTINGS = "kickside.settings:settings",
    REALTIME = "kickside.contract:realtime",
    PROFILE = "kickside.users.profile:profile",
    -- Component read port for nav badges; resolved at runtime (absent in minimal
    -- contexts, where badges simply do not resolve).
    COMPONENT = "kickside.component:component_service",
    NAV_PROVIDER = "kickside.ui:nav_provider",
    REGISTRY_NAV_PROVIDER_BINDING = "kickside.ui:registry_nav_provider_binding",
}

-- The component owner meta key (kickside.component OWNER_META_KEY). Named here to
-- keep the ui module decoupled from the component runtime: a scope=actor badge is
-- resolved against the actor's OWN component by matching this owner meta, so an
-- admin who can READ many users' components still badges only their own.
M.COMPONENT_OWNER_META_KEY = "owner"

-- A splash is a surface shown once. Modules declare a registry.entry
-- with meta.type = SPLASH_TYPE and a meta.scope from SPLASH_SCOPE (default USER).
-- A USER splash is seen once per user: the record lives in the profile field
-- SEEN_SPLASHES_KEY. An INSTANCE splash is completed once for the whole instance:
-- the record lives in the setting COMPLETED_SPLASHES_KEY under SETTINGS_NS. Both
-- are server-side, never client storage.
M.SPLASH_TYPE = "ui.splash"
M.SPLASH_PRESENTATION = {
    FULLSCREEN = "fullscreen",
    DIALOG = "dialog",
}

function M.splash_presentation(value: any): (string?, string?)
    if value == nil then return M.SPLASH_PRESENTATION.FULLSCREEN, nil end
    if value == M.SPLASH_PRESENTATION.FULLSCREEN or value == M.SPLASH_PRESENTATION.DIALOG then
        return value :: string, nil
    end
    return nil, "splash presentation must be fullscreen or dialog"
end

M.SPLASH_SCOPE = {
    USER = "user",
    INSTANCE = "instance",
}
M.COMPLETED_SPLASHES_KEY = "completed_splashes"
-- A step within a splash: declared per module, discovered + ordered, composed by
-- the wizard shell. component_tag (optional) mounts the step's own web component.
M.SPLASH_STEP_TYPE = "ui.splash.step"
M.PROFILE_NS = "kickside.ui"
M.SEEN_SPLASHES_KEY = "seen_splashes"
M.PROFILE_LOCALE_NS = "kickside.profile"
M.PROFILE_LOCALE_KEY = "locale"
M.DEFAULT_LOCALE = "en-US"

-- Expose the Badge alias for cross-module type references (nav.lua, nav_badges.lua).
M.Badge = Badge

return M
