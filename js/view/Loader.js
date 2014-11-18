/**
 * Created by meathill on 14/11/14.
 */
'use strict';
(function (ns) {
  ns.Loader = Backbone.View.extend({
    tagName: 'div',
    initialize: function (options) {
      if (this.model instanceof Backbone.Model && !options.hasData) {
        this.model.once('sync', this.model_syncHandler, this);
        this.model.fetch();
      } else {
        this.isModelReady = true;
      }

      $.get(options.template, _.bind(this.template_getHandler, this), 'html');
    },
    render: function () {
      this.$el.html(this.template(this.model instanceof Backbone.Model ? this.model.toJSON() : this.model));
      var $el = this.$el
        , model = this.model;
      setTimeout(function () {
        tp.component.Manager.check($el, model);
      }, 0);
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