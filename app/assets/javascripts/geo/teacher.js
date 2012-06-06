function help()
{
  $('#results').html('<div id="help"><p>' + teacher.currentStep.help() + "</p><br/><br/>or<br/><br/><p>Type <strong>restart</strong> to start this tutorial over</p><p><strong>lesson(X)</strong> to jump to lesson # X</p><p><strong>ctrl,</strong> to slow things down</p><p><strong>ctrl.</strong> to speed things up</p><p>You can also click the speed button in the upper right to change the speed<p></div>");
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
  teacher.start(step); 
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
  specialHandling: function(command)
  {
    return teacher.currentStep.specialHandling && teacher.currentStep.specialHandling(command);
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
      var value = lecture[i++][1];
      if (typeof value == 'function') { value(); }
      else { $('#history').inputHistory({command: 'add', type: 'teach', html: value}); }
      
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
      [4000, "Welcome to a quick 5 minute interactive MongoDB Geospatial Tutorial. In this tutorial you'll learn about MongoDB's great geospatial capabilities"],
      [3500, "At any point, you can get help by entering <strong>help</strong>"],
      [4500, "If you are new to MongoDB, you might want to check out the <a href=\"/tutorial/index\">MongoDB Interactive Tutorial</a> first"],
      [4500, "I also wrote a free ebook you might be interested in: <a href=\"http://openmymind.net/2011/3/28/The-Little-MongoDB-Book\" target=\"_blank\">The Little MongoDB Book</a>"],
      [2000, "Let's start"],
      [3500, "MongoDB's geospatial features let you find documents based on coordiates (x,y)"],
      [500, "In the bottom right you see a 50x50 grid. <span style=\"color:#f00\">0,0</span> is in the middle"],
      [3000, function(){grid.highlight([0,0], '#f00')}],
      [500, "The top left is <span style=\"color:#00f\">-25,-25</span>"],
      [3000, function(){grid.highlight([-25,-25], '#00f')}],
      [500, "The bottom right is <span style=\"color:#0f0\">24,24</span>"],
      [3000, function(){grid.highlight([24,24], '#0f0')}],
    ], function(){teacher.step(teacher.step1)});
  },
  help: function()
  {
    return "Just watch and enjoy the light show";
  }
};

teacher.step1 =
{
  index: 1,
  start: function()
  {
    teacher.say([
      [6000, "Don't get too excited, but we have a collection, called <strong>treasures</strong>, containing information on a bunch of treasures located in our grid."],
      [5000, "Go ahead and look at the collection"],
      [10, function(){grid.clear();}]
    ], teacher.awaitingAnswer);
  },
  help: function()
  {
    return "Enter <strong>db.treasures.find();</strong>";
  },
  specialHandling: function(c)
  {
    if (teacher.commandFor(c, 'find', 'treasures')) 
    { 
      teacher.step(teacher.step2);
    } else { teacher.wrong(); }
    return true;
  }
};

teacher.step2 =
{
  index: 2,
  start: function()
  {
    teacher.say([
      [3000, "HAHAHAHAH, you actually thought it would be that easy, didn't you?"],
      [4000, "Seriously though, I'll tell you that each document within <strong>treasures</strong> has a <strong>location</strong> field"],
      [4000, "The location value is a nested document. For example: <strong>{type: 'gold', location: {x: 20, y:-10}}</strong>"],
      [4000, "We could also have used an array <strong>{type: 'gold', location:[20,-10]}</strong>..same same"],
      [5000, "Anyways, to get MongoDB to treat these as coordinates, we must create a <storng>2d</strong> index on the field"],
      [5000, "By default, indexes use -180..180 (longitude/latitude), but we need -25..25, so, enter this:"],
      [1000, "<strong>db.treasures.ensureIndex({location: '2d'}, {min:-25, max:25});</strong>"]
    ], teacher.awaitingAnswer);
  },
  help: function()
  {
    return "Enter <strong>db.treasures.ensureIndex({location: '2d'}, {min:-25, max:25});</strong>";
  },
  specialHandling: function(c)
  {
    if (teacher.commandFor(c, 'ensureIndex', 'treasures')
        && c._fields && Object.size(c._fields) == 1 && c._fields['location'] == '2d'
        && c._options && Object.size(c._options) == 2 && c._options['max'] == 25 && c._options['min'] == -25) 
    { 
      teacher.step(teacher.step3);
    }
    else { teacher.wrong(); }
    return true;
  },
  finish: function(c)
  {
    return teacher.wrong();
  }
};

teacher.step3 =
{
  index: 3,
  start: function()
  {
    teacher.say([
      [1000, "Great work"],
      [5000, "What we want to do is use the <strong>$near</strong> conditional operator to <strong>find</strong> all the <strong>treasures</strong> near [20,-20]"],
      [2000, "Can you guess how to do that?"]
    ], teacher.awaitingAnswer);
  },
  help: function()
  {
    return "Enter <strong>db.treasures.find({location: {$near: [20, -20]}});</strong>";
  },
  finish: function(r, c)
  {
    if (teacher.commandFor(c, 'find', 'treasures') && Object.size(c._selector) == 1 && c._selector['location'] && c._selector['location']['$near'] && c._selector['location']['$near'][0] == 20 && c._selector['location']['$near'][1] == -20)
    {
      grid.displayResults(r.documents);
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
      [4000, "MongoDB automatically sorts the results from closest to farthest. Neat, huh?"],
      [5000, "2d indexes can participate in compound indexes. Let me change the index to also include <strong>type</strong>"],
      [1000, "First, we drop it"],
    ], teacher.step4.alpha);
  },
  help: function()
  {
    return "there should be nothing to do";
  },
  alpha: function()
  {
    executor.rawExecute("db.treasures.dropIndexes();")
  },
  finish: function()
  {
    return teacher.step(teacher.step5);
  }
};

