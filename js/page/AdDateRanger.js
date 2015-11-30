'use strict';
(function (ns) {
  ns.AdDateRanger = tp.popup.Base.extend({
    remove: function () {
      this.adList.remove();
      this.adList = null;
      this.ranger = null;
      tp.popup.Base.prototype.remove.call(this);
    },
    onLoadComplete: function (response) {
      this.getAdList = _.bind(this.getAdList, this);
      tp.popup.Base.prototype.onLoadComplete.call(this, response);
      tp.component.Manager.loadMediatorClass([], 'tp.component.SmartTable', this.$('table'), this.getAdList);
    },
    getAdList: function (components) {
      this.adList = components[0];
      this.ranger = new tp.component.DateRanger({
        el: this.el
      });
      this.adList.model.set({
        start: this.$('table').data('start'),
        end: this.$('table').data('end')
      }, {silent: true});
      this.ranger.use(this.adList.model);
    }
  });
}(Nervenet.createNameSpace('tp.page')));
