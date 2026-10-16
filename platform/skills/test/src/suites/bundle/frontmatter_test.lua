-- Tests for the SKILL.md frontmatter parser (bundle/frontmatter.lua). Pure logic,
-- no IO: verifies the bounded subset the open SKILL.md format uses — scalars,
-- nested metadata maps, list values (inline + dash), and allowed-tools splitting.

local test = require("test")
local frontmatter = require("frontmatter")

local function define_tests()
    test.describe("kickside.skills frontmatter", function()
        test.it("parses key/value scalars and returns the body", function()
            local doc = table.concat({
                "---",
                "name: pdf-extract",
                'description: "Extract text and tables from a PDF."',
                "version: 1.2.0",
                "---",
                "# PDF Extract",
                "",
                "1. Open the PDF.",
            }, "\n")
            local fm, body = frontmatter.parse(doc)
            test.eq(fm.name, "pdf-extract")
            test.eq(fm.description, "Extract text and tables from a PDF.")
            test.eq(fm.version, "1.2.0")
            test.is_true(string.find(body, "# PDF Extract", 1, true) ~= nil)
            test.is_true(string.find(body, "name: pdf-extract", 1, true) == nil)
        end)

        test.it("treats a document with no frontmatter as all body", function()
            local fm, body = frontmatter.parse("# Just markdown\nno fm here")
            test.eq(next(fm), nil)
            test.is_true(string.find(body, "Just markdown", 1, true) ~= nil)
        end)

        test.it("tolerates a leading BOM and blank lines before the fence", function()
            local fm = frontmatter.parse("\239\187\191\n---\nname: x\n---\nbody")
            test.eq(fm.name, "x")
        end)

        test.it("returns empty for non-string input", function()
            local fm, body = frontmatter.parse(nil)
            test.eq(next(fm), nil)
            test.eq(body, "")
        end)

        test.it("parses an inline list value", function()
            local fm = frontmatter.parse("---\ntags: [pdf, extract, ocr]\n---\nbody")
            test.eq(type(fm.tags), "table")
            test.eq(#fm.tags, 3)
            test.eq(fm.tags[1], "pdf")
            test.eq(fm.tags[3], "ocr")
        end)

        test.it("parses a dash list value", function()
            local doc = "---\ntools:\n  - read\n  - write\n  - search\n---\nbody"
            local fm = frontmatter.parse(doc)
            test.eq(type(fm.tools), "table")
            test.eq(#fm.tools, 3)
            test.eq(fm.tools[2], "write")
        end)

        test.it("splits a bare allowed-tools scalar on spaces", function()
            local fm = frontmatter.parse("---\nallowed-tools: Read Write Bash\n---\nbody")
            test.eq(type(fm["allowed-tools"]), "table")
            test.eq(#fm["allowed-tools"], 3)
            test.eq(fm["allowed-tools"][3], "Bash")
        end)

        test.it("rejects the nonstandard allowed_tools key with a clear error", function()
            local fm, body, err = frontmatter.parse("---\nallowed_tools: Read Write Bash\n---\nbody")
            test.is_nil(fm)
            test.eq(body, "body")
            test.eq(err, "SKILL.md frontmatter uses allowed-tools, not allowed_tools")
        end)

        test.it("parses a nested metadata map", function()
            local doc = "---\nname: x\nmetadata:\n  author: alice\n  category: docs\n---\nbody"
            local fm = frontmatter.parse(doc)
            test.eq(type(fm.metadata), "table")
            test.eq(fm.metadata.author, "alice")
            test.eq(fm.metadata.category, "docs")
        end)

        test.it("keeps the body intact after the closing fence", function()
            local doc = "---\nname: x\n---\nline one\nline two\n"
            local _, body = frontmatter.parse(doc)
            test.is_true(string.find(body, "line one", 1, true) ~= nil)
            test.is_true(string.find(body, "line two", 1, true) ~= nil)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options: any): any
    return run_cases(options)
end

return { run = run }
