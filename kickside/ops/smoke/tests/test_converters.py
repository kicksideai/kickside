from io import BytesIO
import os
from pathlib import Path
import tempfile
import unittest
from unittest.mock import Mock, patch

from reportlab.pdfgen import canvas
from pypdf.errors import PdfReadError

from harness import Cleanup, Failure
from scenarios import Context
from scenarios_converters import html2pdf_sdk, inspect_pdf, shipped_wasm_artifacts, wasm_artifact_paths
from scenarios_converters import MARKERS
import base64
import json


def document(pages):
    output = BytesIO()
    pdf = canvas.Canvas(output)
    for text in pages:
        pdf.drawString(40, 750, text)
        pdf.showPage()
    pdf.save()
    return output.getvalue()


class ConverterPDFTests(unittest.TestCase):
    def test_wasm_artifacts_use_git_filter_when_source_has_metadata(self):
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            source = Path(directory)
            (source / '.git').mkdir()
            wasm = source / 'src' / 'shipped.wasm'
            wasm.parent.mkdir()
            wasm.write_bytes(b'shipped')
            untracked = source / 'src' / 'generated.wasm'
            untracked.write_bytes(b'generated')
            with patch('scenarios_converters.subprocess.check_output',
                       side_effect=lambda command, **kwargs: 'src/shipped.wasm\n'
                       if command[-1] == 'src/shipped.wasm' else '') as listed:
                self.assertEqual(shipped_wasm_artifacts(source), [(wasm, 'tracked')])
            self.assertEqual(listed.call_count, 2)

    def test_wasm_artifacts_inspect_every_file_in_a_git_free_archive(self):
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            source = Path(directory)
            first = source / 'src' / 'first.wasm'
            first.parent.mkdir()
            first.write_bytes(b'first')
            second = source / 'src' / 'nested' / 'second.wasm'
            second.parent.mkdir()
            second.write_bytes(b'second')
            with patch('scenarios_converters.subprocess.check_output') as listed:
                self.assertEqual(shipped_wasm_artifacts(source), [(first, 'archived'), (second, 'archived')])
            listed.assert_not_called()

    def test_wasm_artifact_git_errors_propagate_when_metadata_is_present(self):
        import subprocess
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            source = Path(directory)
            (source / '.git').mkdir()
            artifact = source / 'src' / 'shipped.wasm'
            artifact.parent.mkdir()
            artifact.write_bytes(b'shipped')
            with patch('scenarios_converters.subprocess.check_output',
                       side_effect=subprocess.CalledProcessError(1, ['git'])):
                with self.assertRaises(subprocess.CalledProcessError):
                    shipped_wasm_artifacts(source)

    def test_wasm_path_guard_rejects_nonportable_artifacts_in_a_git_free_archive(self):
        from types import SimpleNamespace
        from harness import Failure
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            source = Path(directory)
            artifact = source / 'src' / 'shipped.wasm'
            artifact.parent.mkdir()
            artifact.write_bytes(b'/home/builder/private/source')
            evidence = Mock()
            ctx = SimpleNamespace(inst=SimpleNamespace(
                config={'replace': {'kickside/converter': str(source)}}, evidence=evidence))
            with self.assertRaisesRegex(Failure, 'Wasm artifacts contain local source paths'):
                wasm_artifact_paths(ctx)
            rows = evidence.save.call_args.args[1]
            self.assertEqual(rows[0]['ownership'], 'archived')
            self.assertFalse(rows[0]['portable_paths'])

    def test_pdf_probe_reads_a_direct_result_before_inspection(self):
        pdf = document([' '.join(MARKERS)])
        payload = {'pdf_base64': base64.b64encode(pdf).decode(), 'byte_count': len(pdf)}
        calls = []
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            inst = Mock()
            inst.app = inst.root = Path(directory)
            inst.evidence.label = 'converter'
            inst.evidence.paths = []
            inst.cleanup = Cleanup()
            ctx = Context(inst)
            ctx.restart_runtime = Mock()

            def request(method, path, body=None, **kwargs):
                if path == '/api/v1/mcp/credentials':
                    self.assertEqual(body['allowed_tool_ids'], ['app.smoke.converters:probe'])
                    return {'credential': {'token': 'fixture', 'credential_id': 'fixture'}}
                if kwargs.get('auth') == '':
                    return {'error': {'message': 'unauthorized'}}
                if body['params']['name'] == 'kickside.convert.html2pdf:render':
                    return {'error': {'message': 'outside credential'}}
                calls.append(body)
                return {'jsonrpc': '2.0', 'id': body['id'], 'result': {
                    'isError': False, 'content': [{'type': 'text', 'text': json.dumps(payload)}]}}

            inst.request.side_effect = request
            html2pdf_sdk(ctx)
            self.assertEqual((inst.root / 'converter/northwind-invoice.pdf').read_bytes(), pdf)
            self.assertEqual(len(calls), 1)

    def test_probe_loads_through_context_owned_restart(self):
        class CredentialBoundary(Exception):
            pass

        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            inst = Mock()
            inst.app = Path(directory)
            inst.cleanup = Cleanup()
            ctx = Context(inst)
            browser = Mock(errors=[])
            ctx.browser = browser
            restarts = []

            def restart(context, hard=False):
                self.assertIs(context, ctx)
                self.assertIs(context.browser, browser)
                self.assertFalse(hard)
                self.assertTrue((inst.app / 'src/converter-smoke/probe.lua').is_file())
                self.assertTrue((inst.app / 'src/converter-smoke/_index.yaml').is_file())
                restarts.append(context)

            ctx.restart_runtime = restart
            inst.request.side_effect = CredentialBoundary
            with self.assertRaises(CredentialBoundary):
                html2pdf_sdk(ctx)
            self.assertEqual(restarts, [ctx])
            self.assertEqual([call.args[0] for call in inst.install.call_args_list],
                             ['kickside/html2pdf', 'kickside/mcp'])
            inst.manifest.assert_called_once_with()
            browser.close.assert_not_called()

    def test_real_pdf_contains_one_page_and_expected_text(self):
        result = inspect_pdf(document(['Northwind fictional invoice NW-PDF-731']),
                             ('Northwind', 'NW-PDF-731'))
        self.assertEqual(result['pages'], 1)
        self.assertIn('NW-PDF-731', result['text'])

    def test_header_without_pdf_structure_fails(self):
        with self.assertRaises(PdfReadError):
            inspect_pdf(b'%PDF-1.7\nNorthwind NW-PDF-731\n%%EOF', ('NW-PDF-731',))

    def test_non_pdf_fails(self):
        with self.assertRaisesRegex(Failure, 'PDF header'):
            inspect_pdf(b'Northwind NW-PDF-731', ('NW-PDF-731',))

    def test_missing_embedded_text_fails(self):
        with self.assertRaisesRegex(Failure, 'NW-PDF-731'):
            inspect_pdf(document(['Northwind']), ('Northwind', 'NW-PDF-731'))

    def test_extra_page_fails(self):
        with self.assertRaisesRegex(Failure, 'one page'):
            inspect_pdf(document(['NW-PDF-731', 'Northwind']), ('NW-PDF-731',))
