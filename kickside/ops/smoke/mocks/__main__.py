import argparse
import json
import signal
import threading

from . import Fixtures


def main():
    parser = argparse.ArgumentParser(description='Run a local Northwind provider fixture')
    parser.add_argument('name', choices=('jira', 'gitlab'))
    parser.add_argument('--port', type=int, default=0)
    parser.add_argument('--base-path', default='')
    parser.add_argument('--record', help='Write redacted requests to this JSON file on shutdown')
    args = parser.parse_args()
    fixtures = Fixtures()
    done = threading.Event()
    signal.signal(signal.SIGTERM, lambda *_: done.set())
    signal.signal(signal.SIGINT, lambda *_: done.set())
    try:
        print(json.dumps({'base_url': fixtures.start(args.name, port=args.port, base_path=args.base_path)}), flush=True)
        done.wait()
    finally:
        try:
            if args.record:
                with open(args.record, 'w') as output:
                    json.dump(fixtures.requests(), output, indent=2)
                    output.write('\n')
        finally:
            fixtures.stop()


if __name__ == '__main__':
    main()
