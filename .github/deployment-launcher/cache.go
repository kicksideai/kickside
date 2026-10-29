package main

import (
	"errors"
	"io"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"syscall"
)

var podIdentity = regexp.MustCompile(`^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$`)

func preparePodCache(volume, identity string) (string, *os.File, error) {
	if !podIdentity.MatchString(identity) {
		return "", nil, errors.New("the namespace Pod identity is required")
	}
	data, err := os.OpenRoot(volume)
	if err != nil {
		return "", nil, err
	}
	defer data.Close()
	modules, err := privateDirectory(data, ".wippy")
	if err != nil {
		return "", nil, err
	}
	defer modules.Close()
	caches, err := privateDirectory(modules, "caches")
	if err != nil {
		return "", nil, err
	}
	defer caches.Close()
	guard, err := preparationGuard(caches, "."+identity+".lock")
	if err != nil {
		return "", nil, err
	}
	transferred := false
	defer func() {
		if !transferred {
			guard.Close()
		}
	}()
	if err = syscall.Flock(int(guard.Fd()), syscall.LOCK_EX); err != nil {
		return "", nil, err
	}
	if err = pruneInactiveCaches(caches, identity); err != nil {
		return "", nil, err
	}
	if info, statErr := caches.Lstat(identity); statErr == nil {
		if !info.IsDir() {
			return "", nil, errors.New("the Pod cache is not a directory")
		}
		if err = verifyCacheOwner(caches, identity); err != nil {
			return "", nil, err
		}
	} else if !errors.Is(statErr, os.ErrNotExist) {
		return "", nil, statErr
	}
	if err = caches.RemoveAll(identity); err != nil {
		return "", nil, err
	}
	if err = caches.Mkdir(identity, 0700); err != nil {
		return "", nil, err
	}
	root, err := caches.OpenRoot(identity)
	if err != nil {
		return "", nil, err
	}
	file, err := root.OpenFile(".owner", os.O_CREATE|os.O_EXCL|os.O_WRONLY, 0400)
	if err == nil {
		_, err = file.Write([]byte(identity))
		if err == nil {
			err = file.Sync()
		}
		err = errors.Join(err, file.Close())
	}
	if err == nil {
		err = syncDirectory(root, ".")
	}
	root.Close()
	if err != nil {
		return "", nil, err
	}
	if err = guard.Sync(); err != nil {
		return "", nil, err
	}
	if err = syncDirectory(caches, "."); err != nil {
		return "", nil, err
	}
	transferred = true
	return filepath.Join(volume, ".wippy/caches", identity), guard, nil
}

func verifyCacheOwner(caches *os.Root, identity string) error {
	cache, err := caches.OpenRoot(identity)
	if err != nil {
		return err
	}
	defer cache.Close()
	if err = verifyFile(cache, ".owner", checksum([]byte(identity))); err == nil {
		return nil
	}
	directory, openErr := cache.Open(".")
	if openErr != nil {
		return openErr
	}
	defer directory.Close()
	entries, readErr := directory.ReadDir(2)
	if readErr != nil && !errors.Is(readErr, io.EOF) {
		return readErr
	}
	if len(entries) == 0 {
		return nil
	}
	if len(entries) == 1 && entries[0].Name() == ".owner" && entries[0].Type().IsRegular() {
		info, statErr := cache.Stat(".owner")
		if statErr != nil {
			return statErr
		}
		if info.Size() < int64(len(identity)) {
			data, readErr := cache.ReadFile(".owner")
			if readErr == nil && strings.HasPrefix(identity, string(data)) {
				return nil
			}
		}
	}
	return err
}

func pruneInactiveCaches(caches *os.Root, current string) error {
	directory, err := caches.Open(".")
	if err != nil {
		return err
	}
	defer directory.Close()
	for {
		entries, readErr := directory.ReadDir(128)
		if readErr != nil && !errors.Is(readErr, io.EOF) {
			return readErr
		}
		for _, entry := range entries {
			identity := entry.Name()
			if identity == current || !podIdentity.MatchString(identity) {
				continue
			}
			if !entry.IsDir() {
				return errors.New("an inactive cache is not a directory")
			}
			if err = prunePodCache(caches, identity); err != nil {
				return err
			}
		}
		if errors.Is(readErr, io.EOF) {
			return nil
		}
	}
}

func prunePodCache(caches *os.Root, identity string) error {
	name := "." + identity + ".lock"
	info, err := caches.Lstat(name)
	if err != nil || !info.Mode().IsRegular() {
		return errors.New("an inactive cache has no ownership guard")
	}
	guard, err := preparationGuard(caches, name)
	if err != nil {
		return err
	}
	defer guard.Close()
	if err = syscall.Flock(int(guard.Fd()), syscall.LOCK_EX|syscall.LOCK_NB); err != nil {
		if errors.Is(err, syscall.EWOULDBLOCK) || errors.Is(err, syscall.EAGAIN) {
			return nil
		}
		return err
	}
	if _, err = caches.Lstat(identity); errors.Is(err, os.ErrNotExist) {
		return nil
	}
	if err = verifyCacheOwner(caches, identity); err != nil {
		return err
	}
	return caches.RemoveAll(identity)
}
