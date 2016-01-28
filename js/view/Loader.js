/**
 * Created by meathill on 14/11/14.
 */
'use strict';
(function (ns) {
  ns.Loader = Backbone.View.extend({
    $context: null,
    fresh: false,
    tagName: 'div',
    events: {
      'click .edit': 'edit_clickHandler'
    },
    initialize: function (options) {
      if (this.model instanceof Backbone.Model && !options.hasData) {
        this.model.once('sync', this.model_syncHandler, this);
        this.model.fetch(options);
      } else {
        this.isModelReady = true;
      }

      $.get(options.template, _.bind(this.template_getHandler, this), 'html');

      if ('refresh' in options) {
        this.refresh = options.refresh;
      }
    },
    remove: function () {
      Backbone.View.prototype.remove.call(this);
      tp.component.Manager.clear(this.$el);
    },
    render: function () {
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
        this.$('[href=#' + id + '][data-toggle]').click();
      }
    },
    model_syncHandler: function () {
      if (this.template) {
        return this.render();
      }
      this.isModelReady = true;
    },
    template_getHandler: function (data) {
      this.template = Handlebars.compile(data);
      if (this.isModelReady) {
        this.render();
      }
    }
  });
}(Nervenet.createNameSpace('tp.view')));