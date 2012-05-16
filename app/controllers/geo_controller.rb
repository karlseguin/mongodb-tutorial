class GeoController < ApplicationController
  before_filter :load_collection
  def index
  end
  
  def find
  
    selector = geo_hack(to_selector(params[:selector]))
    p selector
    
    options = {}
    options[:fields] = params[:fields] if params[:fields]
    options[:sort] = build_sort(params[:sort]) if params[:sort]
    options[:limit] = params[:limit].to_i == 0 ? 200 : params[:limit].to_i
    options[:skip] = params[:skip].to_i if params[:skip].to_i != 0

    finder = @collection.find(selector, options)
        
    render :json => {:documents => finder.explain, :count => 1} and return if params[:explain]

    render :json => {:documents => finder, :count => finder.count, :limit => options[:limit] || 200}
  end
  def count
    selector = to_selector(params[:selector])
    render :json => {:count => @collection.find(selector).count }
  end
  def stats
    render :json => @collection.stats
  end
  def get_indexes
    render :json => @collection.index_information
  end
  
  def distinct
    render :json => @collection.distinct(params[:field], to_selector(params[:query]))
  end
  def ensureIndex
    render :json => {:success => true}
  end
  def dropIndexes
    render :json => {:success => true}
  end
  
  private
  def load_collection
    @collection = Store.connection.db('geo')['treasures']
  end
  def build_sort(raw)
    raw.map{|k, v| [k, v == 1 ? :ascending : :descending]}
  end
  def to_selector(raw)
   return {} if raw.blank? || !raw.is_a?(Hash)
   raw.each do |key, value|
     if value.is_a?(Hash) 
       if value.has_key?('$oid')
         raw[key] = BSON::ObjectId(value['$oid']) 
       elsif value.has_key?('$date')
         raw[key] = Time.at(value['$date']) 
       else 
         to_selector(value)
       end
     elsif value.is_a?(String) && BSON::ObjectId.legal?(value)
       raw[key] = BSON::ObjectId(value)
     end
   end
  end
  def geo_hack(hash)
    if hash.include?('location') && hash['location'].is_a?(Hash) && hash['location'].include?('$near')
      copy = hash['location']
      hash['location'] = BSON::OrderedHash.new
      hash['location']['$near'] = copy['$near']
      
      copy.each do |key, value|
        hash['location'][key] = value unless key == '$near'
      end
    end
    hash
  end
end



