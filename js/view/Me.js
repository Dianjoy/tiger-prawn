/**
 * Created by meathill on 15/8/27.
 */
'use strict';
(function (ns) {
  ns.Me = Backbone.View.extend({
    initialize: function () {
      this.template = Handlebars.compile(this.$('script').html());
      this.model.on('change', this.model_changeHandler, this);
    },
    render: function () {
      if ('fullname' in this.model.changed) {
        this.$('.username').text(this.model.get('fullname'));
      }
      this.$el.filter('.navbar-user').html(this.template(this.model.toJSON()));
    },
    model_changeHandler: function () {
      this.render();
    }
  });
}(Nervenet.createNameSpace('tp.view')));