function help()
{
  $('#results').html('<div id="help"><p>' + teacher.currentStep.help() + "</p><br/><br/>or<br/><br/><p>Type <strong>reset</strong> to revert any changes you've made to the data for this step.</p><p>Type <strong>restart</strong> to start this tutorial over</p><p><strong>lesson(X)</strong> to jump to lesson # X</p><p><strong>ctrl-,</strong> to slow things down</p><p><strong>ctrl-.</strong> to speed things up</p><p>You can also click the speed button in the upper right to change the speed<p></div>");
};
function reset()
{
  lesson(teacher.currentStep.index);
};
function restart()
{
  lesson(0);
};
function lesson(step)
{
  with(window){ var targetStep =  eval('teacher.step' + step)};
  if (!targetStep) 
  { 
      return;
  }
  if (teacher.interval) { clearInterval(teacher.interval); }
  if (teacher.timeout) { clearTimeout(teacher.timeout); }
  $.get('/tutorial/reset?index=' + step, null, function(r)
  {
    teacher.start(step);
  }); 
};
Object.size = function(obj)
{
  var size = 0, key;
  for (key in obj) 
  {
    if (obj.hasOwnProperty(key)) { ++size; }
  }
  return size;
};
var teacher = 
{
  currentStep: null,
  speeds: [2, 1.5, 1.25, 1, 0.75, 0.5, 0.25, 0.1],
  speedIndex: 2,
  input: null,
  $input: null,
  start: function(step)
  {
    teacher.input = document.getElementById('input');
    teacher.$input = $(teacher.input);
    if (step)
    {
      with(window){ return eval('teacher.step(teacher.step' + step + ');')}
    }
    else  { teacher.step(teacher.step0); }
    
  },
  got: function(response, command)
  {
    teacher.currentStep.finish(response, command);
  },
  step: function(step)
  {
    teacher.$input.css({backgroundColor: ''});
    $('#lesson').text('lesson: ' + step.index);
    step.start();
    teacher.currentStep = step;
    return null;
  },
  wrong: function()
  {
    $('#history').inputHistory({command: 'add', type: 'teach', html: "That's not quite right. Enter <strong>help</strong> if you are stuck"});
    return null;
  },
  speedUp: function()
  {
    teacher.changeSpeed(teacher.speedIndex + 1);
  },
  slowDown: function()
  {
   teacher.changeSpeed(teacher.speedIndex - 1);
  },
  changeSpeed: function(index)
  {
    if (index < teacher.speeds.length && index > -1)
    {
      teacher.speedIndex = index;
      $('#speed').text('speed ' + index);
      clearTimeout(teacher.timeout);
      teacher.say(teacher.currentLecture, teacher.currentCallback, teacher.currentIndex);
    }
  },
  canExecute: function(command)
  {
    if (command.teacherName && command.teacherName() == 'find') { return true; }
    if (teacher.currentStep.canExecute && !teacher.currentStep.canExecute(command))
    {
      teacher.wrong();
      return false;
    }
    return true;
  },
  isId: function(object, property, id)
  {
    return object && object[property] && object[property]['$oid'] && object[property]['$oid'] == id
  },
  say: function(lecture, callback, i)
  {
    if (!i) { i = 0; }
    if (i >= lecture.length) { return; }
    teacher.currentIndex = i;
    teacher.currentLecture = lecture;
    teacher.currentCallback = callback;
    teacher.timeout = setTimeout(function()
    {
      $('#history').inputHistory({command: 'add', type: 'teach', html: lecture[i++][1]});
      if (i < lecture.length) { teacher.say(lecture, callback, i); }
      else if (callback) { callback(); }
    }, (i == 0 ? 0 : lecture[i-1][0]) * teacher.speeds[teacher.speedIndex]);
  },
  commandFor: function(c, name, collection)
  {
    return c && c.teacherName && c.teacherName() == name && c._collection._name == collection;
  },
  blockInput: function()
  {
    teacher.input.disabled = true;
  },
  unblockInput: function()
  {
    teacher.input.disabled = false;
  },
  waitingAnswer: function(count)
  {
    teacher.$input.css({backgroundColor: '#efe'}).focus();
  }
};

