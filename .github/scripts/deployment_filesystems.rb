module DeploymentFilesystems
  DIRECTORIES = {
    'app:data_dir' => '/data/.wippy',
    'app:uploads' => '/data/.wippy/uploads',
    'app:branding_fs' => '/data/.wippy/branding',
    'app:tmp' => '/data/.wippy/tmp',
    'keeper.components:fe_fs' => '/data/project/frontend',
    'keeper.components:previews_fs' => '/data/project/static/public/previews',
    'keeper.components:project_fs' => '/data/project',
    'keeper.components:pw_runtime_fs' => '/data/.wippy/fe-playwright-runtime',
    'keeper.components:siblings_fs' => '/data',
    'keeper.components:staging_fs' => '/data/.wippy/fe-sessions',
    'keeper.gov:source_fs' => '/data/project/src',
    'kickside.ui:legacy_branding_fs' => '/data/.wippy/branding'
  }.freeze

  def self.verify_inventory(text)
    entries = text.lines.map { |line| line.match(/^\s+\S+\s+([a-z0-9_.-]+:[a-z0-9_.-]+)\s*$/)&.captures&.first }.compact
    raise 'application directories differ from the supported layout' unless entries.sort == (DIRECTORIES.keys + ['app:app_fs']).sort
  end
end

DeploymentFilesystems.verify_inventory(File.read(ARGV.fetch(0))) if $PROGRAM_NAME == __FILE__
