/**
 * Created by meathill on 14-3-24.
 * 存在数据交互的类，主要显示进度和结果
 */
;(function (ns) {
  ns.DataSyncView = Backbone.View.extend({
    initialize: function () {
      this.submit = this.$('button.btn-primary');
    },
    displayProcessing: function () {
      this.$el.addClass('processing');
      this.submit
        .prop('disabled', true)
        .find('i').hide()
        .end().prepend('<i class="fa fa-spin fa-spinner"></i>');
    },
    displayResult: function (isSuccess, msg, icon) {
      msg = (icon ? '<i class="fa fa-' + icon + '"></i> ' : '') + msg;
      this.submit
        .prop('disabled', false)
        .find('i:hidden').show()
        .end().find('.fa-spin').remove();
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