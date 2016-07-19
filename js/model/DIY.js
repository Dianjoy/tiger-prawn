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
    save: function (key, value, options) {
      if (this.has('renew')) {
        this.unset('id');
      }
      ns.Model.prototype.save.call(this, key, value, options);
    },
    toJSON: function () {
      var json = ns.Model.prototype.toJSON.call(this);
      return _.omit(json, 'renew', 'edit', 'plans');
    }
  });
}(Nervenet.createNameSpace('tp.model'), _));