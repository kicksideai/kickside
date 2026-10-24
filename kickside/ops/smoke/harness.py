"""Scenario contracts, evidence redaction, and resource ownership."""
from dataclasses import asdict, dataclass, field, replace
import json
import copy
from pathlib import Path
import re
import subprocess
import threading
from concurrent.futures import ThreadPoolExecutor, wait, FIRST_COMPLETED
from urllib.parse import quote, urlsplit

ISOLATED_AREAS = frozenset({'scenarios_ai', 'scenarios_core', 'scenarios_providers'})


class Failure(RuntimeError):
    pass


def require(condition, error):
    if not condition:
        raise Failure(error)


@dataclass(frozen=True)
class Scenario:
    name: str
    tier: str
    run: object
    requires: tuple = ()
    model: bool = False
    features: tuple = ()
    owner: str = "scenarios"
    parallel: tuple = ()
    instance_setup: bool = False
    navigation: tuple = ()
    capture_navigation: tuple = ()
    issues: tuple = ()
    source_components: tuple = ()
    source_checkout_roots: tuple = ()

    def __post_init__(self):
        if (not isinstance(self.issues, (tuple, list)) or
                any(not isinstance(issue, str) or not issue.strip() or issue != issue.strip() for issue in self.issues) or
                len(set(self.issues)) != len(self.issues)):
            raise ValueError('Scenario issues must be unique nonempty issue IDs: ' + self.name)


        if (not isinstance(self.source_components, (tuple, list)) or
                any(not isinstance(component, str) or component.count("/") != 1 or
                    not all(component.split("/")) for component in self.source_components) or
                len(set(self.source_components)) != len(self.source_components)):
            raise ValueError("Scenario source components must be unique org/module identities: " + self.name)
        if (not isinstance(self.source_checkout_roots, (tuple, list)) or
                any(not isinstance(root, str) or not root or Path(root).is_absolute() or
                    "/" in root or root in (".", "..") for root in self.source_checkout_roots) or
                len(set(self.source_checkout_roots)) != len(self.source_checkout_roots)):
            raise ValueError("Scenario source checkout roots must be unique sibling names: " + self.name)

def instance_area(owner):
    return owner.removeprefix('scenarios_') if owner in ISOLATED_AREAS else 'main'


@dataclass
class Result:
    scenario: str
    engine: str
    status: str
    duration: float
    error: str = ''
    evidence_paths: list = field(default_factory=list)
    features: tuple = ()

    owner: str = "scenarios"
    blocked_by: list = field(default_factory=list)
    failure_roots: list = field(default_factory=list)

    def as_dict(self):
        return asdict(self)


def aggregate(results):
    counts = {'passed': 0, 'failed': 0, 'skipped': 0}
    for result in results:
        status = result.status
        if status.startswith('skipped: '):
            counts['skipped'] += 1
        elif status in ('passed', 'failed'):
            counts[status] += 1
        else:
            raise ValueError('Invalid result status: ' + status)
    return {**counts, 'exit_code': int(counts['failed'] > 0)}


def load_registry(directory):
    """Concatenate REGISTRY from scenarios.py and every scenarios_*.py module in name order."""
    import importlib
    names = ['scenarios'] + sorted(p.stem for p in Path(directory).glob('scenarios_*.py'))
    registry, seen = [], set()
    for name in names:
        for scenario in importlib.import_module(name).REGISTRY:
            if scenario.name in seen:
                raise ValueError('Duplicate scenario: ' + scenario.name)
            seen.add(scenario.name)
            registry.append(replace(scenario, owner=name))
    return registry


def tier_includes(tier, declared_tier, guarded):
    if tier not in ('quick', 'full', 'regression', 'chat'):
        raise ValueError('Unknown tier: ' + tier)
    return ((tier == 'chat' and declared_tier == 'chat') or
            (declared_tier != 'chat' and (tier == 'full' or (tier == 'quick' and declared_tier == 'quick') or
                                        (tier == 'regression' and bool(guarded)))))


def requested_scenarios(registry, tier, names):
    tier_includes(tier, '', False)
    return set(names) if names else {s.name for s in registry if tier_includes(tier, s.tier, s.issues)}


