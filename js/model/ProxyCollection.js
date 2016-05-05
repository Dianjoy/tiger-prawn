/**
 * Created by meathill on 15/11/12.
 */
'use strict';
(function (ns) {
  var proxy = ns.ProxyCollection = function (options) {
    var klass = options.collectionType
      , self = this;
    $.getScript(tp.component.Manager.getPath(klass), function () {
      klass = Nervenet.parseNamespace(klass);
      var real = self.real = new klass(this.models, options);
      self.delegateEvents(real);
      if (self.fetchOptions) {
        real.fetch(self.fetchOptions);
      }
    });
  };

  proxy.prototype = {
    events: {},
    fetchOptions: null,
    models: null,
    real: null,
    delegateEvents: function (real) {
      _.each(this.events, function (handler, event) {
        real.on(event, handler.method, handler.context);
      }, this);
      real.on('sync', this.onSync, this);
      this.events = null;
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

  _.each(['create', 'each', 'find', 'get', 'map', 'off', 'remove', 'reset', 'toJSON', 'getAmount'], function (method) {
    proxy.prototype[method] = function () {
      return ns.ListCollection.prototype[method].apply(this.real, arguments);
    };
  });
}(Nervenet.createNameSpace('tp.model')));