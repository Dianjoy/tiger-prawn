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
      'click .refresh-button': 'refreshButton_clickHandler',
      'keydown': 'keydownHandler',
      'success': 'form_successHandler'
    },
    initialize: function (options) {
      this.model = this.model || this.$context.getValue('model');
      if (options.isRemote) {
        this.$el.addClass('loading')
          .find('.modal-body').html(placeholder);
        if (/\.hbs$/.test(options.content)) {
          $.get(options.content, _.bind(this.template_loadedHandler, this));
        } else {
          options.isMD = /\.md$/.test(options.content);
          $.get(options.content, _.bind(this.onLoadComplete, this));
        }

        ga('send', 'pageview', options.content);
      } else {
        this.onLoadComplete(options.content);
      }
      if (options.autoFetch) {
        this.model.fetch();
        this.model.once('sync', this.model_syncHandler, this);
        this.model.on('error', this.model_errorHandler, this);
      }
      this.options = options;
      this.$el.modal(options);
    },
    remove: function () {
      clearTimeout(timeout);
      this.options = null;
      this.off();
      tp.component.Manager.clear(this.$el);
      Backbone.View.prototype.remove.call(this);
    },
    hide: function (delay) {
      delay = delay === undefined ? 3000 : delay;
      var modal = this.$el;
      timeout = setTimeout(function () {
        modal.modal('hide');
      }, delay);
    },
    onLoadComplete: function (response) {
      if (response) {
        if (this.options && this.options.isMD) {
          response = marked(response);
        }
        this.$('.modal-body').html(response);
      }
      this.$el.removeClass('loading')
        .find('.modal-footer .btn-primary').prop('disabled', false);
      tp.component.Manager.check(this.$el, this.model);
    },
    closeButton_clickHandler: function () {
      this.$el.modal('hide');
      this.trigger('cancel', this);
    },
    form_successHandler: function () {
      this.hide();
      this.trigger('success');
    },
    model_errorHandler: function (model, response) {
      this.$('.modal-body').html(tp.component.Manager.createErrorMsg(response));
    },
    model_syncHandler: function (model) {
      if (this.template) {
        this.onLoadComplete(this.template(_.extend({}, this.options, model.toJSON())));
      }
    },
    refreshButton_clickHandler: function (event) {
      this.model.fetch();
      $(event.currentTarget).spinner();
    },
    submitButton_clickHandler: function (event) {
      if (!event.currentTarget.form) {
        this.$el.modal('hide');
      }
      this.trigger('confirm', this);
    },
    template_loadedHandler: function (response) {
      this.template = Handlebars.compile(response);
      if (this.options && this.options.autoFetch && !this.model.hasChanged()) {
        return;
      }
      var data = _.extend({API: tp.API}, this.options, this.model ? this.model.toJSON() : null);
      this.onLoadComplete(this.template(data));
    },
    hiddenHandler: function () {
      this.remove();
      this.trigger('hidden', this);
    },
    keydownHandler: function (event) {
      if (event.keyCode === 13 && event.ctrlKey) {
        this.$('.modal-footer .btn-primary').submit();
        event.preventDefault();
      }
    },
    loadCompleteHandler: function() {
      this.onLoadComplete();
    },
    shownHandler: function () {
      this.$('.modal-footer .btn-primary').prop('disabled', false);
    }
  });
}(Nervenet.createNameSpace('tp.popup')));