def select_scenarios(registry, tier, names):
    index = {scenario.name: scenario for scenario in registry}
    wanted = requested_scenarios(registry, tier, names)
    unknown = wanted - index.keys()
    if unknown:
        raise ValueError('Unknown scenario: ' + ', '.join(sorted(unknown)))
    def include(name, visiting):
        if name in visiting:
            raise ValueError('Scenario dependency cycle: ' + name)
        for dependency in index[name].requires:
            include(dependency, visiting | {name})
            wanted.add(dependency)
    for name in tuple(wanted):
        include(name, set())
    return [scenario for scenario in registry if scenario.name in wanted]


def invalidate_outcomes(registry, outcomes, names):
    invalid = set(names)
    while True:
        expanded = invalid | {s.name for s in registry if invalid.intersection(s.requires)}
        if expanded == invalid:
            break
        invalid = expanded
    for name in invalid:
        outcomes.pop(name, None)


def select_attached(registry, tier, names, outcomes):
    chosen = select_scenarios(registry, tier, names)
    requested = requested_scenarios(registry, tier, names)
    needed = set()
    index = {s.name: s for s in registry}
    def include(name):
        if name in needed:
            return
        needed.add(name)
        for dependency in index[name].requires:
            if dependency not in outcomes or outcomes[dependency].status != 'passed' or dependency in requested:
                include(dependency)
    for name in requested:
        include(name)
    return [s for s in chosen if s.name in needed]


def parallel_resources(scenario):
    if scenario.parallel:
        return scenario.parallel
    if scenario.owner == 'scenarios_crm_chestor' and re.fullmatch(
            r'northwind_(graph|roadmap|database)_(root|folder)', scenario.name):
        return (scenario.name,)
    return ()


def scenario_area(scenario):
    claims = [claim for claim in parallel_resources(scenario) if claim.startswith('instance:')]
    if len(claims) > 1:
        raise ValueError('Scenario claims more than one fixture instance: ' + scenario.name)
    return claims[0] if claims else instance_area(scenario.owner)


def schedule(selected, run, outcomes, workers=1, completed=None):
    """Run ready scenarios; empty claims require exclusive instance access."""
    if workers < 1:
        raise ValueError('Workers must be positive')
    pending, active, results = list(selected), {}, {}
    with ThreadPoolExecutor(max_workers=workers) as executor:
        while pending or active:
            for scenario in list(pending):
                if len(active) >= workers:
                    break
                if any(name not in outcomes for name in scenario.requires):
                    continue
                claims = parallel_resources(scenario)
                area = scenario_area(scenario)
                occupied = [parallel_resources(s) for s in active.values()
                            if scenario_area(s) == area]
                if occupied and (not claims or any(not other or set(claims).intersection(other) for other in occupied)):
                    continue
                active[executor.submit(run, scenario)] = scenario
                pending.remove(scenario)
            if not active:
                raise ValueError('Unresolved scenario prerequisites: ' + ', '.join(s.name for s in pending))
            finished, _ = wait(active, return_when=FIRST_COMPLETED)
            for future in finished:
                scenario = active.pop(future)
                result = future.result()
                results[scenario.name] = outcomes[scenario.name] = result
                if completed:
                    completed(result)
    return [results[s.name] for s in selected]


class Cleanup:
    def __init__(self):
        self.callbacks = []
        self.scopes = {}
        self.lock = threading.RLock()

    def add(self, name, callback, *, scope='instance'):
        with self.lock:
            self.callbacks.append((name, callback))
            self.scopes[callback] = (scope, threading.get_ident())
        return callback

    def remove(self, callback):
        with self.lock:
            self.callbacks = [(name, fn) for name, fn in self.callbacks if fn != callback]
            self.scopes.pop(callback, None)

    def run(self, *, scope=None):
        errors = []
        with self.lock:
            selected = [(name, fn) for name, fn in reversed(self.callbacks)
                        if scope is None or self.scopes[fn] == (scope, threading.get_ident())]
            for _, callback in selected:
                self.remove(callback)
        for name, callback in selected:
            try:
                callback()
            except Exception as error:
                errors.append(f'{name}: {type(error).__name__}: {error}')
        return errors