# 25.times do
#   puts "db.treasures.insert({type: 'gold', location:{x: #{[*-24..24].choice}, y: #{[*-24..24].choice}}, amount: #{[*1..50].choice}});"
# end
# db.treasures.insert({type: 'coal', location:{x: -2, y: -18}, amount: 27});
# db.treasures.insert({type: 'coal', location:{x: 8, y: 1}, amount: 15});
# db.treasures.insert({type: 'coal', location:{x: -16, y: -11}, amount: 4});
# db.treasures.insert({type: 'coal', location:{x: 0, y: 16}, amount: 18});
# db.treasures.insert({type: 'coal', location:{x: 24, y: 20}, amount: 37});
# db.treasures.insert({type: 'coal', location:{x: -10, y: -24}, amount: 10});
# db.treasures.insert({type: 'coal', location:{x: 7, y: 9}, amount: 26});
# db.treasures.insert({type: 'coal', location:{x: 10, y: 5}, amount: 2});
# db.treasures.insert({type: 'coal', location:{x: 24, y: -7}, amount: 27});
# db.treasures.insert({type: 'coal', location:{x: 19, y: -9}, amount: 27});
# db.treasures.insert({type: 'coal', location:{x: 15, y: -11}, amount: 13});
# db.treasures.insert({type: 'coal', location:{x: -11, y: -22}, amount: 33});
# db.treasures.insert({type: 'coal', location:{x: 18, y: 16}, amount: 9});
# db.treasures.insert({type: 'coal', location:{x: -9, y: -11}, amount: 15});
# db.treasures.insert({type: 'coal', location:{x: 16, y: 3}, amount: 21});
# db.treasures.insert({type: 'coal', location:{x: 13, y: 9}, amount: 41});
# db.treasures.insert({type: 'coal', location:{x: 4, y: -20}, amount: 11});
# db.treasures.insert({type: 'coal', location:{x: 13, y: 13}, amount: 31});
# db.treasures.insert({type: 'coal', location:{x: 20, y: 24}, amount: 10});
# db.treasures.insert({type: 'coal', location:{x: -9, y: 21}, amount: 16});
# db.treasures.insert({type: 'coal', location:{x: -18, y: -10}, amount: 25});
# db.treasures.insert({type: 'coal', location:{x: -3, y: 1}, amount: 28});
# db.treasures.insert({type: 'coal', location:{x: -17, y: 11}, amount: 20});
# db.treasures.insert({type: 'coal', location:{x: 6, y: -12}, amount: 36});
# db.treasures.insert({type: 'coal', location:{x: 8, y: -17}, amount: 15});
# db.treasures.insert({type: 'coal', location:{x: -23, y: -2}, amount: 27});
# db.treasures.insert({type: 'coal', location:{x: -20, y: 0}, amount: 6});
# db.treasures.insert({type: 'coal', location:{x: -14, y: -12}, amount: 14});
# db.treasures.insert({type: 'coal', location:{x: 23, y: 12}, amount: 16});
# db.treasures.insert({type: 'coal', location:{x: 1, y: 12}, amount: 4});
# db.treasures.insert({type: 'coal', location:{x: -10, y: 0}, amount: 46});
# db.treasures.insert({type: 'coal', location:{x: 16, y: 7}, amount: 33});
# db.treasures.insert({type: 'coal', location:{x: -6, y: -21}, amount: 46});
# db.treasures.insert({type: 'coal', location:{x: -7, y: -18}, amount: 33});
# db.treasures.insert({type: 'coal', location:{x: -4, y: -18}, amount: 48});
# db.treasures.insert({type: 'coal', location:{x: -5, y: -5}, amount: 25});
# db.treasures.insert({type: 'coal', location:{x: -22, y: 1}, amount: 45});
# db.treasures.insert({type: 'coal', location:{x: -9, y: -24}, amount: 35});
# db.treasures.insert({type: 'coal', location:{x: -18, y: 24}, amount: 15});
# db.treasures.insert({type: 'coal', location:{x: -5, y: -19}, amount: 2});
# db.treasures.insert({type: 'coal', location:{x: 7, y: -6}, amount: 21});
# db.treasures.insert({type: 'coal', location:{x: -16, y: -19}, amount: 31});
# db.treasures.insert({type: 'coal', location:{x: 17, y: -23}, amount: 12});
# db.treasures.insert({type: 'coal', location:{x: -24, y: -14}, amount: 46});
# db.treasures.insert({type: 'coal', location:{x: 16, y: 20}, amount: 13});
# db.treasures.insert({type: 'coal', location:{x: 12, y: 15}, amount: 25});
# db.treasures.insert({type: 'coal', location:{x: -24, y: 20}, amount: 30});
# db.treasures.insert({type: 'coal', location:{x: 14, y: 13}, amount: 49});
# db.treasures.insert({type: 'coal', location:{x: -11, y: 3}, amount: 1});
# db.treasures.insert({type: 'coal', location:{x: 16, y: -9}, amount: 50});
# db.treasures.insert({type: 'coal', location:{x: 14, y: 23}, amount: 26});
# db.treasures.insert({type: 'coal', location:{x: -5, y: 9}, amount: 12});
# db.treasures.insert({type: 'coal', location:{x: -11, y: 8}, amount: 15});
# db.treasures.insert({type: 'coal', location:{x: 8, y: -6}, amount: 27});
# db.treasures.insert({type: 'coal', location:{x: 4, y: 7}, amount: 9});
# db.treasures.insert({type: 'coal', location:{x: 3, y: -4}, amount: 12});
# db.treasures.insert({type: 'coal', location:{x: -24, y: -16}, amount: 50});
# db.treasures.insert({type: 'coal', location:{x: -10, y: 20}, amount: 17});
# db.treasures.insert({type: 'coal', location:{x: 7, y: -3}, amount: 19});
# db.treasures.insert({type: 'coal', location:{x: 0, y: -10}, amount: 44});
# db.treasures.insert({type: 'coal', location:{x: -5, y: -6}, amount: 26});
# db.treasures.insert({type: 'coal', location:{x: -4, y: 10}, amount: 21});
# db.treasures.insert({type: 'coal', location:{x: 24, y: -22}, amount: 48});
# db.treasures.insert({type: 'coal', location:{x: 6, y: 1}, amount: 6});
# db.treasures.insert({type: 'coal', location:{x: 8, y: -5}, amount: 37});
# db.treasures.insert({type: 'coal', location:{x: 11, y: 23}, amount: 2});
# db.treasures.insert({type: 'coal', location:{x: 16, y: 19}, amount: 11});
# db.treasures.insert({type: 'coal', location:{x: 9, y: -7}, amount: 9});
# db.treasures.insert({type: 'coal', location:{x: -13, y: 13}, amount: 18});
# db.treasures.insert({type: 'coal', location:{x: -8, y: 6}, amount: 8});
# db.treasures.insert({type: 'coal', location:{x: -18, y: -23}, amount: 49});
# db.treasures.insert({type: 'coal', location:{x: 4, y: 11}, amount: 7});
# db.treasures.insert({type: 'coal', location:{x: -16, y: -10}, amount: 27});
# db.treasures.insert({type: 'coal', location:{x: 7, y: -23}, amount: 7});
# db.treasures.insert({type: 'coal', location:{x: -20, y: -15}, amount: 43});
# db.treasures.insert({type: 'coal', location:{x: 12, y: -13}, amount: 37});
# db.treasures.insert({type: 'coal', location:{x: 14, y: 10}, amount: 37});
# db.treasures.insert({type: 'coal', location:{x: 19, y: 9}, amount: 12});
# db.treasures.insert({type: 'coal', location:{x: -4, y: 15}, amount: 9});
# db.treasures.insert({type: 'coal', location:{x: 2, y: 19}, amount: 34});
# db.treasures.insert({type: 'coal', location:{x: 22, y: -9}, amount: 17});
# db.treasures.insert({type: 'coal', location:{x: 7, y: 19}, amount: 2});
# db.treasures.insert({type: 'coal', location:{x: -4, y: 6}, amount: 30});
# db.treasures.insert({type: 'coal', location:{x: -8, y: 3}, amount: 32});
# db.treasures.insert({type: 'coal', location:{x: -13, y: 6}, amount: 15});
# db.treasures.insert({type: 'coal', location:{x: 7, y: -17}, amount: 36});
# db.treasures.insert({type: 'coal', location:{x: -8, y: 4}, amount: 35});
# db.treasures.insert({type: 'coal', location:{x: 23, y: 8}, amount: 15});
# db.treasures.insert({type: 'coal', location:{x: 24, y: 20}, amount: 9});
# db.treasures.insert({type: 'coal', location:{x: 22, y: -11}, amount: 4});
# db.treasures.insert({type: 'coal', location:{x: -17, y: -14}, amount: 17});
# db.treasures.insert({type: 'coal', location:{x: 16, y: 20}, amount: 22});
# db.treasures.insert({type: 'coal', location:{x: 23, y: -23}, amount: 41});
# db.treasures.insert({type: 'coal', location:{x: -22, y: 18}, amount: 32});
# db.treasures.insert({type: 'coal', location:{x: -9, y: 13}, amount: 42});
# db.treasures.insert({type: 'coal', location:{x: -15, y: -13}, amount: 41});
# db.treasures.insert({type: 'coal', location:{x: 16, y: -9}, amount: 34});
# db.treasures.insert({type: 'coal', location:{x: 8, y: -22}, amount: 42});
# db.treasures.insert({type: 'coal', location:{x: -7, y: 2}, amount: 6});
# db.treasures.insert({type: 'coal', location:{x: 13, y: -20}, amount: 21});
# db.treasures.insert({type: 'coal', location:{x: -17, y: 22}, amount: 44});
# db.treasures.insert({type: 'coal', location:{x: 22, y: -18}, amount: 21});
# db.treasures.insert({type: 'coal', location:{x: 4, y: 15}, amount: 17});
# db.treasures.insert({type: 'coal', location:{x: -8, y: 23}, amount: 11});
# db.treasures.insert({type: 'coal', location:{x: -15, y: -15}, amount: 46});
# db.treasures.insert({type: 'coal', location:{x: -11, y: 16}, amount: 19});
# db.treasures.insert({type: 'coal', location:{x: -23, y: 2}, amount: 27});
# db.treasures.insert({type: 'coal', location:{x: 1, y: -2}, amount: 2});
# db.treasures.insert({type: 'coal', location:{x: 21, y: -5}, amount: 13});
# db.treasures.insert({type: 'coal', location:{x: -8, y: -10}, amount: 28});
# db.treasures.insert({type: 'coal', location:{x: 0, y: -18}, amount: 4});
# db.treasures.insert({type: 'coal', location:{x: 0, y: -2}, amount: 12});
# db.treasures.insert({type: 'coal', location:{x: -18, y: -8}, amount: 23});
# db.treasures.insert({type: 'coal', location:{x: 13, y: 19}, amount: 42});
# db.treasures.insert({type: 'coal', location:{x: -6, y: -22}, amount: 14});
# db.treasures.insert({type: 'coal', location:{x: -23, y: -4}, amount: 37});
# db.treasures.insert({type: 'coal', location:{x: -10, y: 15}, amount: 35});
# db.treasures.insert({type: 'coal', location:{x: 23, y: -17}, amount: 14});
# db.treasures.insert({type: 'coal', location:{x: -12, y: -5}, amount: 5});
# db.treasures.insert({type: 'coal', location:{x: 2, y: -21}, amount: 28});
# db.treasures.insert({type: 'coal', location:{x: -24, y: 14}, amount: 31});
# db.treasures.insert({type: 'coal', location:{x: 7, y: -7}, amount: 46});
# db.treasures.insert({type: 'coal', location:{x: -23, y: 21}, amount: 44});
# db.treasures.insert({type: 'coal', location:{x: 0, y: 22}, amount: 31});
# db.treasures.insert({type: 'coal', location:{x: 18, y: 8}, amount: 34});
# db.treasures.insert({type: 'coal', location:{x: -8, y: 11}, amount: 32});
# db.treasures.insert({type: 'coal', location:{x: -13, y: -12}, amount: 33});
# db.treasures.insert({type: 'coal', location:{x: 16, y: 7}, amount: 20});
# db.treasures.insert({type: 'coal', location:{x: -2, y: 8}, amount: 12});
# db.treasures.insert({type: 'coal', location:{x: 21, y: -5}, amount: 36});
# db.treasures.insert({type: 'coal', location:{x: -6, y: 6}, amount: 1});
# db.treasures.insert({type: 'coal', location:{x: 11, y: -12}, amount: 13});
# db.treasures.insert({type: 'coal', location:{x: 19, y: -12}, amount: 6});
# db.treasures.insert({type: 'coal', location:{x: 4, y: 4}, amount: 8});
# db.treasures.insert({type: 'coal', location:{x: -22, y: 4}, amount: 28});
# db.treasures.insert({type: 'coal', location:{x: -9, y: -11}, amount: 23});
# db.treasures.insert({type: 'coal', location:{x: 5, y: -14}, amount: 23});
# db.treasures.insert({type: 'coal', location:{x: 3, y: -17}, amount: 15});
# db.treasures.insert({type: 'coal', location:{x: -20, y: 16}, amount: 35});
# db.treasures.insert({type: 'coal', location:{x: 21, y: -21}, amount: 26});
# db.treasures.insert({type: 'coal', location:{x: -24, y: -10}, amount: 14});
# db.treasures.insert({type: 'coal', location:{x: -12, y: 8}, amount: 1});
# db.treasures.insert({type: 'coal', location:{x: 1, y: 13}, amount: 2});
# db.treasures.insert({type: 'coal', location:{x: -20, y: -24}, amount: 10});
# db.treasures.insert({type: 'coal', location:{x: 5, y: -8}, amount: 1});
# db.treasures.insert({type: 'coal', location:{x: 15, y: -18}, amount: 10});
# db.treasures.insert({type: 'coal', location:{x: -16, y: 9}, amount: 30});
# db.treasures.insert({type: 'coal', location:{x: 0, y: -11}, amount: 45});
# db.treasures.insert({type: 'coal', location:{x: 21, y: 14}, amount: 47});
# db.treasures.insert({type: 'coal', location:{x: 8, y: 16}, amount: 40});
# db.treasures.insert({type: 'coal', location:{x: -7, y: -18}, amount: 45});
# db.treasures.insert({type: 'coal', location:{x: -17, y: -15}, amount: 28});
# db.treasures.insert({type: 'coal', location:{x: 18, y: -12}, amount: 33});
# db.treasures.insert({type: 'coal', location:{x: -24, y: -13}, amount: 17});
# db.treasures.insert({type: 'coal', location:{x: 2, y: 1}, amount: 43});
# db.treasures.insert({type: 'coal', location:{x: 12, y: 14}, amount: 2});
# db.treasures.insert({type: 'coal', location:{x: -6, y: 24}, amount: 5});
# db.treasures.insert({type: 'coal', location:{x: -2, y: -21}, amount: 11});
# db.treasures.insert({type: 'coal', location:{x: -19, y: -18}, amount: 19});
# db.treasures.insert({type: 'coal', location:{x: -5, y: 10}, amount: 22});
# db.treasures.insert({type: 'coal', location:{x: -16, y: 22}, amount: 48});
# db.treasures.insert({type: 'coal', location:{x: 2, y: 17}, amount: 21});
# db.treasures.insert({type: 'coal', location:{x: -16, y: -11}, amount: 35});
# db.treasures.insert({type: 'coal', location:{x: 11, y: 6}, amount: 31});
# db.treasures.insert({type: 'coal', location:{x: -5, y: -2}, amount: 47});
# db.treasures.insert({type: 'coal', location:{x: -20, y: 24}, amount: 49});
# db.treasures.insert({type: 'coal', location:{x: -7, y: -21}, amount: 34});
# db.treasures.insert({type: 'coal', location:{x: 7, y: 6}, amount: 36});
# db.treasures.insert({type: 'coal', location:{x: 9, y: 5}, amount: 35});
# db.treasures.insert({type: 'coal', location:{x: -7, y: 14}, amount: 12});
# db.treasures.insert({type: 'coal', location:{x: 12, y: 23}, amount: 30});
# db.treasures.insert({type: 'coal', location:{x: -7, y: -3}, amount: 3});
# db.treasures.insert({type: 'coal', location:{x: 13, y: 11}, amount: 5});
# db.treasures.insert({type: 'coal', location:{x: -18, y: 19}, amount: 31});
# db.treasures.insert({type: 'coal', location:{x: 9, y: 9}, amount: 24});
# db.treasures.insert({type: 'coal', location:{x: -15, y: 13}, amount: 42});
# db.treasures.insert({type: 'coal', location:{x: -21, y: -5}, amount: 32});
# db.treasures.insert({type: 'coal', location:{x: -4, y: -10}, amount: 29});
# db.treasures.insert({type: 'coal', location:{x: 9, y: 20}, amount: 48});
# db.treasures.insert({type: 'coal', location:{x: 4, y: -7}, amount: 4});
# db.treasures.insert({type: 'coal', location:{x: -21, y: -15}, amount: 42});
# db.treasures.insert({type: 'coal', location:{x: -10, y: 21}, amount: 24});
# db.treasures.insert({type: 'coal', location:{x: 14, y: 13}, amount: 8});
# db.treasures.insert({type: 'coal', location:{x: 2, y: 16}, amount: 20});
# db.treasures.insert({type: 'coal', location:{x: 15, y: 4}, amount: 5});
# db.treasures.insert({type: 'coal', location:{x: -3, y: -20}, amount: 45});
# db.treasures.insert({type: 'coal', location:{x: -2, y: 2}, amount: 8});
# db.treasures.insert({type: 'coal', location:{x: 8, y: 11}, amount: 49});
# db.treasures.insert({type: 'coal', location:{x: 7, y: -1}, amount: 24});
# db.treasures.insert({type: 'coal', location:{x: 5, y: -21}, amount: 10});
# db.treasures.insert({type: 'coal', location:{x: 3, y: -24}, amount: 30});
# db.treasures.insert({type: 'coal', location:{x: 13, y: 16}, amount: 34});
# db.treasures.insert({type: 'coal', location:{x: -22, y: -6}, amount: 5});
# db.treasures.insert({type: 'coal', location:{x: -8, y: 17}, amount: 35});
# db.treasures.insert({type: 'coal', location:{x: 24, y: -14}, amount: 8});
# db.treasures.insert({type: 'coal', location:{x: 4, y: 7}, amount: 2});
# db.treasures.insert({type: 'coal', location:{x: -9, y: -19}, amount: 48});
# db.treasures.insert({type: 'coal', location:{x: 20, y: 1}, amount: 8});
# db.treasures.insert({type: 'coal', location:{x: -10, y: 15}, amount: 21});
# db.treasures.insert({type: 'coal', location:{x: -2, y: 9}, amount: 12});
# db.treasures.insert({type: 'copper', location:{x: 24, y: -4}, amount: 30});
# db.treasures.insert({type: 'copper', location:{x: 3, y: 11}, amount: 12});
# db.treasures.insert({type: 'copper', location:{x: -22, y: 18}, amount: 36});
# db.treasures.insert({type: 'copper', location:{x: -4, y: -16}, amount: 2});
# db.treasures.insert({type: 'copper', location:{x: -9, y: 11}, amount: 19});
# db.treasures.insert({type: 'copper', location:{x: 14, y: -12}, amount: 41});
# db.treasures.insert({type: 'copper', location:{x: -2, y: -16}, amount: 33});
# db.treasures.insert({type: 'copper', location:{x: -19, y: -13}, amount: 30});
# db.treasures.insert({type: 'copper', location:{x: -23, y: 3}, amount: 50});
# db.treasures.insert({type: 'copper', location:{x: 2, y: -3}, amount: 32});
# db.treasures.insert({type: 'copper', location:{x: 21, y: -24}, amount: 20});
# db.treasures.insert({type: 'copper', location:{x: 13, y: -22}, amount: 2});
# db.treasures.insert({type: 'copper', location:{x: 24, y: 12}, amount: 39});
# db.treasures.insert({type: 'copper', location:{x: 18, y: -23}, amount: 26});
# db.treasures.insert({type: 'copper', location:{x: 19, y: -4}, amount: 48});
# db.treasures.insert({type: 'copper', location:{x: -15, y: 14}, amount: 43});
# db.treasures.insert({type: 'copper', location:{x: 14, y: -17}, amount: 34});
# db.treasures.insert({type: 'copper', location:{x: 11, y: 7}, amount: 41});
# db.treasures.insert({type: 'copper', location:{x: -22, y: 19}, amount: 46});
# db.treasures.insert({type: 'copper', location:{x: -24, y: -16}, amount: 19});
# db.treasures.insert({type: 'copper', location:{x: 2, y: -3}, amount: 50});
# db.treasures.insert({type: 'copper', location:{x: -16, y: -22}, amount: 31});
# db.treasures.insert({type: 'copper', location:{x: 24, y: -24}, amount: 31});
# db.treasures.insert({type: 'copper', location:{x: -14, y: -24}, amount: 8});
# db.treasures.insert({type: 'copper', location:{x: -5, y: -10}, amount: 4});
# db.treasures.insert({type: 'copper', location:{x: 7, y: -7}, amount: 14});
# db.treasures.insert({type: 'copper', location:{x: -8, y: -24}, amount: 17});
# db.treasures.insert({type: 'copper', location:{x: -11, y: 3}, amount: 39});
# db.treasures.insert({type: 'copper', location:{x: -3, y: -9}, amount: 15});
# db.treasures.insert({type: 'copper', location:{x: 0, y: -5}, amount: 25});
# db.treasures.insert({type: 'copper', location:{x: -15, y: -9}, amount: 39});
# db.treasures.insert({type: 'copper', location:{x: -8, y: -24}, amount: 30});
# db.treasures.insert({type: 'copper', location:{x: -10, y: 22}, amount: 31});
# db.treasures.insert({type: 'copper', location:{x: -13, y: 12}, amount: 10});
# db.treasures.insert({type: 'copper', location:{x: 0, y: -11}, amount: 45});
# db.treasures.insert({type: 'copper', location:{x: 18, y: 11}, amount: 38});
# db.treasures.insert({type: 'copper', location:{x: -5, y: 15}, amount: 44});
# db.treasures.insert({type: 'copper', location:{x: 19, y: 9}, amount: 13});
# db.treasures.insert({type: 'copper', location:{x: -17, y: 11}, amount: 6});
# db.treasures.insert({type: 'copper', location:{x: 1, y: -6}, amount: 20});
# db.treasures.insert({type: 'copper', location:{x: 20, y: -12}, amount: 28});
# db.treasures.insert({type: 'copper', location:{x: 14, y: 15}, amount: 34});
# db.treasures.insert({type: 'copper', location:{x: 1, y: -7}, amount: 12});
# db.treasures.insert({type: 'copper', location:{x: -5, y: -11}, amount: 36});
# db.treasures.insert({type: 'copper', location:{x: -14, y: -13}, amount: 15});
# db.treasures.insert({type: 'copper', location:{x: 20, y: -12}, amount: 25});
# db.treasures.insert({type: 'copper', location:{x: -17, y: -4}, amount: 50});
# db.treasures.insert({type: 'copper', location:{x: 17, y: -19}, amount: 8});
# db.treasures.insert({type: 'copper', location:{x: 16, y: -5}, amount: 24});
# db.treasures.insert({type: 'copper', location:{x: -11, y: 17}, amount: 5});
# db.treasures.insert({type: 'copper', location:{x: -4, y: 20}, amount: 22});
# db.treasures.insert({type: 'copper', location:{x: -13, y: -6}, amount: 13});
# db.treasures.insert({type: 'copper', location:{x: -14, y: -3}, amount: 13});
# db.treasures.insert({type: 'copper', location:{x: -9, y: -10}, amount: 42});
# db.treasures.insert({type: 'copper', location:{x: 13, y: 23}, amount: 14});
# db.treasures.insert({type: 'copper', location:{x: 24, y: 22}, amount: 22});
# db.treasures.insert({type: 'copper', location:{x: -15, y: -11}, amount: 1});
# db.treasures.insert({type: 'copper', location:{x: -2, y: 21}, amount: 11});
# db.treasures.insert({type: 'copper', location:{x: 10, y: -14}, amount: 39});
# db.treasures.insert({type: 'copper', location:{x: 1, y: -20}, amount: 50});
# db.treasures.insert({type: 'copper', location:{x: 15, y: 17}, amount: 23});
# db.treasures.insert({type: 'copper', location:{x: -4, y: 15}, amount: 5});
# db.treasures.insert({type: 'copper', location:{x: -12, y: -22}, amount: 40});
# db.treasures.insert({type: 'copper', location:{x: 3, y: 0}, amount: 12});
# db.treasures.insert({type: 'copper', location:{x: 6, y: 6}, amount: 42});
# db.treasures.insert({type: 'copper', location:{x: 24, y: -11}, amount: 30});
# db.treasures.insert({type: 'copper', location:{x: 24, y: 11}, amount: 39});
# db.treasures.insert({type: 'copper', location:{x: -4, y: -1}, amount: 11});
# db.treasures.insert({type: 'copper', location:{x: -4, y: 19}, amount: 41});
# db.treasures.insert({type: 'copper', location:{x: -14, y: 20}, amount: 36});
# db.treasures.insert({type: 'copper', location:{x: 20, y: 12}, amount: 44});
# db.treasures.insert({type: 'copper', location:{x: -22, y: -12}, amount: 24});
# db.treasures.insert({type: 'copper', location:{x: -7, y: 23}, amount: 11});
# db.treasures.insert({type: 'copper', location:{x: -6, y: 19}, amount: 21});
# db.treasures.insert({type: 'copper', location:{x: 6, y: 8}, amount: 9});
# db.treasures.insert({type: 'copper', location:{x: 1, y: 21}, amount: 28});
# db.treasures.insert({type: 'copper', location:{x: 0, y: -5}, amount: 50});
# db.treasures.insert({type: 'copper', location:{x: 7, y: 19}, amount: 23});
# db.treasures.insert({type: 'copper', location:{x: -19, y: 3}, amount: 8});
# db.treasures.insert({type: 'copper', location:{x: 13, y: -12}, amount: 16});
# db.treasures.insert({type: 'copper', location:{x: -13, y: -20}, amount: 44});
# db.treasures.insert({type: 'copper', location:{x: -15, y: 2}, amount: 20});
# db.treasures.insert({type: 'copper', location:{x: 16, y: 3}, amount: 7});
# db.treasures.insert({type: 'copper', location:{x: -18, y: 16}, amount: 40});
# db.treasures.insert({type: 'copper', location:{x: 14, y: 8}, amount: 7});
# db.treasures.insert({type: 'copper', location:{x: 22, y: 4}, amount: 3});
# db.treasures.insert({type: 'copper', location:{x: -10, y: -14}, amount: 8});
# db.treasures.insert({type: 'copper', location:{x: -7, y: 24}, amount: 12});
# db.treasures.insert({type: 'copper', location:{x: -3, y: -10}, amount: 37});
# db.treasures.insert({type: 'copper', location:{x: 22, y: -16}, amount: 36});
# db.treasures.insert({type: 'copper', location:{x: -12, y: -2}, amount: 13});
# db.treasures.insert({type: 'copper', location:{x: -13, y: -24}, amount: 11});
# db.treasures.insert({type: 'copper', location:{x: 6, y: -4}, amount: 16});
# db.treasures.insert({type: 'copper', location:{x: -8, y: -17}, amount: 5});
# db.treasures.insert({type: 'copper', location:{x: -11, y: -12}, amount: 46});
# db.treasures.insert({type: 'copper', location:{x: 13, y: -20}, amount: 12});
# db.treasures.insert({type: 'copper', location:{x: -6, y: 22}, amount: 17});
# db.treasures.insert({type: 'copper', location:{x: 21, y: -24}, amount: 40});
# db.treasures.insert({type: 'copper', location:{x: -17, y: 10}, amount: 20});
# db.treasures.insert({type: 'copper', location:{x: -3, y: 4}, amount: 29});
# db.treasures.insert({type: 'silver', location:{x: -23, y: 17}, amount: 5});
# db.treasures.insert({type: 'silver', location:{x: 22, y: 22}, amount: 48});
# db.treasures.insert({type: 'silver', location:{x: -2, y: 1}, amount: 12});
# db.treasures.insert({type: 'silver', location:{x: 2, y: 24}, amount: 15});
# db.treasures.insert({type: 'silver', location:{x: 11, y: -5}, amount: 13});
# db.treasures.insert({type: 'silver', location:{x: -23, y: 16}, amount: 1});
# db.treasures.insert({type: 'silver', location:{x: 22, y: -7}, amount: 14});
# db.treasures.insert({type: 'silver', location:{x: 24, y: 4}, amount: 28});
# db.treasures.insert({type: 'silver', location:{x: 9, y: -19}, amount: 7});
# db.treasures.insert({type: 'silver', location:{x: -15, y: -21}, amount: 25});
# db.treasures.insert({type: 'silver', location:{x: 11, y: -16}, amount: 7});
# db.treasures.insert({type: 'silver', location:{x: -23, y: -4}, amount: 48});
# db.treasures.insert({type: 'silver', location:{x: -21, y: -12}, amount: 5});
# db.treasures.insert({type: 'silver', location:{x: 2, y: -14}, amount: 25});
# db.treasures.insert({type: 'silver', location:{x: 0, y: 2}, amount: 31});
# db.treasures.insert({type: 'silver', location:{x: -3, y: 6}, amount: 48});
# db.treasures.insert({type: 'silver', location:{x: -4, y: -1}, amount: 9});
# db.treasures.insert({type: 'silver', location:{x: -16, y: 15}, amount: 15});
# db.treasures.insert({type: 'silver', location:{x: -4, y: 20}, amount: 24});
# db.treasures.insert({type: 'silver', location:{x: -16, y: 24}, amount: 50});
# db.treasures.insert({type: 'silver', location:{x: 7, y: -12}, amount: 28});
# db.treasures.insert({type: 'silver', location:{x: 14, y: 12}, amount: 20});
# db.treasures.insert({type: 'silver', location:{x: 15, y: 4}, amount: 39});
# db.treasures.insert({type: 'silver', location:{x: -16, y: -24}, amount: 26});
# db.treasures.insert({type: 'silver', location:{x: -19, y: 11}, amount: 21});
# db.treasures.insert({type: 'silver', location:{x: 12, y: -7}, amount: 43});
# db.treasures.insert({type: 'silver', location:{x: -13, y: -24}, amount: 31});
# db.treasures.insert({type: 'silver', location:{x: -1, y: 0}, amount: 50});
# db.treasures.insert({type: 'silver', location:{x: -22, y: -1}, amount: 50});
# db.treasures.insert({type: 'silver', location:{x: -12, y: 22}, amount: 39});
# db.treasures.insert({type: 'silver', location:{x: -2, y: 2}, amount: 6});
# db.treasures.insert({type: 'silver', location:{x: 11, y: -24}, amount: 40});
# db.treasures.insert({type: 'silver', location:{x: -14, y: 0}, amount: 41});
# db.treasures.insert({type: 'silver', location:{x: 14, y: -24}, amount: 34});
# db.treasures.insert({type: 'silver', location:{x: -6, y: 6}, amount: 1});
# db.treasures.insert({type: 'silver', location:{x: 0, y: 0}, amount: 18});
# db.treasures.insert({type: 'silver', location:{x: 23, y: 8}, amount: 47});
# db.treasures.insert({type: 'silver', location:{x: -21, y: 17}, amount: 28});
# db.treasures.insert({type: 'silver', location:{x: -10, y: 9}, amount: 8});
# db.treasures.insert({type: 'silver', location:{x: -12, y: -7}, amount: 27});
# db.treasures.insert({type: 'silver', location:{x: 2, y: -19}, amount: 1});
# db.treasures.insert({type: 'silver', location:{x: 10, y: 20}, amount: 37});
# db.treasures.insert({type: 'silver', location:{x: 7, y: -24}, amount: 24});
# db.treasures.insert({type: 'silver', location:{x: -2, y: 19}, amount: 38});
# db.treasures.insert({type: 'silver', location:{x: -6, y: -24}, amount: 37});
# db.treasures.insert({type: 'silver', location:{x: -3, y: -12}, amount: 8});
# db.treasures.insert({type: 'silver', location:{x: 10, y: 6}, amount: 21});
# db.treasures.insert({type: 'silver', location:{x: 18, y: 8}, amount: 19});
# db.treasures.insert({type: 'silver', location:{x: 5, y: -17}, amount: 26});
# db.treasures.insert({type: 'silver', location:{x: 7, y: -6}, amount: 23});
# db.treasures.insert({type: 'gold', location:{x: 21, y: 6}, amount: 37});
# db.treasures.insert({type: 'gold', location:{x: -8, y: -21}, amount: 47});
# db.treasures.insert({type: 'gold', location:{x: -18, y: -24}, amount: 36});
# db.treasures.insert({type: 'gold', location:{x: -3, y: 19}, amount: 44});
# db.treasures.insert({type: 'gold', location:{x: -24, y: 12}, amount: 27});
# db.treasures.insert({type: 'gold', location:{x: -6, y: 1}, amount: 10});
# db.treasures.insert({type: 'gold', location:{x: 10, y: -3}, amount: 13});
# db.treasures.insert({type: 'gold', location:{x: -17, y: -2}, amount: 3});
# db.treasures.insert({type: 'gold', location:{x: -22, y: 22}, amount: 15});
# db.treasures.insert({type: 'gold', location:{x: -14, y: 2}, amount: 9});
# db.treasures.insert({type: 'gold', location:{x: -10, y: -6}, amount: 5});
# db.treasures.insert({type: 'gold', location:{x: -20, y: 14}, amount: 20});
# db.treasures.insert({type: 'gold', location:{x: -9, y: 2}, amount: 22});
# db.treasures.insert({type: 'gold', location:{x: 14, y: -2}, amount: 46});
# db.treasures.insert({type: 'gold', location:{x: 9, y: 23}, amount: 29});
# db.treasures.insert({type: 'gold', location:{x: 0, y: -3}, amount: 36});
# db.treasures.insert({type: 'gold', location:{x: 17, y: 1}, amount: 39});
# db.treasures.insert({type: 'gold', location:{x: 23, y: 23}, amount: 23});
# db.treasures.insert({type: 'gold', location:{x: 8, y: -7}, amount: 13});
# db.treasures.insert({type: 'gold', location:{x: -20, y: -19}, amount: 33});
# db.treasures.insert({type: 'gold', location:{x: -23, y: 5}, amount: 30});
# db.treasures.insert({type: 'gold', location:{x: -21, y: 14}, amount: 25});
# db.treasures.insert({type: 'gold', location:{x: -16, y: 13}, amount: 33});
# db.treasures.insert({type: 'gold', location:{x: 10, y: -12}, amount: 38});
# db.treasures.insert({type: 'gold', location:{x: 16, y: 13}, amount: 50});
# db.treasures.ensureIndex({location: '2d', type: 1}, {min:-25, max:25});