teacher.step0 =
{
  index: 0,
  start: function()
  {
    teacher.say([
      [4000, "Welcome to a quick 15 minute interactive MongoDB tutorial. In this tutorial you'll learn the basics about working with MongoDB"],
      [3500, "At any point, you can get help by entering <strong>help</strong>"],
      [4500, "I also wrote a free ebook you might be interested in: <a href=\"http://openmymind.net/2011/3/28/The-Little-MongoDB-Book\" target=\"_blank\">The Little MongoDB Book</a>"],
      [2000, "Let's start"],
      [4000, "A MongoDB database is made up of <em>collections</em>. You can think of <em>collections</em> as <em>tables</em> from relational databases"],
      [3500, "Let's ask the database, identified by the <em>db</em> object, to list all of its collections"],
      [10, "It's easy, just enter <em>db.getCollectionNames();</em>"],
    ], teacher.waitingAnswer);
  },
  help: function()
  {
    return "Enter <strong>db.getCollectionNames();</strong>";
  },
  finish: function(r)
  {
    if (r[0] == 'unicorns')
    {
      return teacher.step(teacher.step1);
    }
    return teacher.wrong();
  },
};

teacher.step1 =
{
  index: 1,
  start: function()
  {
    teacher.say([
        [3000, "Great work. So we have a collection of unicorns, eh?"],
        [5000, "MongoDB has a number of database commands, but we'll mostly focus on collection commands"],
        [5000, "Collection commands are executed via <em>db.COLLECTION_NAME.COMMAND()</em>"],
        [3000, "Can you guess how to retrieve a <em>count</em> of <em>unicorns</em>?"]
    ], teacher.waitingAnswer);
  },
  help: function()
  {
    return "Enter <strong>db.unicorns.count();</strong>";
  },
  finish: function(r)
  {
    var text = $('#results').text();
    if (text == '0 documents in unicorns') { top.location = 'http://www.thinkgeek.com/caffeine/wacky-edibles/e5a7/'; }
    if (/documents? in unicorns$/.test(text))
    {
      return teacher.step(teacher.step2);      
    }
    return teacher.wrong();
  }
};

teacher.step2 =
{
  index: 2,
  start: function() 
  {
    teacher.say([
        [4000, "Most excellent! All our unicorns are accounted for"],
        [5000, "If you are going to work with unicorns, you have to get to know them"],
        [4000, "Use the <em>find</em> command to retrive the information on our <em>unicorns</em>"]
    ], teacher.waitingAnswer);
  },
  help: function()
  {
    return "Enter <strong>db.unicorns.find();</strong>";
  },
  finish: function(r, c)
  {
    if (c && c.teacherName && c.teacherName() == 'find' && c._collection._name == 'unicorns')
    {
      return teacher.step(teacher.step3);
    }
    return teacher.wrong();
  }
};

teacher.step3 =
{
  index: 3,
  start: function() 
  {
    teacher.say([
        [3000, "There's a lot of information here"],
        [4000, "First, each row is called a <em>document</em>, each column a <em>field</em>"],
        [7000, "Every document has an <em>_id</em> field. You can use whatever unique value you want. We are using the default type (which conveniently has a timestamp embedded in it!)"],
        [6000, "We can filter our results by specifying a <em>selector</em> as the first parameter to <em>find</em>"],
        [7000, "A selector is a json object. If we wanted to find a unicorn named 'leto', we'd specify <em>{name: 'leto'}</em> as our first parameter"],
        [4000, "Can you find all female unicorns?"],
    ], teacher.waitingAnswer);
    
  },
  help: function()
  {
    return "Enter <strong>db.unicorns.find({gender: 'f'});</strong>";
  },
  finish: function(r, c)
  {
    if (teacher.commandFor(c, 'find', 'unicorns') && c._selector && c._selector.gender == 'f' && Object.size(c._selector) == 1)
    {
      return teacher.step(teacher.step4);
    }
    return teacher.wrong();
  }
};

