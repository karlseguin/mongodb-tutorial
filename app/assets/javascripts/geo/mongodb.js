function ObjectId(value)
{
  return {$oid: value};
};
Date.prototype.to_mongo = function()
{
  return {$date: this.getTime()/1000};
};
var db = 
{
  __context: function(type, context)
  {
    db['treasures'] = new collection('treasures');
  },
  __clear: function()
  {
    for(var property in db)
    {
      if (typeof db[property] == 'object') { delete db[property]; }
    }
  },
  getCollectionNames: function()
  {
    return new function()
    {
      this.mongo_serialize = function() { return {endpoint: 'database', command: 'collections'} };
      this.response = function(collections) { return renderer.simpleList(collections); }
    };
  },
  stats: function()
  {
    return new function()
    {
      this.mongo_serialize = function() { return {endpoint: 'database', command: 'stats'} };
      this.response = function(r) { return $.resultGrid.display({documents: r}, null); };
    };    
  },
  getLastError: function()
  {
    return new function()
    {
      this.mongo_serialize = function() { return {endpoint: 'database', command: 'get_last_error'} };
      this.response = function(r) { return $.resultGrid.display({documents: r}, null); };
    };    
  },
  toSelector: function(selector)
  {
    for(var property in selector)
    {
      if (selector.hasOwnProperty(property))
      {
        var value = selector[property];
        if (value.to_mongo)
        {
          selector[property] = value.to_mongo();
        }
        else if (typeof value == 'object')
        {
          db.toSelector(value);
        }
      }
    }
    return selector;
  }
};

context.register(db.__context)

function collection(name)
{
  this._name = name;
  this.find = function(selector, fields)
  {
    return new collection_find(selector, fields, this);
  };
  this.count = function(selector)
  {
    return new collection_count(selector, this);
  };
  this.stats = function()
  {
    return new collection_stats(this);
  };
  this.getIndexes = function()
  {
    return new collection_getIndexes(this);
  };
  this.dropIndexes = function()
  {
    return new collection_dropIndexes(this);
  };
  this.ensureIndex = function(fields, options)
  {
    return new collection_ensureIndex(fields, options, this);
  };
  this.distinct = function(field, query)
  {
    return new collection_distinct(field, query, this);
  };
};

function collection_find(selector, fields, collection)
{
  this._selector = selector;
  this._fields = fields;
  this._collection = collection;
  this._explain = false;
  
  this.teacherName  = function()
  {
    return 'find';
  };
  this.limit = function(limit)
  {
    this._limit = limit;
    return this;
  };
  this.sort = function(sort)
  {
    this._sort = sort;
    return this;
  };
  this.skip = function(skip)
  {
    this._skip = skip;
    return this;
  };
  this.explain = function()
  {
    this._explain = true;
    return this;
  };
  this.mongo_serialize = function()
  {
    return {endpoint: 'geo', command: 'find', collection: this._collection._name, selector: db.toSelector(this._selector), fields: this._fields, limit: this._limit, sort: this._sort, skip: this._skip, explain: this._explain};
  };
  this.response = function(r) 
  { 
    grid.displayResults(r.documents);
    return $.resultGrid.display(r, this.mongo_serialize()); 
  };
};

function collection_count(selector, collection)
{
  this._selector = selector;
  this._collection = collection;

  this.teacherName  = function()
  {
    return 'count';
  };
  this.mongo_serialize = function()
  {
    return {endpoint: 'geo', command: 'count', collection: this._collection._name, selector: db.toSelector(this._selector)};
  };

  this.response = function(r, command)
  {
    var document = r.count == 1 ? ' document' : ' documents';
    return renderer.single(r.count + document + ' in ' + this._collection._name);
  };
};

function collection_ensureIndex(fields, options, collection)
{
  this._fields = fields;
  this._options = options;
  this._collection = collection;

  this.teacherName  = function()
  {
    return 'ensureIndex';
  };
  this.mongo_serialize = function()
  {
    return {endpoint: 'geo', command: 'ensureIndex', collection: this._collection._name, fields: this._fields, options: this._options};
  };
  this.response = function(r) { return renderer.ok(); }; 
};

function collection_dropIndexes(collection)
{
  this._collection = collection;

  this.teacherName  = function()
  {
    return 'dropIndexes';
  };
  this.mongo_serialize = function()
  {
    return {endpoint: 'geo', command: 'dropIndexes', collection: this._collection._name};
  };
  this.response = function(r) { return renderer.ok(); }; 
};

function collection_stats(collection)
{
  this._collection = collection;
  this.mongo_serialize = function()
  {
    return {endpoint: 'geo', command: 'stats', collection: this._collection._name};
  };
  this.response = function(r) { return $.resultGrid.display({documents: r}, null); };
};

function collection_getIndexes(collection)
{
  this._collection = collection;
  this.mongo_serialize = function()
  {
    return {endpoint: 'geo', command: 'get_indexes', collection: this._collection._name};
  };
  this.response = function(r) { return $.resultGrid.display({documents: r}, null); }; 
};

function collection_distinct(field, query, collection)
{
  this._field = field;
  this._query = query;
  this._collection = collection;
  this.mongo_serialize = function()
  {
    return {endpoint: 'geo', command: 'distinct', field: this._field, query: this._query, collection: this._collection._name};
  };
  this.response = function(values) { return renderer.simpleList(values); };
};