class Redactor:
    private = re.compile(r'(?:token|secret|password|api[_-]?key|authorization|base[_-]?url|history_dsn)', re.I)

    def __init__(self, secrets=(), endpoints=()):
        self.secrets = set()
        self.pattern = None
        self.lock = threading.Lock()
        for value in secrets:
            self.add(value)
        for endpoint in endpoints:
            self.add(endpoint)
            self.add(urlsplit(endpoint).hostname)

    def add(self, value):
        if isinstance(value, str) and value:
            variants = {value, quote(value, safe=''), json.dumps(value)[1:-1]}
            with self.lock:
                if variants <= self.secrets:
                    return
                self.secrets |= variants
                self.pattern = re.compile('|'.join(re.escape(secret) for secret in sorted(self.secrets, key=len, reverse=True)))

    def text(self, value):
        value = str(value)
        return self._text(value, self.pattern)

    def _text(self, value, pattern):
        result = value
        if pattern is not None:
            result = pattern.sub(lambda match: '[redacted]', result)
        result = re.sub(r'(?i)((?:[?&]|\b)(?:x-auth-token|token|api_key|password)=)[^&\s\"\']+', r'\1[redacted]', result)
        result = re.sub(r'(?i)(Bearer\s+)[^\s\"\']+', r'\1[redacted]', result)
        result = re.sub(r'(?i)("(?:token|secret|password|api[_-]?key|authorization|base[_-]?url|history_dsn)"\s*:\s*")[^"]*', r'\1[redacted]', result)
        result = re.sub(r'\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+', '[redacted]', result)
        result = re.sub(r'(?i)(postgres(?:ql)?://)[^@\s]+@', r'\1[redacted]@', result)
        return result

    def collect(self, value):
        if isinstance(value, dict):
            for key, nested in value.items():
                if self.private.search(str(key)):
                    self.add(nested)
                self.collect(nested)
        elif isinstance(value, (tuple, list)):
            for nested in value:
                self.collect(nested)

    def value(self, value):
        self.collect(value)
        pattern = self.pattern
        def render(item):
            if isinstance(item, dict):
                return {str(key): '[redacted]' if self.private.search(str(key)) else render(nested)
                        for key, nested in item.items()}
            if isinstance(item, (tuple, list)):
                return [render(nested) for nested in item]
            return self._text(item, pattern) if isinstance(item, str) else item
        return render(value)


def validate_run_root(root):
    root = root.expanduser().resolve()
    if root == Path('/') or root.is_relative_to(Path('/') / 'tmp') or root.is_relative_to(Path('/') / 'var/tmp'):
        raise ValueError('Run root cannot use the system temporary directory')
    existing = root
    while not existing.exists():
        existing = existing.parent
    check = subprocess.run(['git', '-C', str(existing), 'rev-parse', '--show-toplevel'],
                           capture_output=True, text=True, timeout=10)
    if check.returncode == 0:
        raise ValueError('Run root must be outside a git repository')
    if check.returncode != 128 or 'not a git repository' not in check.stderr:
        raise ValueError('Cannot validate run root: ' + check.stderr)
    return root


class ReceiptRecords:
    """Publish copies of worker-owned records and expose independent snapshots."""
    def __init__(self):
        self.records = {}
        self.lock = threading.Lock()

    def publish(self, key, record):
        snapshot = copy.deepcopy(record)
        with self.lock:
            self.records[key] = snapshot

    def snapshot(self):
        with self.lock:
            return copy.deepcopy(list(self.records.values()))


class Evidence:
    def __init__(self, root, redactor):
        self.root, self.redactor = root, redactor
        self.local = threading.local()

    @property
    def paths(self):
        if not hasattr(self.local, 'paths'):
            self.local.paths = []
        return self.local.paths

    @property
    def label(self):
        return getattr(self.local, 'label', 'setup')

    @label.setter
    def label(self, value):
        self.local.label = value

    def save(self, label, value):
        path = self.root / self.label / (label + '.json')
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(self.redactor.value(value), indent=2, default=str) + '\n')
        self.paths.append(str(path))
        return path
