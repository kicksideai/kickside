package main

import (
	"bytes"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"io/fs"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"syscall"
)

const bundleFormat = "kickside-deployment-bundle-v2"
const maximumFileBytes int64 = 256 << 20

var dependencyPath = regexp.MustCompile(`^\.wippy/vendor/[a-z0-9][a-z0-9_-]*/[a-z0-9][a-z0-9_.+-]*\.sha256-[0-9a-f]{64}\.wapp$`)
var digestPattern = regexp.MustCompile(`^sha256:[0-9a-f]{64}$`)

type dependencyFile struct {
	Path   string `json:"path"`
	SHA256 string `json:"sha256"`
}

type deploymentManifest struct {
	Format         string           `json:"format"`
	LockDigest     string           `json:"lock_digest"`
	ConfigDigest   string           `json:"config_digest"`
	SnapshotDigest string           `json:"snapshot_digest"`
	RuntimeDigest  string           `json:"runtime_digest"`
	LauncherDigest string           `json:"launcher_digest"`
	Dependencies   []dependencyFile `json:"dependencies"`
}

func main() {
	if err := launch(); err != nil {
		fmt.Fprintln(os.Stderr, "deployment workspace:", err)
		os.Exit(1)
	}
}

func launch() error {
	if len(os.Args) < 2 || os.Args[1] != "run" {
		return errors.New("the fixed runtime command is required")
	}
	root, err := os.OpenRoot("/app")
	if err != nil {
		return err
	}
	manifest, _, err := readManifest(root)
	if err == nil {
		err = verifyFile(root, "kickside-launch", manifest.LauncherDigest)
	}
	root.Close()
	if err != nil {
		return err
	}
	binary, err := os.OpenRoot("/usr/local/bin")
	if err != nil {
		return err
	}
	err = verifyFile(binary, "wippy", manifest.RuntimeDigest)
	binary.Close()
	if err != nil {
		return err
	}
	workspace, err := prepareWorkspace("/app", "/data")
	if err != nil {
		return err
	}
	if err = os.Chdir(workspace); err != nil {
		return err
	}
	cache, guard, err := preparePodCache("/data", os.Getenv("WIPPY_POD_UID"))
	if err != nil {
		return err
	}
	defer guard.Close()
	if _, _, code := syscall.Syscall(syscall.SYS_FCNTL, guard.Fd(), syscall.F_SETFD, 0); code != 0 {
		return code
	}
	if err = os.Setenv("WIPPY_CACHE_DIR", cache); err != nil {
		return err
	}
	arguments := []string{"wippy", "run", "--config", filepath.Join(workspace, ".wippy.yaml")}
	arguments = append(arguments, os.Args[2:]...)
	return syscall.Exec("/usr/local/bin/wippy", arguments, os.Environ())
}

func checksum(data []byte) string {
	sum := sha256.Sum256(data)
	return "sha256:" + hex.EncodeToString(sum[:])
}

func readManifest(root *os.Root) (deploymentManifest, []byte, error) {
	var manifest deploymentManifest
	file, err := root.Open("deployment-manifest.json")
	if err != nil {
		return manifest, nil, err
	}
	defer file.Close()
	raw, err := io.ReadAll(io.LimitReader(file, (64<<10)+1))
	if err != nil || len(raw) > 64<<10 {
		return manifest, nil, errors.New("the deployment manifest exceeds its limit")
	}
	decoder := json.NewDecoder(bytes.NewReader(raw))
	if decoder.Decode(&manifest) != nil || decoder.Decode(new(any)) != io.EOF || manifest.Format != bundleFormat ||
		!digestPattern.MatchString(manifest.LockDigest) || !digestPattern.MatchString(manifest.ConfigDigest) ||
		!digestPattern.MatchString(manifest.SnapshotDigest) || len(manifest.Dependencies) < 1 || len(manifest.Dependencies) > 1024 {
		return manifest, nil, errors.New("the deployment manifest is invalid")
	}
	previous := ""
	for _, dependency := range manifest.Dependencies {
		if !dependencyPath.MatchString(dependency.Path) || dependency.Path <= previous || !digestPattern.MatchString("sha256:"+dependency.SHA256) ||
			!strings.HasSuffix(dependency.Path, ".sha256-"+dependency.SHA256+".wapp") {
			return manifest, nil, errors.New("the dependency identity is invalid")
		}
		previous = dependency.Path
	}
	return manifest, raw, nil
}

