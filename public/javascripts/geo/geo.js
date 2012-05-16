$(document).ready(function()
{
	grid.initialize($('#location'));

  var $history = $('#history');
  var $input = $('#input').commandInput({trigger: executor.execute, history: $history});
  var $history = $history.inputHistory({target: $input});
  $('#pager').pager({});
  
  $(window).resize(setHeight);
  setHeight();
  function setHeight()
  {
    var height = $(window).height() - $('#menu').height() - $input.height() - 30;
    $('#results').height(height - $('#history').height()-10);
    $('#input').width(document.body.clientWidth - 30);	
    $('#results').width(document.body.clientWidth - 425);
  };
  
  $('#speed').click(function()
  {
    $('#speedChoice').toggle();
  });
  
  $('#speedChoice li').click(function()
  {
    teacher.changeSpeed($(this).text());
    $('#speedChoice').hide();
  });
});

var grid = 
{
  $table: null,
  $cells: null,
  initialize: function($table)
  {
    grid.$table = $table;
    grid.buildGrid();
    grid.$cells = $table.find('td');
    $table.delegate('td', 'mouseenter', grid.tdMouseEnter)
          .delegate('td', 'mouseleave', grid.tdMouseLeave);
  },
  buildGrid : function()
  {
    var table = grid.$table[0];
    for(var i = 0; i < 50; ++i)
    {
      var row = table.insertRow(0);
      for(var j = 0; j < 50; ++j)
      {
        var cell = row.insertCell(0);
      }
    }
  },
  tdMouseEnter: function()
  {
    var $td = $(this).addClass('active');
    var index = grid.$cells.index($td);
  },
  tdMouseLeave: function()
  {
    var $td = $(this).removeClass('active');
  },
  highlight: function(location, color)
  {
    var index = grid.locationToIndex(location);
    var $cell = grid.$cells.filter(':eq(' + index + ')');
    $cell.animate({backgroundColor: color}, 500, function(){
      $cell.animate({backgroundColor: '#fff'}, 500, function(){
        $cell.animate({backgroundColor: color}, 500, function(){
          $cell.animate({backgroundColor: '#fff'}, 500, function(){
            $cell.animate({backgroundColor: color}, 500);
          })
        });
      })
    });
  },
  locationToIndex: function(location)
  {
    return (location[0] + 25) + (location[1]+25) * 50;
  },
  indexToLocation: function(index)
  {
    var y = Math.floor(index / 50) - 25;
    var x = index % 50 - 25;
    return x + ',' + y;
  },
  clear: function()
  {
    grid.$cells.css('backgroundColor', '');
  },
  displayResults: function(r)
  {
    grid.$cells.removeClass('gold silver copper coal');
    for(var i = 0; i < r.length; ++i)
    {
      var doc = r[i];
      var index = grid.locationToIndex([doc.location.x, doc.location.y]);
      $(grid.$cells[index]).addClass(doc.type);
    }
  }
}

