import threading
import unittest

from harness import ReceiptRecords


class ReceiptPublicationTests(unittest.TestCase):
    def test_published_records_do_not_share_worker_or_reader_mutations(self):
        records = ReceiptRecords()
        working = {'gates': {'sqlite': {'rc': 0}}, 'complete': False}
        records.publish('module', working)
        working['gates']['postgres'] = {'rc': 1}
        self.assertEqual(records.snapshot(), [{'gates': {'sqlite': {'rc': 0}}, 'complete': False}])
        records.snapshot()[0]['gates'].clear()
        self.assertEqual(records.snapshot()[0]['gates'], {'sqlite': {'rc': 0}})
        working['complete'] = True
        records.publish('module', working)
        self.assertEqual(len(records.snapshot()), 1)
        self.assertEqual(records.snapshot()[0], working)

    def test_concurrent_workers_publish_complete_engine_receipts(self):
        records = ReceiptRecords()
        barrier = threading.Barrier(5)
        errors = []
        def worker(number):
            try:
                barrier.wait(timeout=5)
                for version in range(100):
                    row = {'version': version, 'gates': {'sqlite': version, 'postgres': version}}
                    records.publish(number, row)
                    row['gates'].clear()
                    for snapshot in records.snapshot():
                        self.assertEqual(snapshot['gates'], {'sqlite': snapshot['version'], 'postgres': snapshot['version']})
            except Exception as error:
                errors.append(error)
        threads = [threading.Thread(target=worker, args=(number,)) for number in range(4)]
        for thread in threads:
            thread.start()
        barrier.wait(timeout=5)
        for thread in threads:
            thread.join(timeout=5)
            self.assertFalse(thread.is_alive())
        self.assertEqual(errors, [])
        self.assertEqual(len(records.snapshot()), 4)
