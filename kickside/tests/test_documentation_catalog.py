from pathlib import Path
import unittest
import yaml

ROOT = Path(__file__).resolve().parents[1]


def documentation_entries():
    entries = []
    for declaration in (ROOT / "app/src").rglob("_index.yaml"):
        entries.extend((yaml.safe_load(declaration.read_text()) or {}).get("entries", []))
    return entries


class DocumentationCatalogTest(unittest.TestCase):
    def test_document_sources_resolve_from_their_registry_owner(self):
        sources = []
        for index in sorted((ROOT / "app/src/app").rglob("_index.yaml")):
            document = yaml.safe_load(index.read_text())
            for entry in document.get("entries", []):
                if entry.get("meta", {}).get("type") == "wippy.documentation.page":
                    content = entry["data"]["content"]
                    self.assertTrue(content.startswith("file://"), entry["name"])
                    sources.append((index.parent / content.removeprefix("file://")).resolve())
                    self.assertTrue(sources[-1].is_file(), f"{entry['name']}: {sources[-1]}")
        self.assertTrue(sources)

    def test_published_registry_catalog_rfc_retains_its_source_and_identity(self):
        source = ROOT / "app/src/app/docs/rfcs/0001-registry-document-catalog.md"
        self.assertTrue(source.is_file())
        entries = [entry for entry in documentation_entries() if entry['name'] == 'documentation.rfc-document-catalog']
        self.assertEqual(len(entries), 1)
        entry = entries[0]
        self.assertEqual(entry['kind'], 'registry.entry')
        self.assertEqual(entry['meta']['type'], 'wippy.documentation.page')
        self.assertEqual(entry['data']['path'], 'docs/rfcs/0001-registry-document-catalog.md')
        self.assertEqual(entry['data']['document_kind'], 'rfc')
        self.assertEqual(entry['data']['status'], 'accepted')
        self.assertIn('# RFC 0001: Registry Documentation Catalog', source.read_text())

    def test_registry_fragments_declare_unique_documentation_identities(self):
        identities = []
        for path in (ROOT / "app/src/app").rglob("*.yaml"):
            document = yaml.safe_load(path.read_text()) or {}
            for entry in document.get('entries', []):
                if entry.get('meta', {}).get('type') == 'wippy.documentation.page':
                    identities.append(document['namespace'] + ':' + entry['name'])
        self.assertEqual(len(identities), len(set(identities)))
        self.assertIn('app:documentation.rfc-document-catalog', identities)

    def test_canonical_developer_handbook_remains_discoverable(self):
        catalog = {"entries": documentation_entries()}
        handbook = next(entry for entry in catalog["entries"] if entry["name"] == "documentation.developer-handbook")
        self.assertEqual(handbook["meta"]["type"], "wippy.documentation.page")
        self.assertEqual(handbook["kind"], "registry.entry")

    def test_documentation_content_files_exist_across_registry_sources(self):
        source = ROOT / "app/src"
        for declaration in source.rglob("_index.yaml"):
            catalog = yaml.safe_load(declaration.read_text()) or {}
            for entry in catalog.get("entries", []):
                if entry.get("meta", {}).get("type") != "wippy.documentation.page":
                    continue
                content = entry.get("data", {}).get("content", "")
                if isinstance(content, str) and content.startswith("file://"):
                    with self.subTest(entry=entry["name"], declaration=str(declaration)):
                        self.assertTrue((declaration.parent / content[7:]).is_file(), content)
