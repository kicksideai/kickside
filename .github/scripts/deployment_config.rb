# SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0

require 'yaml'
require 'json'
require_relative 'deployment_filesystems'

def published_configuration(text)
  document = YAML.parse_stream(text)
  raise 'one application config is required' unless document.children.length == 1

  visit = lambda do |node|
    if node.is_a?(Psych::Nodes::Scalar) && node.value.start_with?(':')
      node.tag = 'tag:yaml.org,2002:str'
      node.plain = false
      node.quoted = true
      node.style = Psych::Nodes::Scalar::DOUBLE_QUOTED
    end
    node.children&.each { |child| visit.call(child) }
  end
  visit.call(document)
  config = YAML.safe_load(document.to_yaml, aliases: false)
  raise 'application config must be a map' unless config.is_a?(Hash)

  config.delete('workspace')
  overrides = config.fetch('override', {})
  raise 'application overrides must be a map' unless overrides.is_a?(Hash)
  DeploymentFilesystems::DIRECTORIES.each { |entry, path| overrides[entry + ':directory'] = path }
  overrides['keeper.state:db:file'] = '/data/.wippy/state_reflect.db'
  config['override'] = overrides
  JSON.pretty_generate(config)
end

if $PROGRAM_NAME == __FILE__
  File.write(ARGV.fetch(1), published_configuration(File.read(ARGV.fetch(0))))
end
