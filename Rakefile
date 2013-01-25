require 'slim'
require 'rake/sprocketstask'

# Don't wrap each file in a closure.
Tilt::CoffeeScriptTemplate.default_bare = true

# Setup the assets environment.
ASSETS = Sprockets::Environment.new do |e|
  Dir.glob('src/*').each { |p| e.append_path(p) }
  e.register_engine('.slim', Slim::Template)
end

# Define a helper to get an asset path.
module Kernel
  def asset_path(asset)
    ASSETS.find_asset(asset).digest_path
  end
end

# Create the sprocket rake tasks to compile the assets.
Rake::SprocketsTask.new do |t|
  t.environment = ASSETS
  t.output      = "./build"
  t.assets      = %w( index.html application.js application.css )
  t.keep        = 0
end

task :build => [:assets, :clean_assets] do
  `cp build/index-*.html build/index.html`
end

task :default => :build
