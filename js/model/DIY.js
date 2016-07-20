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
        this.unset('id', {silent: true});
      }
      ns.Model.prototype.save.call(this, key, value, options);
    },
    toJSON: function (options) {
      var json = ns.Model.prototype.toJSON.call(this);
      if (options) {
        json = _.omit(json, 'plans');
      }
      return _.omit(json, 'renew', 'edit');
    }
  });
}(Nervenet.createNameSpace('tp.model'), _));