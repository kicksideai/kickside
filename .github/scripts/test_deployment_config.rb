# SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0

require 'minitest/autorun'
require_relative 'deployment_config'

class DeploymentConfigTests < Minitest::Test
  def test_published_modules_keep_the_runtime_configuration
    source = "version: '1.0'\nvars:\n  port: 8085\noverride:\n  app:gateway:addr: :${port}\nworkspace:\n  replacements:\n    module/name: ../local\n"
    config = JSON.parse(published_configuration(source))
    assert_equal '1.0', config['version']
    assert_equal 8085, config['vars']['port']
    assert_equal ':${port}', config['override']['app:gateway:addr']
    refute config.key?('workspace')
  end

  def test_multiple_documents_and_non_maps_are_rejected
    assert_raises(RuntimeError) { published_configuration("one\n---\ntwo\n") }
    assert_raises(RuntimeError) { published_configuration("- one\n") }
  end

  def test_aliases_and_object_tags_are_rejected
    assert_raises(Psych::Exception) { published_configuration("a: &config {}\nb: *config\n") }
    assert_raises(Psych::Exception) { published_configuration("a: !ruby/object:Object {}\n") }
  end
end
