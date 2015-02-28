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
      fetch: function (options) {
        if (this.isLoading) {
          return;
        }
        options = _.extend({
          data: {
            pagesize: this.pagesize
          }
        }, options);
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
        localStorage.setItem(location.hash + '-pagesize', size);
      }
    });
  Collection.createInstance = function (models, options) {
    options.Model = options.model || ('idAttribute' in options ? Model.extend({
      idAttribute: options.idAttribute
    }) : Model);
    var collection;
    if (!('collectionId' in options)) {
      return new Collection(models, options);
    }
    if (options.collectionId in collections) {
      collection = collections[options.collectionId];
      if (collection.length === 0 && models) {
        collection.reset(models);
      }
    } else {
      collection = new Collection(models, options);
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