teacher.step4 =
{
  index: 4,
  start: function() 
  {
    teacher.say([
        [1000, "Nice"],
        [5000, "There are many conditional operators, such as <em>$lt</em> (less than) and <em>$gte</em> (greater than or equal)"],
        [6000, "We could find all unicorns with less than 100 vampire kills using <em>{vampires: {$lt: 100}}</em>"],
        [8000, "This is a tricky one but...can you <em>find</em> all male unicorns that weigh over 600 lbs?"]
    ], teacher.waitingAnswer);
  },
  help: function()
  {
    return "Enter <strong>db.unicorns.find({gender: 'm', weight: {$gt: 600}});</strong>";
  },
  finish: function(r, c)
  {
    if (teacher.commandFor(c, 'find', 'unicorns') && c._selector && c._selector.gender == 'm' && c._selector.weight && c._selector.weight['$gt'] == 600 && Object.size(c._selector) == 2)
    {
      return teacher.step(teacher.step5);
    }
    if (teacher.commandFor(c, 'find', 'unicorns') && c._selector && c._selector.gender == 'm' && c._selector.weight && c._selector.weight['$gte'] == 601 && Object.size(c._selector) == 2)
    {
      teacher.say([[2000, "Right, but you have to be difficult, don't you?"]])
      return teacher.step(teacher.step5);
    }
    return teacher.wrong();
  }
};

teacher.step5 =
{
  index: 5,
  start: function() 
  {
    teacher.say([
        [4000, "Great work! <em>find</em> takes a 2nd argument: the fields to return"],
        [5000, "So if we only wanted names and weight, we could pass <em>{name: 1, weight:1}</em>"],
        [6000, "Go ahead and try, <em>find</em> all unicorns <em>names</em> and <em>weight</em> (using <em>{}</em> or <em>null</em> as the first parameter)"]
    ], teacher.waitingAnswer);
  },
  help: function()
  {
    return "Enter <strong>db.unicorns.find(null, {name: 1, weight:1});</strong>";
  },
  finish: function(r, c)
  {
    if (teacher.commandFor(c, 'find', 'unicorns') && (c._selector == null || Object.size(c._selector) == 0) && c._fields && c._fields.name == 1 && c._fields.weight == 1 && Object.size(c._fields) == 2)
    {
      return teacher.step(teacher.step6);
    }
    return teacher.wrong();
  }
};

teacher.step6 =
{
  index: 6,
  start: function() 
  {
    teacher.say([
        [4000, "Even if you don't specify it, the <em>_id</em> is always returned"],
        [4000, "Speaking of <em>_id</em>, it's of type <em>ObjectId</em>"],
        [5000, "You can select by <em>ObjectId</em> using <em>{field: ObjectId('XYZ')}</em>"],
        [3000, "Let's do something more interesting though"],
        [8000, "<em>find</em>'s execution is delayed until necessary, which means we can chain methods, such as <em>sort</em>, <em>limit</em>, <em>skip</em> and <em>explain</em>"],
        [8000, "So we could sort by name and age using <em>db.unicorns.find().sort({name:1, age:-1})</em>. 1 is for ascending, -1 for descending"],
        [5000, "Or limit our results to 5 documents using <em>db.unicorns.find().limit(5)</em>"],
        [7000, "Here's a tricky one: get only the names of the 2nd and 3rd heaviest male unicorns"]
    ], teacher.waitingAnswer);
  },
  help: function()
  {
    return "Enter <strong>db.unicorns.find({gender: 'm'}, {name: 1}).sort({weight:-1}).limit(2).skip(1);</strong>";
  },
  finish: function(r, c)
  {
    if (teacher.commandFor(c, 'find', 'unicorns') 
        && c._selector  && c._selector.gender == 'm' && Object.size(c._selector) == 1 
        && c._fields && c._fields.name == 1 && (Object.size(c._fields) == 1 || (Object.size(c._fields) == 2 && c._fields['_id'] == 0))
        && c._sort && c._sort.weight == -1 && Object.size(c._sort) == 1
        && c._limit == 2 && c._skip == 1)
    {
      return teacher.step(teacher.step7);
    }
    return teacher.wrong();
  }
};

