local flow = {}
function flow.create(): any
    local request: any = {}
    function request:with_title(_: string): any return self end
    function request:with_input(input: any): any self.input = input; return self end
    function request:agent(_: any, __: any): any return self end
    function request:run(): (any?, string?)
        if self.input.message == "scalar" then return "unstructured answer", nil end
        if self.input.message == "missing" then return { source_ids = {} }, nil end
        if self.input.message == "failure" then return nil, "agent unavailable" end
        return { answer = "grounded answer", source_ids = {} }, nil
    end
    return request
end
return flow
