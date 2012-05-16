require 'mongo'
require 'settings'

class Store
  def self.setup
    @@connection = Mongo::Connection.new(Settings.host, Settings.port)
    handle_passenger_forking
  end
  
  def self.connection
    @@connection
  end
    
  def self.handle_passenger_forking
    if defined?(PhusionPassenger)
      PhusionPassenger.on_event(:starting_worker_process) do |forked|
        @@connection.connect if forked
      end
    end
  end
end