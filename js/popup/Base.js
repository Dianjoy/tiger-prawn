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
      'shown.bs.modal': 'shownHandler',
      'hidden.bs.modal': 'hiddenHandler',
      'loaded.bs.modal': 'loadCompleteHandler',
      'click .modal-footer .btn-primary': 'submitButton_clickHandler',
      'click [data-dismiss=modal]': 'closeButton_clickHandler',
      'keydown textarea': 'textarea_keydownHandler',
      'success': 'form_successHandler'
    },
    initialize: function (options) {
      if (options.isRemote) {
        this.$el.addClass('loading')
          .find('.modal-body').html(placeholder);
        if (/\.hbs$/i.test(options.content)) {
          $.get(options.content, _.bind(this.template_successHandler, this));
          options.remote = false;
        } else {
          options.remote = options.content;
        }
      }
      this.$el.modal({
        show: true,
        remote: options.remote
      });
    },
    remove: function () {
      clearTimeout(timeout);
      this.off();
      Backbone.View.prototype.remove.call(this);
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
    closeButton_clickHandler: function () {
      this.$el.modal('hide');
      this.trigger('cancel');
    },
    form_successHandler: function () {
      this.hide();
    },
    submitButton_clickHandler: function (event) {
      if (!event.currentTarget.form) {
        this.$el.modal('hide');
      }
      this.trigger('confirm');
    },
    template_successHandler: function (response) {
      this.template = Handlebars.compile(response);
      this.$('.modal-body').html(this.template(_.extend({
        urlRoot: this.model.collection.url
      }, this.model.toJSON())));
      this.onLoadComplete();
    },
    textarea_keydownHandler: function (event) {
      if (event.keyCode === 13 && event.ctrlKey) {
        $(event.target).closest('form').submit();
        event.preventDefault();
      }
    },
    hiddenHandler: function () {
      this.remove();
    },
    loadCompleteHandler: function() {
      this.onLoadComplete();
    },
    shownHandler: function () {
      this.$('.modal-footer .btn-primary').prop('disabled', false);
    }
  });
}(Nervenet.createNameSpace('tp.popup')));