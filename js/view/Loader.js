/**
 * Created by meathill on 14/11/14.
 */
'use strict';
(function (ns, $, _, Backbone, Handlebars, tp) {
  /**
   * @class
   */
  ns.Loader = Backbone.View.extend({
    $context: null,
    fresh: false,
    tagName: 'div',
    events: {
      'click .edit': 'edit_clickHandler',
      'click .refresh-button': 'refreshButton_clickHandler'
    },
    initialize: function (options) {
      if (this.model instanceof Backbone.Model && !options.hasData) {
        this.model.once('sync', this.model_syncHandler, this);
        this.model.on('error', this.model_errorHandler, this);
        this.model.fetch(_.omit(options, 'loader', 'model'));
      } else {
        this.isModelReady = true;
      }

      var url = options.template;
      url = url.indexOf('?') === -1 ? url + '?v=' + tp.VERSION : url;
      $.ajax({
        url: url,
        success: _.bind(this.template_getHandler, this),
        error: _.bind(this.template_errorHandler, this),
        contentType: 'html'
      });
      this.options = options;

      if ('refresh' in options) {
        this.refresh = options.refresh;
      }
    },
    remove: function () {
      tp.component.Manager.clear(this.$el);
      Backbone.View.prototype.remove.call(this);
    },
    render: function () {
      if (this.model instanceof Backbone.Model) {
        this.model.off();
      }
      this.$el.html(this.template(this.model instanceof Backbone.Model ? this.model.toJSON() : this.model));
      if (this.refresh) {
        this.refresh = false;
        this.model.on('change', this.model_changeHandler, this);
      }
      var self = this
        , $el = this.$el
        , model = this.model;
      setTimeout(function () {
        tp.component.Manager.check($el, model);
        self.trigger('complete');
      }, 0);
      this.options = null;
    },
    edit_clickHandler: function (event) {
      var target = $(event.currentTarget)
        , options = target.data()
        , prop = event.currentTarget.hash.substr(1);
      options.label = options.label || target.closest('td').prev('th').text();
      this.$context.trigger('edit-model', this.model, prop, options);
      event.preventDefault();
    },
    model_changeHandler: function () {
      // 记录当前活动元素的位置
      var id = this.$('.active').filter('.tab-pane').attr('id');
      tp.component.Manager.clear(this.$el);
      this.render();
      if (id) {
        this.$('[href="#' + id + '"][data-toggle]').click();
      }
    },
    model_errorHandler: function (model, response) {
      this.$el.html(tp.component.Manager.createErrorMsg(response));
      this.trigger('complete');
    },
    model_syncHandler: function () {
      if (this.template) {
        return this.render();
      }
      this.isModelReady = true;
      this.model.off('error', null, this);
    },
    refreshButton_clickHandler: function (event) {
      if (this.noTemplate) {
        return Backbone.history.loadUrl(Backbone.history.fragment);
      }
      this.model.fetch(this.options);
      $(event.currentTarget).spinner();
    },
    template_errorHandler: function () {
      this.noTemplate = true;
      this.$el.html(tp.component.Manager.createErrorMsg({
        msg: '加载模板失败，请稍后重试。'
      }));
      this.trigger('complete');
    },
    template_getHandler: function (data) {
      this.template = Handlebars.compile(data);
      if (this.isModelReady) {
        this.render();
      }
    }
  });
}(Nervenet.createNameSpace('tp.view'), jQuery, _, Backbone, Handlebars, tp));