teacher.step7 =
{
  index: 7,
  start: function() 
  {
    teacher.say([
        [3000, "You have just BLOWN my mind"],
        [6000, "The <em>selector</em> parameter that you pass to <em>find</em> can be used in a number of places"],
        [3000, "For example, we can use it with <em>count</em>"],
        [4000, "How many unicorns weigh less than 600 lbs?"]
    ], teacher.waitingAnswer);
  },
  help: function()
  {
    return "Enter <strong>db.unicorns.count({weight: {$lt: 600}});</strong>";
  },
  finish: function(r, c)
  {
    if (teacher.commandFor(c, 'count', 'unicorns') && c._selector  && c._selector.weight && c._selector.weight['$lt'] == 600 && Object.size(c._selector) == 1)
    {
      return teacher.step(teacher.step8);
    }
    if (teacher.commandFor(c, 'count', 'unicorns') && c._selector  && c._selector.weight && c._selector.weight['$lte'] == 599 && Object.size(c._selector) == 1)
    {
      teacher.say([[2000, "Technically you're wrong, but whatever"]]);
      return teacher.step(teacher.step8);
    }
    return teacher.wrong();
  }
};

teacher.step8 =
{
  index: 8,
  start: function() 
  {
    teacher.say([
        [7000, "That's right! So far we've only looked at getting data from MongoDB, but once you understand that, you're half way through the basics"],
        [5000, "You should know that we're looking at the most basic way developers interact with MongoDB"],
        [5000, "Most frameworks have libraries which wrap all of this into something more natural"],
        [6000, "For example, Rails developers get implementations which follow ActiveRecord, and .NET developers get LINQ implementation"],
        [5000, "But it's always good to understand the fundamentals, so let's move on to some other commands"],
        [6000, "Remember, you can always skip to this next lesson by entering <strong>lesson(9);</strong>, so close your browser and take a longer break if you want"]
    ], function(){teacher.step(teacher.step9)});
  },
  help: function()
  {
    return "There's nothing to do. You can always enter <strong>lesson(9);</strong> to skip this";
  },
  finish: function(r, c)
  {   
    teacher.step(teacher.step9)
  }
};

teacher.step9 =
{
  index: 9,
  start: function() 
  {
    teacher.say([
        [3000, "All of our data is very structured: every document has the same fields"],
        [2000, "But in MongoDB this isn't a requirement"],
        [7000, "A new unicorn was just born, but all we know is its name <em>Lois</em>, gender <em>f</em> and that it has <em>0</em> vampire kills"],
        [4000, "Since we don't have an exact DOB or weight, we'll leave that data out for now"],
        [4000, "The <em>insert</em> command is used to add new documents to a collection"],
        [4000, "It takes a single argument: the json object we want to insert. Go ahead and try"]
    ], teacher.waitingAnswer);
  },
  canExecute: function(c)
  {
    return teacher.step9.isValid(c);
  },
  help: function()
  {
    return "Enter <strong>db.unicorns.insert({name: 'Lois', gender: 'f', vampires:0});</strong>";
  },
  finish: function(r, c)
  {   
    if (teacher.step9.isValid(c))
    {
      teacher.step9.loisId = r['$oid'];
      return teacher.step(teacher.step10);
    }
    return teacher.wrong();
  },
  getLoisId: function()
  {
    if (!teacher.step9.loisId)
    {
      executor.sendCommand(db['unicorns'].find({name: 'Lois'}, {_id: true}), function(r){
        teacher.step9.loisId = r.documents[0]['_id']['$oid'];
      }, function(){}, false)
    }
    if (!teacher.step9.loisId)
    {
      executor.sendCommand(db['unicorns'].find({weight: 55}, {_id: true}), function(r){
        teacher.step9.loisId = r.documents[0]['_id']['$oid'];
      }, function(){}, false)
    }
    return teacher.step9.loisId;
  },
  isValid: function(c)
  {
   return teacher.commandFor(c, 'insert', 'unicorns') && c._object  && c._object.name == 'Lois' && c._object.gender == 'f' && c._object.vampires === 0 && Object.size(c._object) == 3;
  }
};

