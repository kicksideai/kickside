local state = require("state")

return {
    write_bundle = function(_storage, _path, _components)
        state.assembled()
        return true, nil
    end,
    read_header = function(_storage, _path)
        return { data_offset = 0, components = {
            { component_id = "original-component", shell = {}, has_portable = state.has_portable(),
                parts = { { name = "data/nodes.jsonl", len = 2 } } },
        } }, nil
    end,
    extract_part = function(_storage, _bundle_path, _offset, _len, _destination)
        state.extracted()
        return true, nil
    end,
}
