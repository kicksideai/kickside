-- Dissolve Branch nodes and reject impossible wait-all convergence.
local M = {}
type Map = { [string]: any }
type Err = { code: string, message: string, node_id: string?, edge_id: string? }
type Edge = { id: string, source: string, target: string, source_port: string, transform: any, is_failure: boolean, discriminator: string?, condition: string?, via_branch: string?, via_branch_arm: string? }
function M.dissolve(nodes: { [string]: Map }, original_order: { string }, original_edges: { Edge }, errors: { Err }, I: any): ({ Edge }, { string })
local order, edges = original_order, original_edges
local str, err, branch_predicate, conditions = I.str, I.err, I.branch_predicate, I.conditions
    -- ── branch dissolution (D11) ─────────────────────────────────────────
    -- A branch (If) materializes NO engine node. Its predecessors are rerouted
    -- straight to its successors: edges leaving the `true` port carry the compiled
    -- predicate C, edges leaving `false` carry the negation !C (the non-exclusive
    -- fan-out law). The branch def id rides each rerouted edge (via_branch) so the run
    -- overlay attributes the routing to the branch node. Downstream convergence of the
    -- two arms is exclusive (they reconverge at a Merge, which declares no
    -- inputs.required). Dissolution runs before reachability/cycle analysis so the rest
    -- of the compiler never sees the branch.
    do
        local by_id: { [string]: Map } = {}
        for _, id in ipairs(order) do by_id[id] = nodes[id] end
        for _, bid in ipairs(order) do
            local node = by_id[bid]
            if node and str(node.kind) == "branch" then
                local predicate = branch_predicate(node)
                local C = tostring(conditions.compile(predicate, "output"))
                local NC = tostring(conditions.negate(C))

                local incoming_b: { Edge } = {}
                local out_true: { Edge } = {}
                local out_false: { Edge } = {}
                local bad_port = false
                for _, e in ipairs(edges) do
                    if e.target == bid then incoming_b[#incoming_b + 1] = e end
                    if e.source == bid then
                        local port = e.source_port
                        if port == "true" then out_true[#out_true + 1] = e
                        elseif port == "false" then out_false[#out_false + 1] = e
                        else bad_port = true end
                    end
                end
                if bad_port then
                    err(errors, "branch_port_unknown", "branch node out-edges must leave the true or false port", bid)
                end
                if #incoming_b == 0 then
                    err(errors, "branch_no_input", "branch node needs an incoming edge to test", bid)
                end
                if #out_true + #out_false == 0 then
                    err(errors, "branch_no_output", "branch node needs at least one outgoing edge (true or false)", bid)
                end

                -- Reroute predecessor -> successor with the arm condition.
                local rerouted: { Edge } = {}
                local function reroute(inc: Edge, arm: Edge, cond: string, arm_name: string)
                    local combined = cond
                    if inc.condition ~= nil and inc.condition ~= "" then
                        combined = "(" .. inc.condition .. ") && (" .. cond .. ")"
                    end
                    rerouted[#rerouted + 1] = {
                        id = inc.id .. ">" .. bid .. ">" .. arm.id,
                        source = inc.source, target = arm.target,
                        source_port = inc.source_port,
                        transform = arm.transform,
                        is_failure = inc.is_failure, discriminator = nil,
                        condition = cond == "" and nil or combined,
                        via_branch = bid, via_branch_arm = arm_name,
                    }
                end
                for _, inc in ipairs(incoming_b) do
                    for _, arm in ipairs(out_true) do reroute(inc, arm, C, "true") end
                    for _, arm in ipairs(out_false) do reroute(inc, arm, NC, "false") end
                end

                -- Drop the branch node and every edge incident to it; add the reroutes.
                local kept: { Edge } = {}
                for _, e in ipairs(edges) do
                    if e.source ~= bid and e.target ~= bid then kept[#kept + 1] = e end
                end
                for _, e in ipairs(rerouted) do kept[#kept + 1] = e end
                edges = kept
                nodes[bid] = nil
            end
        end
        -- Rebuild the node order without the dissolved branches.
        local new_order: { string } = {}
        for _, id in ipairs(order) do
            if nodes[id] ~= nil then new_order[#new_order + 1] = id end
        end
        order = new_order
    end
return edges, order
end
function M.check_exclusive(nodes: { [string]: Map }, order: { string }, edges: { Edge }, errors: { Err }, I: any): ()
local str, err, combine_mode = I.str, I.err, I.combine_mode
    -- A wait-all Combine cannot complete when every one of its inputs comes from
    -- mutually-exclusive arms of the same dissolved Branch. Keep the arm provenance
    -- while it flows through ordinary nodes so the publish error catches both direct
    -- and multi-step reconvergences before the scheduler can hang.
    do
        type ArmSet = { [string]: boolean }
        type Origin = { plain: boolean, arms: { [string]: ArmSet } }
        local origins: { [string]: Origin } = {}

        local function empty_origin(): Origin
            return { plain = false, arms = {} }
        end

        local function copy_origin(origin: Origin): Origin
            local out: Origin = empty_origin()
            out.plain = origin.plain
            for branch_id, arms in pairs(origin.arms) do
                local copied: ArmSet = {}
                for arm, present in pairs(arms) do copied[arm] = present end
                out.arms[branch_id] = copied
            end
            return out
        end

        local function merge_origin(into: Origin, from: Origin): boolean
            local changed = false
            if from.plain and not into.plain then into.plain = true; changed = true end
            for branch_id, arms in pairs(from.arms) do
                into.arms[branch_id] = into.arms[branch_id] or {}
                for arm, present in pairs(arms) do
                    if present and not (into.arms[branch_id] :: ArmSet)[arm] then
                        (into.arms[branch_id] :: ArmSet)[arm] = true
                        changed = true
                    end
                end
            end
            return changed
        end

        local function origin_of(edge: Edge): Origin
            if edge.via_branch and edge.via_branch_arm then
                return { plain = false, arms = { [edge.via_branch] = { [edge.via_branch_arm] = true } } }
            end
            local source = origins[edge.source]
            if source then return copy_origin(source) end
            -- A non-branch source is ordinary flow; it cannot prove exclusive arms.
            return { plain = true, arms = {} }
        end

        -- The graph is acyclic once accidental cycles are rejected below. A bounded
        -- fixed-point still makes this proof independent of authoring order.
        for _ = 1, #order + 1 do
            local changed = false
            for _, edge in ipairs(edges) do
                local target = origins[edge.target] or empty_origin()
                if merge_origin(target, origin_of(edge)) then changed = true end
                origins[edge.target] = target
            end
            if not changed then break end
        end

        local by_target: { [string]: { Edge } } = {}
        for _, edge in ipairs(edges) do
            by_target[edge.target] = by_target[edge.target] or {}
            by_target[edge.target][#by_target[edge.target] + 1] = edge
        end
        for _, id in ipairs(order) do
            local node = nodes[id] :: Map?
            local cfg = node and type(node.config) == "table" and (node.config :: Map) or {}
            local inputs = by_target[id] or {}
            if node and str(node.kind) == "combine" and combine_mode(cfg) == "wait_all" and #inputs > 1 then
                local first = origin_of(inputs[1])
                for branch_id, _ in pairs(first.arms) do
                    local all_exclusive, saw_true, saw_false = true, false, false
                    for _, edge in ipairs(inputs) do
                        local origin = origin_of(edge)
                        local arms = origin.arms[branch_id]
                        local on_true = arms and arms["true"] == true or false
                        local on_false = arms and arms["false"] == true or false
                        if origin.plain or not arms or (on_true == on_false) then
                            all_exclusive = false
                            break
                        end
                        saw_true = saw_true or on_true
                        saw_false = saw_false or on_false
                    end
                    if all_exclusive and saw_true and saw_false then
                        err(errors, "combine_wait_all_exclusive_paths",
                            "Combine wait_all receives only mutually-exclusive Branch arms from " .. branch_id .. "; one arm can never arrive. Change config.mode to first_wins.",
                            id)
                        break
                    end
                end
            end
        end
    end
end
return M
