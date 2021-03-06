(function($) {
  var defaults = {trigger: null, singleLineHeight: 15, history: null};
  $.fn.commandInput = function(opts) 
  {
    if (opts && opts.command == 'set')
    {
      return this.each(function(){ this.commandInput.set(opts.text); });
    }
    if (opts && opts.command == 'unlock')
    {
      return this.each(function(){ this.commandInput.unlock(); });
    }
    var options = $.extend({}, defaults, opts); 
    return this.each(function() 
    {
      if (this.commandInput) { return false; }
      var input = this;
      var $input = $(input);
      var self =
      {
        initialize: function() 
        {
          $input.keydown(self.keyPressed)
            .bind('adjust', function(){self.adjust(0);})
            .bind('trigger', self.triggered);
        },
        keyPressed: function(e)
        {
          if (self.shouldSubmit(e)) { return self.triggered(); }
          if (e.which == 13) { return false; }
          if (e.which == 38) { return self.selectPrevious(); }
          if (e.which == 40) { return self.selectNext(); }
          return true;
        },
        shouldSubmit: function(e)
        {
          if (e.which != 13 || $input.val().length == 0) { return false; }
          return true;
        },
        triggered: function()
        {
          if (options.trigger($input.val())) { $input.addClass('processing'); }
          else { self.clear(); }
          return false;
        },
        clear: function()
        {
          $input.val('')
          self.adjust(0);
        },
        adjust: function(offset)
        {
          $input.height(options.singleLineHeight * ($input.val().split('\n').length + offset));
        },
        unlock: function()
        {
          $input.removeClass('processing');
          self.clear();
        },
        set: function(text)
        {
          $input.val(text);
          self.adjust(0);
          $input.focus();
          $input.setSelectionRange(text.length,text.length);
        },
        selectPrevious: function()
        {
          var firstNewLine = $input.val().indexOf('\n'); 
          if (firstNewLine != -1 && firstNewLine <= $input.selectionStart()) { return true; }
          options.history.inputHistory({command: 'selectPrevious'});
          return false;
        },
        selectNext: function()
        {
          if ($input.val().indexOf('\n', $input.selectionStart()) != -1) { return true; }
          options.history.inputHistory({command: 'selectNext'});
          return false;
        },
      };
      this.commandInput = self;
      self.initialize();
    });
  };
})(jQuery);
