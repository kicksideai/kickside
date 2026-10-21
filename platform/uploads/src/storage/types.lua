type Policy = {
    mode: "local" | "s3",
    resource_id: string,
    prefix: string,
}

type Object = {
    storage_id: string,
    storage_path: string,
    mime_type: string?,
}

type Location = {
    storage_id: string,
    storage_path: string,
    resource_id: string,
    object_key: string,
    state: "copying" | "ready",
    size: number?,
    verification_digest: string?,
    etag: string?,
    updated_at: string,
}

type NativeDestination = { config: string, bucket: string, endpoint: string }
type Destination = { resource_id: string, config_id: string, bucket: string, endpoint: string }
type Placement = { placed: boolean?, skipped: boolean? }
type CopyOptions = { should_continue: (() -> (boolean?, any?))? }

return {}
