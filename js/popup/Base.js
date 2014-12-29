/**
 * 通用弹窗
 * Created by meathill on 14-9-17.
 */
'use strict';
(function (ns) {

  var timeout
    , placeholder = '<p><i class="fa fa-spinner fa-spin fa-4x"></i></p>';

  ns.Base = tp.view.DataSyncView.extend({
    $context: null,
    events: {
      'show.bs.modal': 'showHandler',
      'hidden.bs.modal': 'hiddenHandler',
      'loaded.bs.modal': 'loadCompleteHandler',
      'click .modal-footer .btn-primary': 'submitButton_clickHandler',
      'form-success': 'form_successHandler'
    },
    initialize: function (options) {
      if (options.isRemote) {
        this.$el.addClass('loading')
          .find('.modal-body').html(placeholder);
        if (/\.hbs$/i.test(options.content)) {
          $.get(options.content, _.bind(this.template_successHandler, this));
          options.isRemote = false;
        } else {
          options.isRemote = options.content;
        }
      }
      this.$el.modal({
        show: true,
        remote: options.remote
      });
      this.options = options;
    },
    hide: function () {
      var modal = this.$el;
      timeout = setTimeout(function () {
        modal.modal('hide');
      }, 3000);
    },
    onLoadComplete: function () {
      this.$el.removeClass('loading')
        .find('.modal-footer .btn-primary').prop('disabled', false);
      tp.component.Manager.check(this.$el, this.model);
    },
    form_successHandler: function () {
      this.hide();
    },
    submitButton_clickHandler: function (event) {
      if (!event.currentTarget.form) {
        this.$el.modal('hide');
      }
    },
    template_successHandler: function (response) {
      this.template = Handlebars.compile(response);
      this.$('.modal-body').html(this.template(this.options.data));
      this.onLoadComplete();
    },
    hiddenHandler: function () {
      tp.component.Manager.clear(this.$el);
      this.$('.modal-body').empty();
      clearTimeout(timeout);
    },
    loadCompleteHandler: function() {
      this.onLoadComplete();
    },
    showHandler: function () {
      this.$('.modal-footer .btn-primary').prop('disabled', false);
      this.$('.alert').hide();
    }
  });
}(Nervenet.createNameSpace('tp.popup')));