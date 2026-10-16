"""Jira fixture routes through the shared native provider endpoint owner."""
from urllib.parse import urlsplit

from scenarios_providers import ORIGIN_ROUTES


def jira_endpoints(bases):
    for name in ('fireflies', 'discord', 'google'):
        parsed = urlsplit(bases[name])
        if parsed.scheme != 'http' or parsed.hostname != '127.0.0.1' or not parsed.port:
            raise ValueError('Jira fixture requires a loopback HTTP origin: ' + name)
    return {requirement: bases[name] + path
            for requirement, (name, path) in ORIGIN_ROUTES.items()
            if name in bases and requirement.startswith(('kickside.fireflies:', 'kickside.discord:', 'kickside.google:'))}
