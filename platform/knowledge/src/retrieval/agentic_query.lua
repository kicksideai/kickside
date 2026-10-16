local flow = require("flow")

-- Agentic query driver: answer a question by running a tool-calling agent over
-- the KB. The agent (the KB's configured query_agent, else a built-in default)
-- retrieves passages via the kb_retrieve tool — deciding what to fetch and
-- refining across up to max_retrieval_iterations rounds — and returns a grounded
-- answer through an exit schema. Retrieval (the items shown as sources) stays
-- with the caller; this produces only the answer text. Invoked via funcs.call
-- (run) so the dataflow runtime stays isolated in this function's own pool.

local DEFAULT_AGENT = "kickside.knowledge.retrieval:kb_query_agent"
-- The engine-neutral retrieval facade is pinned to the bound KB via tool context.
-- find/ask/search are intentionally excluded: find/ask reach beyond or recurse
-- into the single bound KB, and search duplicates RetrieveKB.
local RETRIEVE_TOOL = "kickside.knowledge.traits:kb_retrieve_tool"
local DEFAULT_MAX_ITERATIONS = 20

-- The control plane offers only its engine-neutral retrieval tool. An installed
-- engine may publish additional traits/tools, but Knowledge must not name one
-- here: kb10 depends on Knowledge, so a reverse dependency would form a package
-- cycle and make an otherwise optional engine mandatory.
local QUERY_PROMPT = [[You answer the user's question using a single knowledge base. One KB is already bound, so you never need a kb_id.

Use RetrieveKB with fields: ["content", "meta"] to fetch the passages that answer the question. Refine the query across calls when the first result is too broad or incomplete.

Base your answer ONLY on retrieved content — never on prior knowledge. If the knowledge base does not contain the answer, say so plainly rather than guessing. Be concise and direct, and prefer concrete facts. When you have enough, return the final answer.]]

local INSTRUCTION_HEADER = "Instructions from the knowledge base owner — always follow these:\n"
local SEED_HEADER = "Passages already retrieved for this question (a starting point — explore further with the tools and verify before relying on them):\n\n"

-- The query_agent comes from the shared agent picker. Component ids and
-- namespaced registry ids are already accepted by the agent resolver, so keep
-- the stored identity unchanged apart from surrounding whitespace.
local function resolve_agent_ref(value: any): string
    if type(value) ~= "string" then return DEFAULT_AGENT end
    local normalized = (value :: string):gsub("^%s+", ""):gsub("%s+$", "")
    if normalized == "" then return DEFAULT_AGENT end
    return normalized
end

local ANSWER_SCHEMA = {
    type = "object",
    properties = {
        answer = { type = "string", description = "The grounded answer, or a statement that the KB does not contain it." },
        source_ids = { type = "array", items = { type = "string" }, description = "Ids of the passages the answer relies on." },
    },
    required = { "answer" },
    additionalProperties = false,
}

-- Compact digest of the passages the caller already retrieved, so the agent
-- starts informed instead of re-discovering the KB from scratch.
local SEED_MAX = 5
local function seed_text(seed_items: any): string?
    if type(seed_items) ~= "table" then return nil end
    local parts = {}
    for i = 1, math.min(#seed_items, SEED_MAX) do
        local content = tostring((seed_items[i] or {}).content or "")
        if content ~= "" then table.insert(parts, string.format("[%d] %s", i, content)) end
    end
    if #parts == 0 then return nil end
    return table.concat(parts, "\n\n")
end

-- answer(kb_id, query_text, config, seed_items) -> (answer_text, err).
local function answer(kb_id: any, query_text: any, config: any, seed_items: any): (string?, string?)
    config = config or {}
    if type(kb_id) ~= "string" or kb_id == "" then return nil, "knowledge base id is required" end
    if type(query_text) ~= "string" or query_text == "" then return nil, "query is required" end

    -- query_agent is either a component id or a namespaced registry id; the
    -- agent resolver accepts both forms directly.
    local has_custom_agent = type(config.query_agent) == "string" and config.query_agent ~= ""
    local resolved_agent_ref = resolve_agent_ref(config.query_agent)

    local max_iter = tonumber(config.max_retrieval_iterations) or DEFAULT_MAX_ITERATIONS
    if max_iter < 1 then max_iter = 1 end

    -- The KB owner's instructions (config.extra_prompt) are a standing policy for
    -- this KB's answering — e.g. "always check the architecture doc before
    -- retrieving". For the built-in agent they go into the system prompt (so they
    -- steer the whole retrieve-and-reason loop, not just one turn); for a custom
    -- agent we leave its own system prompt intact and lead the message with them.
    local extra = config.extra_prompt
    local has_extra = type(extra) == "string" and extra ~= ""

    -- The generic retrieval facade resolves the installed engine through the KB
    -- descriptor, while its context pins the agent to this one KB.
    local tools: {any} = {
        { id = RETRIEVE_TOOL, context = { kb_id = kb_id } },
    }
    local arena: {[string]: any} = {
        max_iterations = max_iter,
        tool_calling = "auto",
        tools = tools,
        exit_schema = ANSWER_SCHEMA,
    }

    local message = query_text
    if not has_custom_agent then
        arena.prompt = has_extra and (QUERY_PROMPT .. "\n\n" .. INSTRUCTION_HEADER .. extra) or QUERY_PROMPT
    elseif has_extra then
        message = INSTRUCTION_HEADER .. extra .. "\n\nQuestion: " .. query_text
    end

    -- Seed the opening turn with the passages the caller already retrieved.
    local seed = seed_text(seed_items)
    if seed then
        message = SEED_HEADER .. seed .. "\n\nQuestion: " .. message
    end

    local agent_cfg: {[string]: any} = { arena = arena }
    if type(config.analysis_model) == "string" and config.analysis_model ~= "" then
        agent_cfg.model = config.analysis_model
    end

    local result, err = flow.create()
        :with_title("KB Ask")
        :with_input({ message = message })
        :agent(resolved_agent_ref, agent_cfg)
        :run()

    if err or result == nil then
        return nil, "agentic query failed: " .. tostring(err or "no result")
    end
    if type(result) == "table" then
        local answer = (result :: {answer: any}).answer
        if type(answer) == "string" then
            return answer :: string
        end
        return nil, "agentic query returned no answer"
    end
    return nil, "agentic query returned invalid answer"
end

-- Invoked via funcs.call so the dataflow/agent runtime stays in this function's
-- own pool, not the calling HTTP handler's (keeps userspace.dataflow.persist:ops
-- out of the answering/endpoint import closure — same isolation list_agents uses
-- for token packing).
local function run(args: any): any
    args = args or {}
    local result, err = answer(args.kb_id, args.query, args.config, args.seed_items)
    if err then return nil, err end
    return { answer = result }, nil
end

return { run = run, resolve_agent_ref = resolve_agent_ref, prompt = QUERY_PROMPT }
