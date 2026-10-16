"""Published human MCP accounts survive consumer-first and complete credential-guard updates."""
import os
from pathlib import Path
import unittest

from ops.compat.integration.credential_updates import verify_credential_update


class McpBotAccountsUpgradeTests(unittest.TestCase):
    def test_published_mcp_credentials_and_calls_survive_update_orders_on_both_engines(self):
        self.verify(("sqlite", "postgres"), Path(os.environ["TMPDIR"]), os.environ)

    def verify(self, engines, evidence_root, environment):
        verify_credential_update(self, "kickside/mcp", Path("platform/mcp/test-bot-accounts"), "run_as_mcp_upgrade.lua",
            {"repo": "kickside.mcp.persist:repo", "users": "kickside.users.persist:user_repo",
             "groups": "kickside.users.persist:user_groups_repo"},
            ["sql", "json", "security", "funcs", "registry", "http_client"], engines, evidence_root, environment,
            related_consumers=("kickside/contract",),
            host_capability={"module": "kickside/contract", "requirement": "kickside.contract:host_credential_guard"},
            depends_on=("app:credential_actions", "app:echo_tool"))


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--engine", choices=("sqlite", "postgres"))
    parser.add_argument("--evidence", type=Path, default=Path(os.environ["TMPDIR"]))
    args = parser.parse_args()
    args.evidence.mkdir(parents=True, exist_ok=True)
    McpBotAccountsUpgradeTests().verify((args.engine,) if args.engine else ("sqlite", "postgres"),
                                      args.evidence, os.environ)