teacher.step10 =
{
  index: 10,
  start: function() 
  {
    teacher.say([
        [1000, "Let's look at the result"]
    ], teacher.step10.alpha);
  },
  help: function()
  {
    return "there should be nothing to do";
  },
  alpha: function()
  {
    executor.rawExecute("db.unicorns.find({name: 'Lois'});")
  },
  finish: function(r, c)
  {
    teacher.step(teacher.step11);
  }
};

teacher.step11 =
{
  index: 11,
  start: function() 
  {
    teacher.say([
        [7000, "The conditional <em>$exists</em> operator can be used to find documents by the presence (or lack) of fields, like so: <em>{weight: {$exists: true}}</em>"],
        [5000, "We just got word that Lois weighs a healthy 55 pounds. Let's see about updating her record"],
        [6000, "The <em>update</em> command takes at least 2 parameter: the selector we want to update, and the updated value"],
        [7000, "We could select the Lois document a couple different ways, but let's go by id, using <em>{_id: ObjectId('" + teacher.step9.getLoisId() + "')}</em> as the first argument"],
        [5000, "For our second argument we'll simply try setting <em>{weight: 55}</strong>. Go ahead and try"]
    ], teacher.waitingAnswer);
  },
  help: function()
  {
    return "Enter <strong>db.unicorns.update({_id: ObjectId('" + teacher.step9.getLoisId() + "')}, {weight:55});</strong>";
  },
  canExecute: function(c)
  {
    return teacher.step11.isValid(c);
  },
  finish: function(r, c)
  {   
    if (teacher.step11.isValid(c))
    {
      return teacher.step(teacher.step12);
    }
    return teacher.wrong();
  },
  isValid: function(c)
  {
   return teacher.commandFor(c, 'update', 'unicorns') && teacher.isId(c._selector, '_id', teacher.step9.getLoisId()) && Object.size(c._selector) == 1 && c._values && c._values.weight == 55 && Object.size(c._values) == 1;
  }
};

teacher.step12 =
{
  index: 12,
  start: function() 
  {
    teacher.say([
        [1000, "Let's look at the result"]
    ], teacher.step12.alpha);
  },
  help: function()
  {
    return "there should be nothing to do";
  },
  alpha: function()
  {
    executor.rawExecute("db.unicorns.find({weight: 55});")
  },
  finish: function(r, c)
  {
    teacher.step(teacher.step13);
  }
};

teacher.step13 =
{
  index: 13,
  start: function() 
  {
    teacher.say([
        [4000, "Well, something's not right, we lost the name, gender and vampire kill counter"],
        [5000, "Ah, right, it turns out that <em>update</em> updates the entire document with the new value"],
        [6000, "To update a single field, we either specify the entire document again, or use the <em>$set</em> operator"],
        [5000, "Let's fix our mistake by doing another update and using <em>$set</em> for the removed fields"],
        [6000, "So, we'll do <em>db.unicorns.update({_id: ObjectId('" + teacher.step9.getLoisId() + "')}, {$set: {name: 'Lois', ...}});</em>"],
        [3000, "Go ahead, figure out the rest"]
    ], teacher.waitingAnswer);
  },
  help: function()
  {
    return "Enter <strong>db.unicorns.update({_id: ObjectId('" + teacher.step9.getLoisId() + "')}, {$set: {name: 'Lois', gender: 'f', vampires: 0}});</strong>";
  },
  canExecute: function(c)
  {
    return teacher.step13.isValid(c);
  },
  finish: function(r, c)
  {   
    if (teacher.step13.isValid(c))
    {
      return teacher.step(teacher.step14);
    }
    return teacher.wrong();
  },
  isValid: function(c)
  {
   return teacher.commandFor(c, 'update', 'unicorns') && teacher.isId(c._selector, '_id', teacher.step9.getLoisId()) && Object.size(c._selector) == 1 && c._values && c._values['$set'] && c._values['$set'].name == 'Lois' && c._values['$set'].gender == 'f' && c._values['$set'].vampires == 0 && Object.size(c._values) == 1;
  }
};

