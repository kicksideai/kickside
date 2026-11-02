package main

import (
	"encoding/json"
	"errors"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"testing"
)

func launcherFixture(t *testing.T) (string, string, string) {
	t.Helper()
	bundle, volume := t.TempDir(), t.TempDir()
	dependency := []byte("locked dependency")
	hash := checksum(dependency)[len("sha256:"):]
	name := ".wippy/vendor/kickside/core-0.3.4.sha256-" + hash + ".wapp"
	files := map[string][]byte{"wippy.lock": []byte("frozen lock"), "runtime.json": []byte("{}"), "kickside.wapp": []byte("application"), name: dependency}
	manifest := deploymentManifest{Format: bundleFormat, LockDigest: checksum(files["wippy.lock"]), ConfigDigest: checksum(files["runtime.json"]),
		SnapshotDigest: checksum(files["kickside.wapp"]), Dependencies: []dependencyFile{{Path: name, SHA256: hash}}}
	raw, err := json.Marshal(manifest)
	if err != nil {
		t.Fatal(err)
	}
	files["deployment-manifest.json"] = raw
	for name, data := range files {
		if err := os.MkdirAll(filepath.Dir(filepath.Join(bundle, name)), 0700); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(filepath.Join(bundle, name), data, 0400); err != nil {
			t.Fatal(err)
		}
	}
	return bundle, volume, name
}

func TestPrepareOfflineWorkspaceConcurrentRestart(t *testing.T) {
	bundle, volume, dependency := launcherFixture(t)
	var wait sync.WaitGroup
	for range 4 {
		wait.Go(func() {
			workspace, err := prepareWorkspace(bundle, volume)
			if err != nil {
				t.Error(err)
				return
			}
			if err := verifyWorkspace(workspace, bundle); err != nil {
				t.Error(err)
			}
		})
	}
	wait.Wait()
	workspace, err := prepareWorkspace(bundle, volume)
	if err != nil {
		t.Fatal(err)
	}
	if err := os.Chmod(filepath.Join(workspace, dependency), 0600); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(workspace, dependency), []byte("changed"), 0600); err != nil {
		t.Fatal(err)
	}
	if _, err := prepareWorkspace(bundle, volume); err == nil {
		t.Fatal("changed persisted artifacts must fail verification")
	}
}

func TestPrepareOfflineWorkspaceRejectsSourceTampering(t *testing.T) {
	bundle, volume, _ := launcherFixture(t)
	if err := os.Chmod(filepath.Join(bundle, "wippy.lock"), 0600); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(bundle, "wippy.lock"), []byte("changed"), 0600); err != nil {
		t.Fatal(err)
	}
	if _, err := prepareWorkspace(bundle, volume); err == nil {
		t.Fatal("changed lock must fail verification")
	}
}

func TestPrepareOfflineWorkspaceRejectsVolumeEscape(t *testing.T) {
	bundle, volume, _ := launcherFixture(t)
	outside := t.TempDir()
	if err := os.Symlink(outside, filepath.Join(volume, ".wippy")); err != nil {
		t.Fatal(err)
	}
	if _, err := prepareWorkspace(bundle, volume); err == nil {
		t.Fatal("workspace must stay on the application volume")
	}
	entries, err := os.ReadDir(outside)
	if err != nil || len(entries) != 0 {
		t.Fatal("foreign directory was changed")
	}
}

func TestPrepareOfflineWorkspaceRejectsUnfrozenEntries(t *testing.T) {
	for _, name := range []string{"src/unfrozen.yaml", ".wippy/vendor/kickside/unfrozen.wapp", ".wippy/extra.yaml"} {
		t.Run(name, func(t *testing.T) {
			bundle, volume, _ := launcherFixture(t)
			workspace, err := prepareWorkspace(bundle, volume)
			if err != nil {
				t.Fatal(err)
			}
			if err = os.WriteFile(filepath.Join(workspace, name), []byte("foreign"), 0600); err != nil {
				t.Fatal(err)
			}
			if _, err = prepareWorkspace(bundle, volume); err == nil {
				t.Fatal("unfrozen entries must fail verification")
			}
		})
	}
}

func TestPrepareOfflineWorkspaceRejectsInternalRedirect(t *testing.T) {
	bundle, volume, _ := launcherFixture(t)
	other := filepath.Join(volume, "other-data")
	if err := os.Mkdir(other, 0700); err != nil {
		t.Fatal(err)
	}
	if err := os.Symlink("other-data", filepath.Join(volume, ".wippy")); err != nil {
		t.Fatal(err)
	}
	if _, err := prepareWorkspace(bundle, volume); err == nil {
		t.Fatal("reserved directories must not redirect to application data")
	}
	entries, err := os.ReadDir(other)
	if err != nil || len(entries) != 0 {
		t.Fatal("unrelated application data was changed")
	}
}

func TestPrepareOfflineWorkspaceRecoversInterruptedPreparation(t *testing.T) {
	bundle, volume, _ := launcherFixture(t)
	raw, err := os.ReadFile(filepath.Join(bundle, "deployment-manifest.json"))
	if err != nil {
		t.Fatal(err)
	}
	stage := filepath.Join(volume, ".wippy/deployments", strings.TrimPrefix(checksum(raw), "sha256:")+".prepare")
	if err = os.MkdirAll(stage, 0700); err != nil {
		t.Fatal(err)
	}
	if err = os.WriteFile(filepath.Join(stage, "partial"), []byte("interrupted"), 0600); err != nil {
		t.Fatal(err)
	}
	if _, err = prepareWorkspace(bundle, volume); err != nil {
		t.Fatal(err)
	}
	if _, err = os.Lstat(stage); !errors.Is(err, os.ErrNotExist) {
		t.Fatal("interrupted preparation must be removed")
	}
}

func TestRestartDiscardsUnverifiedCompiledCache(t *testing.T) {
	volume := t.TempDir()
	const identity = "a1111111-1111-1111-1111-111111111111"
	cache, guard, err := preparePodCache(volume, identity)
	if err != nil {
		t.Fatal(err)
	}
	if err = os.WriteFile(filepath.Join(cache, "unverified"), []byte("compiled code"), 0600); err != nil {
		t.Fatal(err)
	}
	if err = guard.Close(); err != nil {
		t.Fatal(err)
	}
	_, guard, err = preparePodCache(volume, identity)
	if err != nil {
		t.Fatal(err)
	}
	defer guard.Close()
	entries, err := os.ReadDir(cache)
	if err != nil || len(entries) != 1 || entries[0].Name() != ".owner" {
		t.Fatal("unverified compiled cache must be removed before runtime execution")
	}
}
