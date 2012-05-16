## MongoDB Interactive Tutorial

	cp config/config.sample.yml config/config.yml

On deploy run:

	ruby #{release_path}/deploy/zipit.rb #{release_path}/public/ #{release_path}/deploy/yuicompressor-2.4.2.jar #{release_path}/config/assets.yml
	ruby #{release_path}/deploy/css_buster.rb #{release_path}/public/"

There's probably more, but who knows...