class Settings
  @@settings = File.exists?(Rails.root + 'config/config.yml') ? YAML::load_file(Rails.root + 'config/config.yml') : Hash.new

  def self.host
    @@settings['host']
  end
  def self.port
    @@settings['port']
  end
end