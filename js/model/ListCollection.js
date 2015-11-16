/**
 * Created by meathill on 14-3-12.
 */
;(function (ns) {
  'use strict';
  var collections = {}
    , Model = Backbone.Model.extend({
      parse: function (response) {
        var key = this.key || (this.collection ? this.collection.key : 'data');
        if ('code' in response && 'msg' in response && key in response) {
          return response[key];
        }
        return response;
      },
      toJSON: function (options) {
        var json = Backbone.Model.prototype.toJSON.call(this, options);
        if (options) { // from sync，因为{patch: true}
          return json;
        }
        var previous = this.previousAttributes();
        if (!_.isEmpty(previous)) {
          json.previous = previous;
        }
        return _.extend(json, this.options, this.collection ? this.collection.options : null);
      }
    })
    , Collection = ns.ListCollection = Backbone.Collection.extend({
      cache: null,
      total: 0,
      pagesize: 10,
      isLoading: false,
      initialize: function(models, options) {
        this.key = options.key || 'data';
        this.save = tp.PROJECT + location.hash + '-pagesize';
        Backbone.Collection.prototype.initialize.call(this, models, options);
        if (_.isString(this.model)) { // 需要加载外部model类
          var klass = Nervenet.parseNamespace(this.model);
          if (klass) {
            this.model = klass;
          } else {
            var self = this;
            $.getScript(tp.component.Manager.getPath(this.model), function () {
              self.model = Nervenet.parseNamespace(self.model);
              if (!self.cache) {
                return;
              }
              if (self.cache.options.reset) {
                self.reset(self.cache.response, self.cache.options);
              } else {
                self.set(self.parse(self.cache.response), self.cache.options);
                self.trigger('sync');
              }
              self.cache = null;
            });
          }
        }
        if (!options) {
          return;
        }
        if (options.url) {
          this.url = options.url;
        }
        var size = localStorage.getItem(this.save);
        this.pagesize = size || options.pagesize || this.pagesize;
      },
      fetch: function (options) {
        if (this.isLoading) {
          return;
        }
        options = options || {};
        if (options.data) {
          options.data.pagesize = this.pagesize;
        } else {
          options.data = {pagesize: this.pagesize};
        }
        Backbone.Collection.prototype.fetch.call(this, options);
        this.isLoading = true;
      },
      parse: function (response, options) {
        this.isLoading = false;
        if (_.isString(this.model)) { // model的类还没加载进来
          this.cache = {
            response: response,
            options: options
          };
          return null;
        }
        this.total = _.isArray(response) ? response.length : response.total;
        if (response.options) {
          this.options = response.options;
        }
        for (var key in _.omit(response, 'total', 'list', 'options', 'code', 'msg')) {
          if (response.hasOwnProperty(key) && (_.isArray(response[key]) || _.isObject(response[key]))) {
            this.trigger('data:' + key, response[key]);
          }
        }
        return _.isArray(response) ? response : response.list;
      },
      getAmount: function (omits) {
        if (_.isString(omits)) {
          omits = omits.split(' ');
        }
        return this.reduce(function (amount, model) {
          var data = model.omit(omits);
          for ( var prop in data) {
            if (isNaN(data[prop])) {
              continue;
            }
            amount[prop] = (amount[prop] ? amount[prop] : 0) + Number(data[prop]);
          }
          return amount;
        }, {amount: true});
      },
      setPagesize: function (size) {
        this.pagesize = size;
        localStorage.setItem(this.save, size);
      }
    })
    , ProxyCollection = function (options) {
      var klass = options.collectionType
        , self = this;
      $.getScript(tp.component.Manager.getPath(klass), function () {
        klass = Nervenet.parseNamespace(klass);
        var real = self.real = new klass(self.models, options);
        self.delegateEvents(real);
        if (self.fetchOptions) {
          real.fetch(self.fetchOptions);
        }
      });
    };
  ProxyCollection.prototype = {
    events: {},
    fetchOptions: null,
    models: null,
    real: null,
    delegateEvents: function (real) {
      _.each(this.events, function (handler, event) {
        real.on(event, handler.method, handler.context);
      }, this);
      real.on('sync', this.onSync, this);
    },
    fetch: function (options) {
      if (this.real) {
        this.real.fetch(options);
      }
      this.fetchOptions = options;
    },
    on: function (type, method, context) {
      if (this.real) {
        return this.real.on(type, method, context);
      }
      this.events[type] = {
        method: method,
        context: context
      }
    },
    set: function (models, options) {
      if (this.real) {
        this.real.set(models, options);
      }
      this.models = models;
    },
    onSync: function () {
      this.length = this.real.length;
    }
  };

  _.each(['create', 'each', 'find', 'get', 'map', 'off', 'remove', 'reset', 'toJSON'], function (method) {
    ProxyCollection.prototype[method] = function () {
      return Collection.prototype[method].apply(this.real, arguments);
    };
  });


  /**
   *
   * @param {{collectionType: string}} options
   * @returns Backbone.Collection | ProxyCollection
   */
  Collection.getInstance = function (options) {
    var collection;
    if (options && options.collectionId && options.collectionId in collections) {
      collection = collections[options.collectionId];
      if (!collection.url && options.url) {
        collection.url = options.url;
      }
      return collection;
    }

    var params = _.extend({}, options);
    if (!params.model) {
      var init = _.chain(params)
        .pick('idAttribute', 'defaults')
        .mapObject(function (value, key) {
          if (key === 'defaults' && !_.isObject(value)) {
            return tp.utils.decodeURLParam(value);
          }
          return value;
        })
        .value();
      params.model = _.isEmpty(init) ? Model : Model.extend(init);
    }
    if (params.collectionType) {
      var klass = Nervenet.parseNamespace(params.collectionType);
      return klass ? new klass(null, params) : new ProxyCollection(params);
    } else {
      collection = new Collection(null, params);
    }
    if (params.collectionId) {
      collections[params.collectionId] = collection;
    }
    return collection;
  };
  Collection.destroyInstance = function (id) {
    if (id in collections) {
      delete collections[id];
    }
  }
}(Nervenet.createNameSpace('tp.model')));