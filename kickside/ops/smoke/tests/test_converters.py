from io import BytesIO
import os
from pathlib import Path
import tempfile
import unittest
from unittest.mock import Mock

from reportlab.pdfgen import canvas
from pypdf.errors import PdfReadError

from harness import Cleanup, Failure
from scenarios import Context
from scenarios_converters import html2pdf_sdk, inspect_pdf
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
