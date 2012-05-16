## MongoDB Interactive Tutorial

This is the source code for the MongoDB Interactive Tutorial. Since I no longer plan on hosting it, I pulled what I could and believe this is all that's really needed to get it up and running:

	cp config/config.sample.yml config/config.yml

On deploy run:

	ruby #{release_path}/deploy/zipit.rb #{release_path}/public/ #{release_path}/deploy/yuicompressor-2.4.2.jar #{release_path}/config/assets.yml
	ruby #{release_path}/deploy/css_buster.rb #{release_path}/public/"

There's probably more, but who knows...

Oh, and since this keeps dirty collections around, I suggest you run something like this every now and again:

	require 'mongo'
	connection = Mongo::Connection.new('127.0.0.1', 27017)
	db = connection['learn_1']
	db.collection_names.each do |coll_name|
		id = coll_name.split(/_/)[1]
		next unless BSON::ObjectId.legal?(id)
		if ((Time.now - BSON::ObjectId.from_string(id).generation_time) / 3600).floor > 6
			db.drop_collection(coll_name)
		end
	end