/**
 * Created by meathill on 14-3-24.
 * 存在数据交互的类，主要显示进度和结果
 */
;(function (ns) {
  ns.DataSyncView = Backbone.View.extend({
    displayProcessing: function () {
      this.$el.addClass('processing')
        .find('button:not([type])').prop('disabled', true)
        .find('i').addClass('fa-spin fa-spinner');
    },
    displayResult: function (isSuccess, msg, icon) {
      msg = (icon ? '<i class="fa ' + icon + '"></i> ' : '') + msg;
      this.$('.fa-spin').removeClass('fa-spin fa-spinner');
      this.$el.removeClass('processing');
      this.$('button:not([type])').prop('disabled', false);
      this.$('.alert-msg')
        .hide()
        .toggleClass('alert-danger', !isSuccess)
        .toggleClass('alert-success', isSuccess)
        .html(msg + ' (' + moment().format('HH:mm:ss') + ')')
        .slideDown();
    }
  });
}(Nervenet.createNameSpace('tp.view')));