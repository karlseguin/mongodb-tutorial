require 'rubygems'
require 'mongo'
require 'pony'

class Cleaner
  def initialize(singleServer)
    if singleServer.nil?    
      @connection = Mongo::ReplSetConnection.new(['127.0.0.1', 27017], {:rs_name => 'mogade'})
    else
      @connection = Mongo::Connection.new('127.0.0.1', 27017)
    end
  end
  def run
    @connection.database_names.each do |db_name|
      db = @connection[db_name]
      db.collection_names.each do |coll_name|
        id = coll_name.split(/_/)[1]
        next unless BSON::ObjectId.legal?(id)
        if ((Time.now - BSON::ObjectId.from_string(id).generation_time) / 3600).floor > 6
          db.drop_collection(coll_name)
        end
      end
    end
  end
end
Cleaner.new(ARGV[0]).run  
begin
  Cleaner.new(ARGV[0]).run
rescue
  Pony.mail(
     :to => 'karl@mogade.com', 
     :from => '_crons@mogade.com', 
     :subject => (ARGV[1] || 'prod') + ' - Mongly Cleaner ',
     :body => "%s\r\n\r\n\r\n%s" % [$!.to_s, $!.backtrace],
     :via => :smtp,
     :via_options =>
     {
       :address => 'smtp.gmail.com',
       :user_name => '_crons@mogade.com',
       :password => '0Xy5Fc>@Fc)7y51]m',
     })
  p $!.to_s
end