func prepareWorkspace(bundle, volume string) (string, error) {
	source, err := os.OpenRoot(bundle)
	if err != nil {
		return "", err
	}
	defer source.Close()
	manifest, raw, err := readManifest(source)
	if err != nil {
		return "", err
	}
	data, err := os.OpenRoot(volume)
	if err != nil {
		return "", err
	}
	defer data.Close()
	const directory = ".wippy/deployments"
	private, err := privateDirectory(data, ".wippy")
	if err != nil {
		return "", err
	}
	defer private.Close()
	parent, err := privateDirectory(private, "deployments")
	if err != nil {
		return "", err
	}
	defer parent.Close()
	identity := strings.TrimPrefix(checksum(raw), "sha256:")
	guard, err := preparationGuard(parent, "."+identity+".lock")
	if err != nil {
		return "", err
	}
	defer guard.Close()
	if err = syscall.Flock(int(guard.Fd()), syscall.LOCK_EX); err != nil {
		return "", err
	}
	destination := filepath.Join(volume, directory, identity)
	if _, err = parent.Lstat(identity); err == nil {
		if err = verifyPrepared(parent, identity, source, manifest, raw); err != nil {
			return "", err
		}
		return destination, syncDirectory(parent, ".")
	} else if !errors.Is(err, os.ErrNotExist) {
		return "", err
	}
	stage := identity + ".prepare"
	if err = parent.RemoveAll(stage); err != nil {
		return "", err
	}
	if err = parent.Mkdir(stage, 0700); err != nil {
		return "", err
	}
	defer parent.RemoveAll(stage)
	workspace, err := parent.OpenRoot(stage)
	if err != nil {
		return "", err
	}
	err = populateWorkspace(workspace, source, manifest, raw)
	if err == nil {
		err = syncWorkspace(workspace)
	}
	workspace.Close()
	if err != nil {
		return "", err
	}
	if err = syncDirectory(parent, "."); err != nil {
		return "", err
	}
	if err = parent.Rename(stage, identity); err != nil {
		if verifyErr := verifyPrepared(parent, identity, source, manifest, raw); verifyErr != nil {
			return "", verifyErr
		}
	}
	return destination, syncDirectory(parent, ".")
}

func preparationGuard(parent *os.Root, name string) (*os.File, error) {
	file, err := parent.OpenFile(name, os.O_CREATE|os.O_EXCL|os.O_RDWR, 0600)
	if err == nil {
		return file, nil
	}
	if !errors.Is(err, os.ErrExist) {
		return nil, err
	}
	info, err := parent.Lstat(name)
	if err != nil {
		return nil, err
	}
	if !info.Mode().IsRegular() {
		return nil, errors.New("the preparation guard is not a regular file")
	}
	file, err = parent.OpenFile(name, os.O_RDWR, 0600)
	if err != nil {
		return nil, err
	}
	actual, err := file.Stat()
	if err != nil || !os.SameFile(info, actual) {
		file.Close()
		return nil, errors.New("the preparation guard changed during preparation")
	}
	return file, nil
}

func privateDirectory(parent *os.Root, name string) (*os.Root, error) {
	info, err := parent.Lstat(name)
	if errors.Is(err, os.ErrNotExist) {
		if mkdirErr := parent.Mkdir(name, 0700); mkdirErr != nil && !errors.Is(mkdirErr, os.ErrExist) {
			return nil, mkdirErr
		}
		info, err = parent.Lstat(name)
	}
	if err != nil {
		return nil, err
	}
	if !info.IsDir() {
		return nil, errors.New("a reserved directory is not a private directory")
	}
	root, err := parent.OpenRoot(name)
	if err != nil {
		return nil, err
	}
	actual, err := root.Stat(".")
	if err != nil || !os.SameFile(info, actual) {
		root.Close()
		return nil, errors.New("a reserved directory changed during preparation")
	}
	return root, nil
}

func syncDirectory(root *os.Root, name string) error {
	file, err := root.Open(name)
	if err != nil {
		return err
	}
	defer file.Close()
	return file.Sync()
}

func syncWorkspace(root *os.Root) error {
	directories := []string{}
	err := fs.WalkDir(root.FS(), ".", func(name string, entry fs.DirEntry, walkErr error) error {
		if walkErr != nil {
			return walkErr
		}
		if entry.IsDir() {
			directories = append(directories, name)
		}
		return nil
	})
	if err != nil {
		return err
	}
	for index := len(directories) - 1; index >= 0; index-- {
		if err = syncDirectory(root, directories[index]); err != nil {
			return err
		}
	}
	return nil
}

func boundFiles(manifest deploymentManifest) []struct{ source, destination, digest string } {
	files := []struct{ source, destination, digest string }{
		{"wippy.lock", "wippy.lock", manifest.LockDigest},
		{"runtime.json", ".wippy.yaml", manifest.ConfigDigest},
		{"kickside.wapp", "kickside.wapp", manifest.SnapshotDigest},
	}
	for _, dependency := range manifest.Dependencies {
		files = append(files, struct{ source, destination, digest string }{dependency.Path, dependency.Path, "sha256:" + dependency.SHA256})
	}
	return files
}

