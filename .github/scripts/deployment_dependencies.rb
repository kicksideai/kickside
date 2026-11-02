require 'yaml'
require 'json'
require 'digest'

root = File.realpath(ARGV.fetch(0))
lock = YAML.safe_load(File.read(File.join(root, 'wippy.lock')), aliases: false)
raise 'local replacements are not allowed' unless Array(lock['replacements']).empty?
modules = lock.fetch('modules')
raise 'dependency count is invalid' unless modules.length.between?(1, 1024)
seen = {}
files = modules.map do |mod|
  name, version = mod.fetch('name'), mod.fetch('version')
  hash = mod.fetch('hash').delete_prefix('sha256:')
  raise 'dependency identity is invalid' unless name.match?(%r{\A[a-z0-9][a-z0-9_-]*/[a-z0-9][a-z0-9_-]*\z}) &&
    version.match?(/\A[0-9]+\.[0-9]+\.[0-9]+(?:[-+][0-9A-Za-z.-]+)?\z/) && hash.match?(/\A[0-9a-f]{64}\z/)
  raise 'duplicate dependency' if seen[name]
  seen[name] = true
  path = ".wippy/vendor/#{name}-#{version}.wapp"
  source = File.join(root, path)
  raise 'dependency must be a regular file' unless File.file?(source) && !File.symlink?(source)
  raise 'dependency digest differs from the lock' unless Digest::SHA256.file(source).hexdigest == hash
  { 'source' => path, 'path' => ".wippy/vendor/#{name}-#{version}.sha256-#{hash}.wapp", 'sha256' => hash }
end
snapshot = File.binread(ARGV.fetch(2))
version = File.read(File.join(root, 'version.txt')).strip
raise 'application version is invalid' unless version.match?(/\A[0-9]+\.[0-9]+\.[0-9]+\z/)
hash = Digest::SHA256.hexdigest(snapshot)
raise 'the application cannot be its own dependency' if seen['kickside/kickside']
lock.fetch('modules') << { 'name' => 'kickside/kickside', 'version' => version, 'hash' => hash, 'root' => true }
lock['modules'].sort_by! { |mod| mod.fetch('name') }
files << { 'source' => 'kickside.wapp', 'path' => ".wippy/vendor/kickside/kickside-#{version}.sha256-#{hash}.wapp", 'sha256' => hash }
File.write(ARGV.fetch(1), JSON.generate(files.sort_by { |file| file.fetch('path') }))
lock.fetch('directories')['src'] = './src'
File.write(File.join(root, 'wippy.lock'), YAML.dump(lock))
