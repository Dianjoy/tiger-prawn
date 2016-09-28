/**
 * Created by meathill on 15/11/12.
 */
'use strict';
(function (ns, _, $, Backbone) {
  /**
   * @class
   * @type {tp.model.ProxyCollection}
   */
  var proxy = ns.ProxyCollection = function (options) {
    var klass = options.collectionType
      , self = this;
    $.getScript(tp.component.Manager.getPath(klass), function () {
      klass = Nervenet.parseNamespace(klass);
      var real = self.real = new klass(this.models, options);
      real.on('all', self.real_allHandler, self);
      if (self.fetchOptions) {
        real.fetch(self.fetchOptions);
      }
      self.trigger('ready');
    });
  };

  _.extend(proxy.prototype, Backbone.Events, {
    events: {},
    pagesize: 10,
    fetchOptions: null,
    models: null,
    real: null,
    fetch: function (options) {
      if (this.real) {
        this.real.fetch(options);
      }
      this.fetchOptions = options;
    },
    set: function (models, options) {
      if (this.real) {
        this.real.set(models, options);
      }
      this.models = models;
    },
    real_allHandler: function () {
      if (arguments[0] === 'sync') {
        this.length = this.real.length;
        this.options = this.real.options;
        this.total = this.real.total;
      }
      Backbone.Events.trigger.apply(this, Array.prototype.slice.call(arguments));
    }
  });

  _.each(['create', 'each', 'find', 'get', 'map', 'remove', 'reset', 'toJSON', 'getAmount', 'setPagesize'], function (method) {
    proxy.prototype[method] = function () {
      return ns.ListCollection.prototype[method].apply(this.real, arguments);
    };
  });
}(Nervenet.createNameSpace('tp.model'), _, jQuery, Backbone));