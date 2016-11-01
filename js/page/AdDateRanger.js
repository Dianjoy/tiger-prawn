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
      if (response) {
        if (this.options && this.options.isMD) {
          response = marked(response);
        }
        this.$('.modal-body').html(response);
      }
      this.getAdList = _.bind(this.getAdList, this);
      this.$el.removeClass('loading').find('.modal-footer .btn-primary').prop('disabled', false);
      tp.component.Manager.loadMediatorClass([], 'tp.component.SmartTable', this.$('#settle-table'), this.getAdList);
    },
    getAdList: function (components) {
      this.adList = components[0];
      this.ranger = new tp.component.DateRanger({ el: this.$('form') });
      this.adList.model.set({
        start: this.model.defaults.start,
        end: this.model.defaults.end
      }, { silent: true });
      this.ranger.use(this.adList.model);
      tp.component.Manager.check(this.$el, this.model);
    }
  });
}(Nervenet.createNameSpace('tp.page')));