teacher.step5 =
{
  index: 5,
  start: function()
  {
    teacher.say([
      [1000, "Next we re-create it"]
    ], teacher.step5.alpha);
  },
  help: function()
  {
    return "there should be nothing to do";
  },
  alpha: function()
  {
    executor.rawExecute("db.treasures.ensureIndex({location: '2d', type: 1}, {min:-25, max:25});")
  },
  finish: function()
  {
    return teacher.step(teacher.step6);
  }
};

teacher.step6 =
{
  index: 6,
  start: function()
  {
    teacher.say([
      [4000, "Now queries involving both <strong>location</strong> and <strong>type</strong> will be faster than fast"],
      [3000, "Using <strong>$near</strong> automatically limits results to 100 records"],
      [3000, "How would you only get the 5 nearest <strong>gold</strong> treasures from the center?"],
    ], teacher.awaitingAsnwer);
  },
  help: function()
  {
    return "Enter <strong>db.treasures.find({location: {$near: [0, 0]}, type: 'gold'}).limit(5);</strong>";
  },
  finish: function(r, c)
  {
    if (teacher.commandFor(c, 'find', 'treasures') && Object.size(c._selector) == 2 
        && c._selector['location'] && c._selector['location']['$near'] && c._selector['location']['$near'][0] == 0 && c._selector['location']['$near'][1] == 0
        && c._selector['type'] == 'gold' && c._limit && c._limit == 5)
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
      [3000, "Well done. Just a few more things to look at before we are done"],
      [4000, "First, in additional to <strong>$near</strong>, we can specify <strong>$maxDistance</strong>"],
      [3000, "So, to get all the treasure within a distance of 10 from [0,0], you would...?"],
    ], teacher.awaitingAsnwer);
  },
  help: function()
  {
    return "Enter <strong>db.treasures.find({location: {$near: [0, 0], $maxDistance: 10}});</strong>";
  },
  finish: function(r, c)
  {
    if (teacher.commandFor(c, 'find', 'treasures') && Object.size(c._selector) == 1
        && c._selector['location'] && c._selector['location']['$near'] && c._selector['location']['$near'][0] == 0 && c._selector['location']['$near'][1] == 0
        && c._selector['location']['$maxDistance'] == 10)
    {
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
      [1000, "Good job"],
      [3500, "We can also use <strong>$within</strong> to limit our search inside a <strong>box</strong> or a <strong>circle</strong>"],
      [3000, "To use a box, we specify the top-left and lower-right corners"],
      [6000, "For example, <strong>db.treasures.find({location: {$within: {$box: [[-20, -20], [-10, -10]]}}});</strong> would find treasures in the top-left quadrant"],
      [5000, "For a circle, you specify a <strong>$center</strong> with a specific point and a radius, like <strong>$center: [[0,0], 10]</strong>"],
      [3000, "Go ahead and find all treasures centered at -5,-7 with a radius of 11"]
    ], teacher.awaitingAsnwer);
  },
  help: function()
  {
    return "Enter <strong>db.treasures.find({location: {$within: {$center: [[-5, -7], 11]}}});</strong>";
  },
  finish: function(r, c)
  {
    if (teacher.commandFor(c, 'find', 'treasures') && Object.size(c._selector) == 1
        && c._selector['location'] && c._selector['location']['$within'] && c._selector['location']['$within']['$center']
        && c._selector['location']['$within']['$center'][0][0] == -5 && c._selector['location']['$within']['$center'][0][1] == -7
        && c._selector['location']['$within']['$center'][1] == 11)
    {
      return teacher.step(teacher.step9);
    }
    return teacher.wrong();
  }
};

teacher.step9 =
{
  index: 9,
  start: function()
  {
    teacher.say([
      [1000, "And that, is that."],
      [3500, "There's a bit more to MongoDB's geospatial capabilities that what we've seen here"],
      [4000, "If you are interested, head over to the <a href=\"http://www.mongodb.org/display/DOCS/Geospatial+Indexing\">geospatial indexing</a> page"],
      [6000, "Or, better yet, head over to <a href=\"http://www.mongodb.org/downloads\">the mongodb download</a> page, grab the version for your OS and experiment on your local machine"],
      [5000, "The precompiled binaries available for Linux, Windows and OS X make MongoDB extremely easy to get started with"],
      [4500, "Don't forget to check out my <a href=\"http://openmymind.net/2011/3/28/The-Little-MongoDB-Book\" target=\"_blank\">free MongoDB ebook</a>"],
      [1000, "You are now web scale"]
    ], teacher.awaitingAsnwer);
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