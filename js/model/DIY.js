/**
 * Created by meathill on 16/7/14.
 */
'use strict';
(function (ns, _) {
  /**
   * @class
   * @type {any}
   */
  ns.DIY = ns.Model.extend({
    urlRoot: tp.API + 'diy/',
    initialize: function () {
      this.on('sync', this.syncHandler, this);
    },
    save: function (key, value, options) {
      if (this.has('renew')) {
        this.unset('id', {silent: true});
      }
      ns.Model.prototype.save.call(this, key, value, options);
    },
    toJSON: function () {
      var json = ns.Model.prototype.toJSON.call(this);
      return _.omit(json, 'renew', 'edit', 'plans');
    },
    syncHandler: function () {
      if ('id' in this.changed) {
        var hash = '#/diy/';
        setTimeout(function () {
          location.hash = hash;
        }, 3000);
      }
    }
  });
}(Nervenet.createNameSpace('tp.model'), _));