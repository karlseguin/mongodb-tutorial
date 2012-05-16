module Lesson
  @@data = [:step0, :step1, :step2, :step3, :step4, :step5, :step6, :step7, :step8, :step9, :step10, :step11, :step12, :step13, :step14, :step15, :step16, :step17, :step18, :step19, :step20]
  class << self
    def start(context)
      db = context.to_mongo
      context.real_collection_names.each do |collection|
        db.create_collection(collection)
      end
    end
    def reset(step, context)
      Lesson.send(@@data[step].to_s, context.to_mongo, context)
    end
    
    def step0(mongo, context)
      unicorns = mongo.collection(context.to_real_name('unicorns'))
      unicorns.remove
      unicorns.insert([
        {:name => 'Horny', :dob => Time.utc(1992, 3, 14, 7, 47), :gender => 'm', :loves => ['carrot', 'papaya'], :weight => 600, :vampires => 63},
        {:name => 'Aurora',  :dob => Time.utc(1991, 1, 25, 13, 14), :gender => 'f', :loves => ['carrot', 'grape'], :weight => 450, :vampires => 43},
        {:name => 'Unicrom',  :dob => Time.utc(1973, 2, 10, 22, 10), :gender => 'm', :loves => ['energon', 'redbull'], :weight => 984, :vampires => 182},
        {:name => 'Roooooodles',  :dob => Time.utc(1979, 8, 18, 18, 44), :gender => 'm', :loves => ['apple'], :weight => 575, :vampires => 99},
        {:name => 'Solnara',  :dob => Time.utc(1985, 7, 5, 2, 1), :gender => 'f', :loves => ['apple', 'carrot', 'chocolate'], :weight => 550, :vampires => 80},
        {:name => 'Ayna',  :dob => Time.utc(1998, 3, 8, 8, 30), :gender => 'f', :loves => ['strawberry', 'lemon'], :weight => 733, :vampires => 40},
        {:name => 'Kenny',  :dob => Time.utc(1997, 7, 2, 10, 42), :gender => 'm', :loves => ['grape', 'lemon'], :weight => 690, :vampires => 39},        
        {:name => 'Raleigh',  :dob => Time.utc(2005, 5, 4, 0, 57), :gender => 'm', :loves => ['apple', 'sugar'], :weight => 421, :vampires => 2},
        {:name => 'Leia',  :dob => Time.utc(2001, 10, 9, 14, 53), :gender => 'f', :loves => ['apple', 'watermelon'], :weight => 601, :vampires => 33},
        {:name => 'Pilot',  :dob => Time.utc(1997, 3, 27, 5, 3), :gender => 'm', :loves => ['apple', 'watermelon'], :weight => 650, :vampires => 54},
        {:name => 'Nimue',  :dob => Time.utc(1999, 12, 20, 16, 15), :gender => 'f', :loves => ['grape', 'carrot'], :weight => 540, :vampires => 49},
        {:name => 'Dunx',  :dob => Time.utc(1976, 7, 19, 19, 18), :gender => 'm', :loves => ['grape', 'watermelon'], :weight => 704, :vampires => 165},        
      ])
    end
    
    def step1(mongo, context)
      step0(mongo, context)
    end
    def step2(mongo, context)
      step0(mongo, context)
    end
    def step3(mongo, context)
      step0(mongo, context)
    end
    def step4(mongo, context)
      step0(mongo, context)
    end
    def step5(mongo, context)
      step0(mongo, context)
    end
    def step6(mongo, context)
      step0(mongo, context)
    end
    def step7(mongo, context)
      step0(mongo, context)
    end
    def step8(mongo, context)
      step0(mongo, context)
    end
    def step9(mongo, context)
      step0(mongo, context)
    end
    def step10(mongo, context)
      step0(mongo, context)
      unicorns = mongo.collection(context.to_real_name('unicorns'))
      unicorns.insert({:name => 'Lois', :gender => 'f', :vampires => 0})
    end
    def step11(mongo, context)
      step10(mongo, context)
    end
    def step12(mongo, context)
      step0(mongo, context)
      unicorns = mongo.collection(context.to_real_name('unicorns'))
      unicorns.insert({:weight => 55})
    end
    def step13(mongo, context)
      step12(mongo, context)
    end
    def step14(mongo, context)
      step0(mongo, context)
      unicorns = mongo.collection(context.to_real_name('unicorns'))
      unicorns.insert({:name => 'Lois', :gender => 'f', :vampires => 0, :weight => 55})
    end
    def step15(mongo, context)
      step14(mongo, context)
      unicorns = mongo.collection(context.to_real_name('unicorns'))
      unicorns.insert({:name => 'Ulysee', :vampires => 1})
    end
    def step16(mongo, context)
      step15(mongo, context)
    end
    def step17(mongo, context)
      step14(mongo, context)
      unicorns = mongo.collection(context.to_real_name('unicorns'))
      unicorns.insert({:name => 'Ulysee', :vampires => 2})
    end
    def step18(mongo, context)
      step17(mongo, context)
    end
    def step19(mongo, context)
      step17(mongo, context)
      unicorns = mongo.collection(context.to_real_name('unicorns'))
      unicorns.update({:gender => 'm'}, {'$push' => {:loves => 'oranges'}}, {:upsert => false, :multi => true})
    end
    def step20(mongo, context)
      step19(mongo, context)
    end
  end
end