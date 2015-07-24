/**
 * Created by meathill on 14-3-12.
 */
;(function (ns) {
  'use strict';
  var collections = {}
    , Model = Backbone.Model.extend({
      parse: function (response, options) {
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
      total: 0,
      pagesize: 10,
      isLoading: false,
      initialize: function(models, options) {
        this.key = options.key || 'data';
        this.save = tp.PROJECT + location.hash + '-pagesize';
        Backbone.Collection.prototype.initialize.call(this, models, options);
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
      parse: function (response) {
        this.isLoading = false;
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
      setPagesize: function (size) {
        this.pagesize = size;
        localStorage.setItem(this.save, size);
      }
    });

  Collection.getInstance = function (options) {
    var collection;
    if (options.collectionId && options.collectionId in collections) {
      collection = collections[options.collectionId];
      if (!collection.url && options.url) {
        collection.url = options.url;
      }
      return collection;
    }

    var params = _.extend({}, options);
    if (!params.model || !(params.model instanceof Backbone.Model)) {
      var init = _.pick(params, 'idAttribute', 'defaults');
      params.model = _.isEmpty(init) ? Model : Model.extend(init);
    }
    collection = new Collection(null, params);
    if (options.collectionId) {
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