package main

import (
	"errors"
	"os"
	"path/filepath"
	"testing"
	"time"
)

func TestPodCachesDoNotDeleteAnotherLivePodsFiles(t *testing.T) {
	volume := t.TempDir()
	first, guard, err := preparePodCache(volume, "a1111111-1111-1111-1111-111111111111")
	if err != nil {
		t.Fatal(err)
	}
	if err = os.WriteFile(filepath.Join(first, "live"), []byte("active"), 0600); err != nil {
		t.Fatal(err)
	}
	second, other, err := preparePodCache(volume, "b2222222-2222-2222-2222-222222222222")
	if err != nil {
		guard.Close()
		t.Fatal(err)
	}
	defer other.Close()
	if _, err = os.Stat(filepath.Join(first, "live")); err != nil {
		t.Fatal("the live Pod cache was removed")
	}
	if err = guard.Close(); err != nil {
		t.Fatal(err)
	}
	_, last, err := preparePodCache(volume, "c3333333-3333-3333-3333-333333333333")
	if err != nil {
		t.Fatal(err)
	}
	defer last.Close()
	if _, err = os.Stat(first); !errors.Is(err, os.ErrNotExist) {
		t.Fatal("the inactive owned cache was not removed")
	}
	if _, err = os.Stat(second); err != nil {
		t.Fatal("the other live cache was removed")
	}
}

func TestSamePodRestartWaitsForPreviousRuntime(t *testing.T) {
	volume := t.TempDir()
	const identity = "a1111111-1111-1111-1111-111111111111"
	cache, guard, err := preparePodCache(volume, identity)
	if err != nil {
		t.Fatal(err)
	}
	if err = os.WriteFile(filepath.Join(cache, "live"), []byte("active"), 0600); err != nil {
		t.Fatal(err)
	}
	finished := make(chan error, 1)
	go func() {
		_, next, nextErr := preparePodCache(volume, identity)
		if nextErr == nil {
			nextErr = next.Close()
		}
		finished <- nextErr
	}()
	select {
	case <-finished:
		guard.Close()
		t.Fatal("a second runtime changed the active Pod cache")
	case <-time.After(30 * time.Millisecond):
	}
	if _, err = os.Stat(filepath.Join(cache, "live")); err != nil {
		t.Fatal("the active cache was changed")
	}
	if err = guard.Close(); err != nil {
		t.Fatal(err)
	}
	select {
	case err = <-finished:
		if err != nil {
			t.Fatal(err)
		}
	case <-time.After(5 * time.Second):
		t.Fatal("the restarted runtime did not acquire its cache")
	}
}

func TestPodCacheRecoversInterruptedMarkerWrite(t *testing.T) {
	volume := t.TempDir()
	const identity = "a1111111-1111-1111-1111-111111111111"
	cache, guard, err := preparePodCache(volume, identity)
	if err != nil {
		t.Fatal(err)
	}
	if err = os.Chmod(filepath.Join(cache, ".owner"), 0600); err != nil {
		t.Fatal(err)
	}
	if err = os.WriteFile(filepath.Join(cache, ".owner"), []byte(identity[:8]), 0600); err != nil {
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
}