teacher.step14 =
{
  index: 14,
  start: function() 
  {
    teacher.say([
       [6000, "Perfect. You'll be glad to know that MongoDB is able to do an <em>upsert</em>, by setting the optional 3rd parameter to true"],
       [5000, "An upsert will either update the document if found or it'll insert it"],
       [6000, "Upserts are particularly powerful with some of the atomic operators like <em>$inc</em> and <em>$push</em>"],
       [2000, "Let's try it out quickly"],
       [7000, "Do an <em>update</em> with a selector of <em>{name: 'Ulysee'}</em> a value of <em>{$inc: {vampires: 1}}</em> and the 3rd parameter (upsert) set to <em>true</em>"]
    ], teacher.waitingAnswer);
  },
  help: function()
  {
    return "Enter <strong>db.unicorns.update({name: 'Ulysee'}, {$inc: {vampires: 1}}, true);</strong>";
  },
  canExecute: function(c)
  {
    return teacher.step14.isValid(c);
  },
  finish: function(r, c)
  {   
    if (teacher.step14.isValid(c))
    {
      return teacher.step(teacher.step15);
    }
    return teacher.wrong();
  },
  isValid: function(c)
  {
   return teacher.commandFor(c, 'update', 'unicorns') && c._selector && c._selector.name == 'Ulysee' && Object.size(c._selector) == 1 && c._values && c._values['$inc'] && c._values['$inc'].vampires == 1 && Object.size(c._values) == 1;
  }
};

teacher.step15 =
{
  index: 15,
  start: function() 
  {
    teacher.say([
        [1000, "Let's look at the result"]
    ], teacher.step15.alpha);
  },
  help: function()
  {
    return "There should be nothing to do";
  },
  alpha: function()
  {
    executor.rawExecute("db.unicorns.find({name: 'Ulysee'});")
  },
  finish: function(r, c)
  {   
    return teacher.step(teacher.step16);
  }
};

teacher.step16 =
{
  index: 16,
  start: function() 
  {
    teacher.say([
        [3000, "Notice how a new document for Ulysee was added"],
        [2000, "Now, execute the same command"]
    ], teacher.waitingAnswer);
  },
  canExecute: function(c)
  {
    return teacher.step16.isValid(c);
  },
  help: function()
  {
    return "Enter <strong>db.unicorns.update({name: 'Ulysee'}, {$inc: {vampires: 1}}, true);</strong>";
  },
  finish: function(r, c)
  {   
    if (teacher.step16.isValid(c))
    {
      return teacher.step(teacher.step17);
    }
    return teacher.wrong();
  },
  isValid: function(c)
  {
   return teacher.commandFor(c, 'update', 'unicorns') && c._selector && c._selector.name == 'Ulysee' && Object.size(c._selector) == 1 && c._values && c._values['$inc'] && c._values['$inc'].vampires == 1 && Object.size(c._values) == 1;
  }
};

teacher.step17 =
{
  index: 17,
  start: function() 
  {
    teacher.say([
        [1000, "Again, let's look at the result"]
    ], teacher.step17.alpha);
  },
  alpha: function()
  {
    executor.rawExecute("db.unicorns.find({name: 'Ulysee'});")
  },
  help: function()
  {
    return "There should be nothing to do";
  },
  finish: function(r, c)
  {   
    return teacher.step(teacher.step18);
  }
};

