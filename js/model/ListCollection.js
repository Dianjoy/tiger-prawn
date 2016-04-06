/**
 * Created by meathill on 14-3-12.
 */
'use strict';
(function (ns, $) {
  /**
   * class
   */
  ns.ListCollection = Backbone.Collection.extend({
    cache: null,
    model: ns.Model,
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
            if (self.cache) {
              if (self.cache.options.reset) {
                self.reset(self.cache.response, self.cache.options);
              } else {
                self.set(this.parse(self.cache.response), self.cache.options);
                self.trigger('sync');
              }
              this.cache = null;
            }
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
      this.on('error', this.errorHandler, this);
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
          this.trigger('data:' + key, response[key], this);
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
    },
    errorHandler: function () {
      this.isLoading = false;
    }
  });
}(Nervenet.createNameSpace('tp.model'), jQuery));