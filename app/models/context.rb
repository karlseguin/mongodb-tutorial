class Context
  attr_accessor :key
  
  def initialize
    @key = BSON::ObjectId.new.to_s
    @@database = Store.connection.db('learn_1')
  end
  
  def to_mongo  
    @@database
  end
  
  def to_collection(name)
    to_mongo.collection(to_real_name(name))
  end
  
  def database_names
    [@key]
  end
  
  def host
    'arrakis'
  end
  
  def collection_names
    ['unicorns']
  end
  
  def real_collection_names
    collection_names.map{|c| to_real_name(c)}
  end
  
  def to_real_name(name)
    name + '_' + @key
  end
end
