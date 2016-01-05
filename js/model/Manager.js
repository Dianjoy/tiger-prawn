/**
 * Created by meathill on 15/11/12.
 */
'use strict';
(function (ns) {
  var collections = {};

  var manager = ns.ListManager = {
    /**
     * 取得一个ListCollection实例
     * @param {{collectionType: string}} options
     * @returns Backbone.Collection | ns.ProxyCollection
     */
    getInstance: function (options) {
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
        if (!_.isEmpty(init)) {
          params.model = Model.extend(init);
        }
      }
      if (params.collectionType) {
        var klass = Nervenet.parseNamespace(params.collectionType);
        return klass ? new klass(null, params) : new ns.ProxyCollection(params);
      } else {
        collection = new ns.ListCollection(null, params);
      }
      if (params.collectionId) {
        collections[params.collectionId] = collection;
      }
      return collection;
    },
    destroyInstance: function (id) {
      if (id in collections) {
        delete collections[id];
      }
    }
  };

  // 为了兼容以前的写法
  _.extend(ns.ListCollection, manager);
}(Nervenet.createNameSpace('tp.model')));