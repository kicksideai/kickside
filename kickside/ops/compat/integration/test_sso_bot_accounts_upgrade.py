"""Published human SSO accounts survive consumer-first and complete credential-guard updates."""
import os
from pathlib import Path
import unittest

from ops.compat.integration.credential_updates import verify_credential_update


class SsoBotAccountsUpgradeTests(unittest.TestCase):
    def test_published_sso_sessions_links_and_login_survive_update_orders_on_both_engines(self):
        self.verify(("sqlite", "postgres"), Path(os.environ["TMPDIR"]), os.environ)

    def verify(self, engines, evidence_root, environment):
        verify_credential_update(self, "kickside/sso", Path("components/sso/test"), "run_as_sso_upgrade.lua",
            {"provisioner": "kickside.sso.persist:provisioner", "session": "kickside.sso:session",
             "user_repo": "kickside.users.persist:user_repo", "identities_repo": "kickside.sso.persist:identities_repo",
             "session_index": "kickside.users.persist:session_index"},
            ["sql", "json", "security", "contract", "crypto"], engines, evidence_root, environment,
            related_consumers=("kickside/contract",),
            host_capability={"module": "kickside/contract", "requirement": "kickside.contract:host_credential_guard"},
            extra_guards={"lookup_guard": {"name": "lookup_credential_guard", "modules": ["sql", "funcs"],
                "source": ("local sql=require('sql')\nlocal funcs=require('funcs')\nreturn {check=function(args)\n"
                "local eligible,err=funcs.call('kickside.users.binding:credential_eligibility',args)\n"
                "if not eligible then return nil,err end\nlocal db=assert(sql.get('app:db'))\n"
                "local _,rename_err=db:execute('ALTER TABLE app_user_groups RENAME TO compat_sso_unavailable_groups')\n"
                "db:release()\nif rename_err then return nil,rename_err end\nreturn true end}\n") }})


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--engine", choices=("sqlite", "postgres"))
    parser.add_argument("--evidence", type=Path, default=Path(os.environ["TMPDIR"]))
    args = parser.parse_args()
    args.evidence.mkdir(parents=True, exist_ok=True)
    SsoBotAccountsUpgradeTests().verify((args.engine,) if args.engine else ("sqlite", "postgres"),
                                      args.evidence, os.environ)
