local ingest = require("ingest_upload")
local function handler(args: any): any
    local result, err = ingest.ingest(args.kb_id, args.upload_id, {})
    return { result = result, error = tostring(err), invalid = errors.is(err, errors.INVALID) }
end
return { handler = handler }
