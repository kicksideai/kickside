local M: any = {}
function M.reset(stage: string, source: error?)
    M.stage, M.source, M.inserts, M.updates, M.reads, M.denied, M.audit_reply = stage, source, 0, 0, 0, false, 1
end
function M.can(...) return not M.denied, M.stage == "permission" and M.source or nil end
function M.lock_tree(...) return nil end
function M.read_node(...)
    M.reads = M.reads + 1
    return {impl_id = "implementation", path = M.reads == 1 and "/old/" or "/parent/", position = "old-position"}, nil
end
function M.build_path(...) return "/new/" end
function M.max_sibling_position(...) return nil, nil end
function M.rank_between(...) return "next-position" end
function M.is_self_or_descendant(...) return false, nil end
function M.descendants(...) return {{component_id = "descendant", path = "/old/child/"}}, nil end
function M.link_node(...) return nil end
function M.relink_subtree(...) return nil end
function M.for_impl(...) return nil, nil end
function M.check(...) return nil end
function M.canonical_identity(...) return "identity-hash" end
function M.audit_record(...) return "record" end
function M.check_row(...) return nil end
function M.validate_public_meta_key(...) return nil end
function M.encode_public_meta_value(...) return "label", nil end
return M
