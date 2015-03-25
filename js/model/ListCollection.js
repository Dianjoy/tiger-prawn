/**
 * Created by meathill on 14-3-12.
 */
;(function (ns) {
  'use strict';
  var collections = {}
    , Model = Backbone.Model.extend({
      parse: function (response, options) {
        if ('code' in response && 'msg' in response && 'data' in response) {
          return response.data;
        }
        return response;
      }
    });
  var Collection = ns.ListCollection = Backbone.Collection.extend({
      total: 0,
      pagesize: 10,
      isLoading: false,
      initialize: function(models, options) {
        this.key = tp.PROJECT + location.hash + '-pagesize';
        Backbone.Collection.prototype.initialize.call(this, models, options);
        if (!options) {
          return;
        }
        if (options.url) {
          this.url = options.url;
        }
        var size = localStorage.getItem(this.key);
        this.pagesize = size || options.pagesize || this.pagesize;
      },
      fetch: function (options) {
        if (this.isLoading) {
          return;
        }
        if (options.data) {
          options.data.pagesize = this.pagesize;
        } else {
          options.data = {pagesize: this.pagesize};
        }
        Backbone.Collection.prototype.fetch.call(this, options);
        this.isLoading = true;
      },
      parse: function (response) {
        this.isLoading = false;
        this.total = _.isArray(response) ? response.length : response.total;
        return _.isArray(response) ? response : response.list;
      },
      setPagesize: function (size) {
        this.pagesize = size;
        localStorage.setItem(this.key, size);
      }
    });
  Collection.createInstance = function (models, options) {
    var params = _.extend({}, options);
    if (!options.model || !(options.model instanceof Function)) {
      params.model = ('idAttribute' in options ? Model.extend({
        idAttribute: options.idAttribute
      }) : Model);
    }
    var collection;
    if (!('collectionId' in options)) {
      return new Collection(models, params);
    }
    if (options.collectionId in collections) {
      collection = collections[options.collectionId];
      if (collection.length === 0 && models) {
        collection.reset(models);
      }
    } else {
      collection = new Collection(models, params);
      collections[options.collectionId] = collection;
    }
    return collection;
  };
  Collection.destroyInstance = function (id) {
    if (id in collections) {
      delete collections[id];
    }
  }
}(Nervenet.createNameSpace('tp.model')));