$(document).ready(function()
{
  var $history = $('#history');
  var $input = $('#input').commandInput({trigger: executor.execute, history: $history});
  var $history = $history.inputHistory({target: $input});
  $('#pager').pager({});
  $('#collections').delegate('li', 'click', explorer.collections.clicked);
  
  $(window).resize(setHeight);
  setHeight();
  function setHeight()
  {
    var height = $(window).height() - $('#menu').height() - $input.height() - 30;
    $('#explorer').height(height);
    $('#results').height(height - $('#history').height()-10);
    $input.width($history.width()-20);
  };
  
  $('#toggleExplorer div').click(explorer.toggle);
});var executor = 
{
  invalid: {},
  rawExecute: function(command)
  {
    $('#input').val(command).trigger('trigger');
  },
  execute: function(text)
  {
    var command = executor.getCommand(text);
    if (command == executor.invalid)
    {
      $('#history').inputHistory({command: 'add', type: 'error', text: text})
      return;
    }
    if (!command || !command.mongo_serialize)
    {
      if (command == executor.useDb) { return; }
      if (command == help || command == reset || command == restart) { command(); return; }
      $('#history').inputHistory({command: 'add', type: 'ok', text: text})
      return;      
    }
    if (!teacher.canExecute(command)) 
    { 
      $('#history').inputHistory({command: 'add', type: 'error', text: text})
      return; 
    }
    var start = new Date();
    executor.sendCommand(command, function(r)
    {
      executor.executed('ok', command.response(r), start, r, command);
    },function(r)
    {
      executor.executed('error', renderer.single(r.responseText), start);
    }, true);
    return true;
  },
  sendCommand: function(command, success, error, async)
  {
     var parameters = command.mongo_serialize();
     parameters['authenticity_token'] = authenticity_token;
     $.ajax(
     {
       url: '/' + parameters['endpoint'] + '/' + parameters['command'],
       type: 'POST',
       async: async,
       contentType: 'application/json',
       data: JSON.stringify(parameters),
       dataType: 'json',
       success: success,
       error: error,
     });    
  },
  getCommand: function(text)
  {
    for(var i = 0; i < executor.specials.length; ++i)
    {
      var matches = executor.specials[i].exec(text);
      if (matches != null)
      {
        var callback =  executor.callbacks[i];
        return (callback.loadParams) ? callback.loadParams(matches) : callback;
      }
    }
    try { with(window){ return eval(text)}; }
    catch(error) 
    { 
      if (console && console.log) { console.log(error); }
      return executor.invalid;  
    }
  },
  
  executed: function(status, value, start, response, command)
  {
    var $input = $('#input');
    var text = $input.val(); 
    if (!text) { return; } 
    $input.commandInput({command: 'unlock'});
    $('#history').inputHistory({command: 'add', type: status, text: text, time: new Date() - start + ' ms'});
    if (!(value instanceof jQuery) || !value.is('#grid'))
    {
      $('#pager').hide(); 
    }
    $('#results').html(value);
    $('#input').focus();
    teacher.got(response, command);
  },
  useDb:
  {
    loadParams: function(params)
    {
      this._name = params[1];
      return this;
    }
  },
  clear:
  {
    mongo_serialize: function() {return {endpoint: 'database', command: 'noop' } },
    response: function(r) { return '';}
  },
};
executor.specials = [/clear(\(\);?)?/, /show dbs;?/, /show collections;?/, /use (\w+);?/, /help/, /reset/, /restart/, /lesson(\d+);?/]; 
executor.callbacks = [executor.clear, db.listDatabases(), db.getCollectionNames(), executor.useDb, help, reset, restart, lesson];