local upload_type = require("upload_type")

local MIME_TYPES: {[string]: string} = {
    ["txt"] = "text/plain",
    ["html"] = "text/html",
    ["htm"] = "text/html",
    ["css"] = "text/css",
    ["csv"] = "text/csv",
    ["xml"] = "application/xml",
    ["md"] = "text/markdown",
    ["pdf"] = "application/pdf",
    ["doc"] = "application/msword",
    ["docx"] = "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ["xls"] = "application/vnd.ms-excel",
    ["xlsx"] = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ["ppt"] = "application/vnd.ms-powerpoint",
    ["pptx"] = "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ["odt"] = "application/vnd.oasis.opendocument.text",
    ["ods"] = "application/vnd.oasis.opendocument.spreadsheet",
    ["odp"] = "application/vnd.oasis.opendocument.presentation",
    ["rtf"] = "application/rtf",
    ["jpg"] = "image/jpeg",
    ["jpeg"] = "image/jpeg",
    ["png"] = "image/png",
    ["gif"] = "image/gif",
    ["bmp"] = "image/bmp",
    ["svg"] = "image/svg+xml",
    ["webp"] = "image/webp",
    ["tiff"] = "image/tiff",
    ["tif"] = "image/tiff",
    ["ico"] = "image/x-icon",
    ["mp3"] = "audio/mpeg",
    ["wav"] = "audio/wav",
    ["ogg"] = "audio/ogg",
    ["flac"] = "audio/flac",
    ["aac"] = "audio/aac",
    ["m4a"] = "audio/mp4",
    ["mp4"] = "video/mp4",
    ["avi"] = "video/x-msvideo",
    ["mov"] = "video/quicktime",
    ["wmv"] = "video/x-ms-wmv",
    ["mkv"] = "video/x-matroska",
    ["webm"] = "video/webm",
    ["flv"] = "video/x-flv",
    ["zip"] = "application/zip",
    ["rar"] = "application/x-rar-compressed",
    ["7z"] = "application/x-7z-compressed",
    ["tar"] = "application/x-tar",
    ["gz"] = "application/gzip",
    ["js"] = "application/javascript",
    ["json"] = "application/json",
    ["lua"] = "text/x-lua",
    ["py"] = "text/x-python",
    ["java"] = "text/x-java",
    ["c"] = "text/x-c",
    ["cpp"] = "text/x-c++",
    ["cs"] = "text/x-csharp",
    ["go"] = "text/x-go",
    ["rb"] = "text/x-ruby",
    ["php"] = "text/x-php",
    ["sql"] = "application/sql",
    ["ttf"] = "font/ttf",
    ["otf"] = "font/otf",
    ["woff"] = "font/woff",
    ["woff2"] = "font/woff2",
    ["eml"] = "message/rfc822",
    ["exe"] = "application/octet-stream",
    ["bin"] = "application/octet-stream",
    ["dmg"] = "application/x-apple-diskimage",
    ["iso"] = "application/x-iso9660-image",
}

local function get_file_extension(filename)
    return filename:match("%.([^%.]+)$") or ""
end

local function get_mime_type_from_extension(filename)
    local ext = get_file_extension(filename):lower()
    if ext and MIME_TYPES[ext] then
        return MIME_TYPES[ext]
    end
    return "application/octet-stream"
end

local function determine_upload_type(mime_type, filename)
    local ext = get_file_extension(filename)
    local type_entry, err = upload_type.find_by_mime_or_ext(mime_type, ext)
    if not type_entry then
        return nil, "Unsupported file type: " .. (err or "unknown error")
    end
    return type_entry.id
end


return {
    get_file_extension = get_file_extension,
    get_mime_type_from_extension = get_mime_type_from_extension,
    determine_upload_type = determine_upload_type,
}
