"""Order a Hub update batch using the selected modules' declared dependencies."""


def dependent_update_modules(nodes, held):
    modules = {node['module']: node for node in nodes}
    blocked = set(held)
    if blocked - modules.keys():
        raise ValueError('Unknown held module: ' + ', '.join(sorted(blocked - modules.keys())))
    while True:
        consumers = {name for name, node in modules.items()
                     if any(dependency['org'] + '/' + dependency['name'] in blocked
                            for dependency in node['dependencies'])}
        if consumers <= blocked:
            return blocked
        blocked.update(consumers)


def dependency_update_order(nodes):
    modules = {node['module']: node for node in nodes}
    if len(modules) != len(nodes):
        raise ValueError('Duplicate module in Hub update batch')
    pending = {name: {dependency['org'] + '/' + dependency['name']
                      for dependency in node['dependencies']} & modules.keys()
               for name, node in modules.items()}
    ordered = []
    while pending:
        ready = sorted(name for name, dependencies in pending.items() if not dependencies)
        if not ready:
            raise ValueError('Hub update dependency cycle: ' + ', '.join(sorted(pending)))
        ordered.extend(ready)
        for name in ready:
            del pending[name]
        for dependencies in pending.values():
            dependencies.difference_update(ready)
    return ordered
