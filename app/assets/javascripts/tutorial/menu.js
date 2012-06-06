var menu = 
{
  info:
  {
    context: function(type, context)
    {
      var text = context.host ? 'connected to: ' + context.host + ':' + context.port : 'click here to connect';
      $('#info').text(text);
    }
  },
  database:
  {
    change: function()
    {
      var value = $(this).val();
      if (!value){return;}
      executor.execute('use ' + value + ';');
    },
    context: function(type, context)
    {
      if (type != 'new') { return; } 

      var $database = $('#database');
      $database.children().remove();
      if (!context.databases || context.databases.length == 0) 
      { 
        $database.hide(); 
        return; 
      }

      $database.append($('<option>').attr('value', '').text('select a database'));
      for(var i = 0; i < context.databases.length; ++i)
      {
        $database.append($('<option>').text(context.databases[i]));
      }
      $database.show();
    }
  }
};
context.register(menu.info.context);
context.register(menu.database.context);