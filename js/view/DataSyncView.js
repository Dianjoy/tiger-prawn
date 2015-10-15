/**
 * Created by meathill on 14-3-24.
 * 存在数据交互的类，主要显示进度和结果
 */
'use strict';
(function (ns) {
  ns.DataSyncView = Backbone.View.extend({
    initialize: function () {
      this.submit = this.$('button.btn-primary');
    },
    displayProcessing: function () {
      this.$el.addClass('processing');
      this.submit.spinner();
    },
    displayResult: function (isSuccess, msg, icon) {
      msg = (icon ? '<i class="fa fa-' + icon + '"></i> ' : '') + msg;
      this.submit.spinner(false);
      this.$el.removeClass('processing');
      this.$('.alert-msg')
        .hide()
        .toggleClass('alert-danger', !isSuccess)
        .toggleClass('alert-success', isSuccess)
        .html(msg + ' (' + moment().format('HH:mm:ss') + ')')
        .slideDown();
    }
  });
}(Nervenet.createNameSpace('tp.view')));