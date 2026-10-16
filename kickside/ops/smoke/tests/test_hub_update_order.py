import unittest

from hub_update_order import dependency_update_order, dependent_update_modules


def node(module, *dependencies):
    return {'module': module, 'dependencies': [
        dict(zip(('org', 'name'), dependency.split('/'))) for dependency in dependencies]}


class HubUpdateOrderTests(unittest.TestCase):
    def test_dependencies_precede_consumers_across_namespaces(self):
        nodes = [node('example/consumer', 'shared/service'),
                 node('shared/service', 'example/foundation'), node('example/foundation')]
        self.assertEqual(dependency_update_order(nodes),
                         ['example/foundation', 'shared/service', 'example/consumer'])

    def test_unmodified_dependencies_do_not_enter_the_update_batch(self):
        self.assertEqual(dependency_update_order([node('example/app', 'upstream/api')]), ['example/app'])

    def test_unrelated_modules_have_a_stable_order(self):
        self.assertEqual(dependency_update_order([node('example/z'), node('example/a')]),
                         ['example/a', 'example/z'])

    def test_cycles_fail_before_any_install(self):
        with self.assertRaisesRegex(ValueError, 'cycle.*example/a.*example/b'):
            dependency_update_order([node('example/a', 'example/b'), node('example/b', 'example/a')])

    def test_duplicate_module_nodes_fail(self):
        with self.assertRaisesRegex(ValueError, 'Duplicate'):
            dependency_update_order([node('example/a'), node('example/a')])

    def test_held_modules_hold_every_transitive_consumer(self):
        nodes = [node('example/consumer', 'shared/service'),
                 node('shared/service', 'example/foundation'), node('example/foundation'),
                 node('example/independent')]
        self.assertEqual(dependent_update_modules(nodes, {'example/foundation'}),
                         {'example/foundation', 'shared/service', 'example/consumer'})

    def test_unknown_held_module_fails(self):
        with self.assertRaisesRegex(ValueError, 'Unknown'):
            dependent_update_modules([node('example/a')], {'example/b'})
