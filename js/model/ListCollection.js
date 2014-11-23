/**
 * Created by meathill on 14-3-12.
 */
;(function (ns) {
  'use strict';
  var collections = {}
    , Model = Backbone.Model.extend({
      parse: function (response, options) {
        return _.omit(response.data);
      }
    });
  var Collection = ns.ListCollection = Backbone.Collection.extend({
      total: 0,
      pagesize: 10,
      param: {},
      isLoading: false,
      model: Model,
      initialize: function(models, options) {
        Backbone.Collection.prototype.initialize.call(this, models, options);
        if (!options) {
          return;
        }
        if (options.url) {
          this.url = options.url;
        }
        var size = localStorage.getItem(location.hash + '-pagesize');
        this.pagesize = size || options.pagesize || this.pagesize;
      },
      fetch: function (param) {
        if (this.isLoading) {
          return;
        }
        param = param || {};
        Backbone.Collection.prototype.fetch.call(this, {
          reset: true,
          data: _.extend(param, {
            pagesize: this.pagesize
          })
        });
        this.isLoading = true;
      },
      parse: function (response) {
        this.isLoading = false;
        this.total = _.isArray(response) ? response.length : response.total;
        return _.isArray(response) ? response : response.list;
      },
      setPagesize: function (size) {
        this.pagesize = size;
        localStorage.setItem(location.hash + '-pagesize', size);
      }
    });
  Collection.createInstance = function (models, options) {
    if (!('id' in options)) {
      return new Collection(models, options);
    }
    if (options.id in collections) {
      var collection = collections[options.id];
      if (collection.length === 0 && models) {
        collection.reset(models);
      }
      return collection;
    } else {
      var collection = new Collection(models, options);
      collections[options.id] = collection;
      return collection;
    }
  };
  Collection.destroyInstance = function (id) {
    if (id in collections) {
      delete collections[id];
    }
  }
}(Nervenet.createNameSpace('tp.model')));