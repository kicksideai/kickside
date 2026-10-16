import threading
import unittest


class BackendTests(unittest.TestCase):
    def test_both_engines_execute_concurrently(self):
        from backend import run_engines
        barrier=threading.Barrier(2,timeout=1)
        def run(engine):
            barrier.wait()
            return engine
        self.assertEqual(run_engines(run), {'sqlite':'sqlite','postgres':'postgres'})

    def test_balancing_covers_every_suite_once_and_places_expensive_work_first(self):
        from backend import balance_suites
        costs={'a':9,'b':7,'c':4,'d':3,'e':2,'f':1}
        plans=balance_suites(list(costs),costs,3)
        self.assertEqual(sorted(item for plan in plans for item in plan),sorted(costs))
        self.assertEqual([sum(costs[item] for item in plan) for plan in plans],[9,9,8])

    def test_database_isolation_includes_every_declared_suffix(self):
        from backend import database_plan
        base={'vars':{'pg_database':'shared'},'profiles':{'postgres':{'override':{
            'app:db:database':'${pg_database}',
            'app:migration:database':'${pg_database}_mig',
            'app:transient_one:database':'${pg_database}_transient',
            'app:transient_two:database':'${pg_database}_transient'}}}}
        variables,names=database_plan(base,'owned_123')
        self.assertEqual(variables,{'pg_database':'owned_123'})
        self.assertEqual(names,['owned_123','owned_123_mig','owned_123_transient'])

    def test_every_harness_repeats_its_ordered_initialization_suite(self):
        from backend import shard_members
        tests={'fixture:init':{'meta':{'suite':'00_setup'}},
               'fixture:first':{'meta':{'suite':'first'}},'fixture:second':{'meta':{'suite':'second'}}}
        plans=shard_members(tests,{},2)
        self.assertEqual(plans,[['fixture:init','fixture:first'],['fixture:init','fixture:second']])

    def test_entries_in_one_suite_share_a_harness(self):
        from backend import shard_members
        tests = {
            'fixture:init': {'meta': {'suite': '00_setup'}},
            'fixture:create': {'meta': {'suite': 'users'}},
            'fixture:read': {'meta': {'suite': 'users'}},
            'fixture:delete': {'meta': {'suite': 'users'}},
            'fixture:independent': {'meta': {'suite': 'independent'}},
        }
        plans = shard_members(tests, {'fixture:create': 4, 'fixture:read': 3,
                                      'fixture:delete': 2, 'fixture:independent': 8}, 4)
        dependent = {'fixture:create', 'fixture:read', 'fixture:delete'}
        self.assertEqual(len(plans), 2)
        self.assertEqual(sum(dependent <= set(plan) for plan in plans), 1)
        self.assertTrue(all('fixture:init' in plan for plan in plans))
        self.assertEqual(sorted(item for plan in plans for item in plan if item != 'fixture:init'),
                         sorted(set(tests) - {'fixture:init'}))

    def test_harness_copy_retains_repository_paths_and_directory_links(self):
        from backend import copy_harness
        from pathlib import Path
        import tempfile
        with tempfile.TemporaryDirectory(dir=Path.cwd() / 'temp') as directory:
            work = Path(directory)
            repository = work / 'repository'
            harness = repository / 'platform/module/test'
            harness.mkdir(parents=True)
            source = repository / 'platform/module/src'
            source.mkdir()
            (source / '_index.yaml').write_text('module declarations')
            (harness / 'src_link').symlink_to('../src', target_is_directory=True)
            static = repository / 'app/static'
            static.mkdir(parents=True)
            (static / 'fixture.txt').write_text('resource')
            (repository / 'node_modules').mkdir()
            copied = copy_harness(harness, repository, work / 'scratch')
            self.assertTrue((copied / 'src_link').is_symlink())
            self.assertEqual((copied / 'src_link/_index.yaml').read_text(), 'module declarations')
            self.assertEqual((copied / '../../../app/static/fixture.txt').read_text(), 'resource')
            self.assertFalse((copied.parents[2] / 'node_modules').exists())

    def test_repository_snapshot_keeps_only_the_selected_harness_runtime_metadata(self):
        from backend import copy_harness
        from pathlib import Path
        import tempfile
        with tempfile.TemporaryDirectory(dir=Path.cwd() / 'temp') as directory:
            work = Path(directory)
            repository = work / 'repository'
            harness = repository / 'module/test'
            harness.mkdir(parents=True)
            (harness / 'wippy.lock').write_text('fresh harness lock')
            (harness / '.wippy.yaml').write_text('harness configuration')
            unrelated = repository / 'other/test'
            unrelated.mkdir(parents=True)
            (unrelated / 'wippy.lock').write_text('concurrent runtime lock')
            (unrelated / 'source.lua').write_text('source for repository guards')
            copied = copy_harness(harness, repository, work / 'scratch')
            self.assertEqual((copied / 'wippy.lock').read_text(), 'fresh harness lock')
            self.assertEqual((copied / '.wippy.yaml').read_text(), 'harness configuration')
            self.assertFalse((copied.parents[1] / 'other/test/wippy.lock').exists())
            self.assertFalse((copied.parents[1] / 'other').is_symlink())
            self.assertEqual((copied.parents[1] / 'other/test/source.lua').read_text(),
                             'source for repository guards')

    def test_harness_snapshot_preserves_relative_sibling_module_paths(self):
        from backend import copy_harness
        from pathlib import Path
        import tempfile
        with tempfile.TemporaryDirectory(dir=Path.cwd() / 'temp') as directory:
            work = Path(directory)
            repository = work / 'providers'
            harness = repository / 'provider/test'
            harness.mkdir(parents=True)
            sibling = work / 'platform/src'
            sibling.mkdir(parents=True)
            (sibling / 'fixture.lua').write_text('sibling module')
            copied = copy_harness(harness, repository, work / 'scratch')
            self.assertEqual((copied / '../../../platform/src/fixture.lua').read_text(), 'sibling module')
