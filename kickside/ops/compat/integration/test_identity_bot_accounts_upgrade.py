"""Published human external links and pending codes survive credential-guard updates."""
import os
from pathlib import Path
import unittest

from ops.compat.integration.credential_updates import verify_credential_update


class IdentityBotAccountsUpgradeTests(unittest.TestCase):
    def test_published_links_codes_and_sessions_survive_update_orders_on_both_engines(self):
        self.verify(("sqlite", "postgres"), Path(os.environ["TMPDIR"]), os.environ)

    def verify(self, engines, evidence_root, environment):
        verify_credential_update(self, "kickside/identity", Path("platform/identity/test-bot-accounts"),
            "run_as_identity_upgrade.lua",
            {"links": "kickside.identity:link_service", "users": "kickside.users.persist:user_repo",
             "groups": "kickside.users.persist:user_groups_repo", "session": "kickside.users:session",
             "session_index": "kickside.users.persist:session_index"},
            ["sql", "json", "security"], engines, evidence_root, environment,
            related_consumers=("kickside/dm", "kickside/contract"), final_phases=("completion",),
            host_capability={"module": "kickside/contract", "requirement": "kickside.contract:host_credential_guard"})


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--engine", choices=("sqlite", "postgres"))
    parser.add_argument("--evidence", type=Path, default=Path(os.environ["TMPDIR"]))
    args = parser.parse_args()
    args.evidence.mkdir(parents=True, exist_ok=True)
    IdentityBotAccountsUpgradeTests().verify((args.engine,) if args.engine else ("sqlite", "postgres"),
                                           args.evidence, os.environ)