func populateWorkspace(workspace, source *os.Root, manifest deploymentManifest, raw []byte) error {
	if err := workspace.Mkdir("src", 0700); err != nil {
		return err
	}
	var total int64
	for _, file := range boundFiles(manifest) {
		if err := workspace.MkdirAll(filepath.Dir(file.destination), 0700); err != nil {
			return err
		}
		count, err := copyVerified(workspace, source, file.destination, file.source, file.digest)
		if err != nil {
			return err
		}
		total += count
		if total > 1<<30 {
			return errors.New("the workspace exceeds its limit")
		}
	}
	for _, dependency := range manifest.Dependencies {
		alias := strings.TrimSuffix(dependency.Path, ".sha256-"+dependency.SHA256+".wapp") + ".wapp"
		if err := workspace.Link(dependency.Path, alias); err != nil {
			return err
		}
	}
	file, err := workspace.OpenFile("deployment-manifest.json", os.O_CREATE|os.O_EXCL|os.O_WRONLY, 0400)
	if err != nil {
		return err
	}
	defer file.Close()
	if _, err = file.Write(raw); err != nil {
		return err
	}
	return file.Sync()
}

func copyVerified(workspace, source *os.Root, destination, name, digest string) (int64, error) {
	input, err := source.Open(name)
	if err != nil {
		return 0, err
	}
	defer input.Close()
	output, err := workspace.OpenFile(destination, os.O_CREATE|os.O_EXCL|os.O_WRONLY, 0400)
	if err != nil {
		return 0, err
	}
	hash := sha256.New()
	count, err := io.Copy(io.MultiWriter(output, hash), io.LimitReader(input, maximumFileBytes+1))
	if err != nil {
		output.Close()
		return 0, err
	}
	if count > maximumFileBytes || "sha256:"+hex.EncodeToString(hash.Sum(nil)) != digest {
		output.Close()
		return 0, errors.New("an artifact differs from the frozen deployment")
	}
	syncErr := output.Sync()
	closeErr := output.Close()
	if syncErr != nil || closeErr != nil {
		return 0, errors.Join(syncErr, closeErr)
	}
	return count, nil
}

func verifyFile(root *os.Root, name, digest string) error {
	info, err := root.Lstat(name)
	if err != nil {
		return err
	}
	if !info.Mode().IsRegular() || info.Size() > maximumFileBytes {
		return errors.New("an artifact is not a bounded regular file")
	}
	file, err := root.Open(name)
	if err != nil {
		return err
	}
	defer file.Close()
	hash := sha256.New()
	count, err := io.Copy(hash, io.LimitReader(file, maximumFileBytes+1))
	if err != nil {
		return err
	}
	if count != info.Size() || "sha256:"+hex.EncodeToString(hash.Sum(nil)) != digest {
		return errors.New("an artifact differs from the frozen deployment")
	}
	return nil
}

func verifyPrepared(parent *os.Root, name string, source *os.Root, manifest deploymentManifest, raw []byte) error {
	info, err := parent.Lstat(name)
	if err != nil {
		return err
	}
	if !info.IsDir() {
		return errors.New("the workspace is not an owned directory")
	}
	workspace, err := parent.OpenRoot(name)
	if err != nil {
		return err
	}
	defer workspace.Close()
	if err = verifyWorkspaceLayout(workspace, manifest); err != nil {
		return err
	}
	if err = verifyFile(workspace, "deployment-manifest.json", checksum(raw)); err != nil {
		return err
	}
	for _, file := range boundFiles(manifest) {
		if err = verifyFile(source, file.source, file.digest); err != nil {
			return err
		}
		if err = verifyFile(workspace, file.destination, file.digest); err != nil {
			return err
		}
	}
	for _, dependency := range manifest.Dependencies {
		alias := strings.TrimSuffix(dependency.Path, ".sha256-"+dependency.SHA256+".wapp") + ".wapp"
		if err = verifyFile(workspace, alias, "sha256:"+dependency.SHA256); err != nil {
			return err
		}
	}
	return nil
}

func verifyWorkspaceLayout(root *os.Root, manifest deploymentManifest) error {
	allowed := map[string]bool{".": true, "src": true, "deployment-manifest.json": false,
		"wippy.lock.runtime.lock": false, ".wippy/runtime.lock": false}
	add := func(name string) {
		allowed[name] = false
		for parent := filepath.Dir(name); parent != "."; parent = filepath.Dir(parent) {
			allowed[parent] = true
		}
	}
	for _, file := range boundFiles(manifest) {
		add(file.destination)
	}
	for _, dependency := range manifest.Dependencies {
		add(strings.TrimSuffix(dependency.Path, ".sha256-"+dependency.SHA256+".wapp") + ".wapp")
	}
	return fs.WalkDir(root.FS(), ".", func(name string, entry fs.DirEntry, walkErr error) error {
		if walkErr != nil {
			return walkErr
		}
		directory, exists := allowed[name]
		if !exists || directory != entry.IsDir() || (!directory && !entry.Type().IsRegular()) {
			return fmt.Errorf("the workspace contains an unfrozen entry: %s", name)
		}
		return nil
	})
}

func verifyWorkspace(workspace, bundle string) error {
	source, err := os.OpenRoot(bundle)
	if err != nil {
		return err
	}
	defer source.Close()
	manifest, raw, err := readManifest(source)
	if err != nil {
		return err
	}
	parent, err := os.OpenRoot(filepath.Dir(workspace))
	if err != nil {
		return err
	}
	defer parent.Close()
	return verifyPrepared(parent, filepath.Base(workspace), source, manifest, raw)
}
