/**
 * Created by meathill on 16/1/6.
 */
'use strict';
(function (ns) {
  /**
   * @class
   */
  ns.DIYUser = ns.Me.extend({
    isCP: function () {
      return this.get('role') === 'cp';
    },
    getUserRole: function () {
      return this.isCP() ? '-cp' : '';
    },
    id_changeHandler: function (model, id) {
      ns.Me.prototype.id_changeHandler.call(this, model, id);
      if (id) {
        this.$body.$el.toggleClass('cp', this.isCP());
      }
    }
  });
}(Nervenet.createNameSpace('tp.model')));