teacher.step18 =
{
  index: 18,
  start: function() 
  {
    teacher.say([
        [3000, "Notice that rather than inserting a new document, the existing one was updated"],
        [2000, "Update has a 4th parameter which is rather peculiar"],
        [4000, "By default, update will only update a single document, even if the selector matches multiple documents"],
        [5000, "To change this, we pass <em>true</em> as our forth parameter to allow multiple updates"],
        [6000, "Let's try it by using the <em>$push</em> operator to add <em>orange</em> as a food all <em>male</em> unicorns love"]
    ], teacher.waitingAnswer);
  },
  help: function()
  {
    return "Enter <strong>db.unicorns.update({gender: 'm'}, {$push: {loves: 'orange'}}, false, true);</strong>";
  },
  finish: function(r, c)
  {   
    if (teacher.step18.isValid(c))
    {
      return teacher.step(teacher.step19);
    }
    return teacher.wrong();
  },
  canExecute: function(c)
  {
    return teacher.step18.isValid(c);
  },
  isValid: function(c)
  {
   return teacher.commandFor(c, 'update', 'unicorns') && c._selector && c._selector.gender == 'm' && Object.size(c._selector) == 1 && c._values && c._values['$push'] && c._values['$push']['loves'] == 'orange' && Object.size(c._values) == 1 && c._multiple == true;
  }
};

teacher.step19 =
{
  index: 19,
  start: function() 
  {
    teacher.say([
        [1000, "Perfect"],
        [2500, "The last command we'll look at is <em>remove</em>"],
        [5000, "Remove is easy, it takes a single optional parameter: the <em>selector</em> which determines which documents to remove"],
        [3000, "Passing null or an empty selector removes all documents"],
        [3000, "Go ahead and remove whichever unicorn displeases you most"]
    ], teacher.waitingAnswer);
  },
  help: function()
  {
    return "Enter <strong>db.unicorns.remove({name: 'Kenny'});</strong>";
  },
  finish: function(r, c)
  {   
    if (teacher.step19.isValid(c))
    {
      if (c._selector == null || Object.size(c._selector) == 0)
      {
        teacher.say([[1000, "Ohh...tough guy"]]);
      }
      return teacher.step(teacher.step20);
    }
    return teacher.wrong();
  },
  canExecute: function(c)
  {
    return teacher.step19.isValid(c);
  },
  isValid: function(c)
  {
   return teacher.commandFor(c, 'remove', 'unicorns') ;
  }
};

teacher.step20 =
{
  index: 20,
  start: function() 
  {
    teacher.say([
        [1000, "Bravo!"],
        [3000, "Hopefully you learnt something about MongoDB and Unicorns"],
        [5000, "There's a lot we didn't cover, like embedded documents, aggregation, indexes, management, etc"],
        [4000, "But the idea was to help get you confortable with the basics "],
        [4000, "Feel free to play around, insert new data, new combinations, and what not"],
        [6000, "Or, better yet, head over to <a href=\"http://www.mongodb.org/downloads\">the mongodb download</a> page, grab the version for your OS and experiment on your local machine"],
        [5000, "The precompiled binaries available for Linux, Windows and OS X make MongoDB extremely easy to get started with"],
        [4500, "Don't forget to check out my <a href=\"http://openmymind.net/2011/3/28/The-Little-MongoDB-Book\" target=\"_blank\">free MongoDB ebook</a>"],
        [1000, "You are now web scale"]
    ], teacher.waitingAnswer);
  },
  help: function()
  {
    return "Well done, you are finished!";
  },
  finish: function(r, c)
  {   
   
  },
};

$(document).keydown(function(e)
{
  if (e.ctrlKey && e.which == 190)
  {
    teacher.speedUp();
  }
  else if (e.ctrlKey && e.which == 188)
  {
    teacher.slowDown();
  }
});