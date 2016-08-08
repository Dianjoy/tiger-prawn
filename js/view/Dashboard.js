/**
 * Created by meathill on 15/11/19.
 */
'use strict';
(function (ns) {
  ns.Dashboard = ns.Loader.extend({
    className: 'dashboard',
    render: function () {
      ns.Loader.prototype.render.call(this);
      this.$el.removeClass('loading');
      this.$('.fa').remove('fa-spin fa-spinner');
      this.refresh = true;
    },
    model_changeHandler: function (model) {
      var range = _.pick(model.changed, 'start', 'end');
      if (_.isEmpty(range)) {
        this.render();
      } else {
        model.fetch({
          data: model.pick('start', 'end')
        });
        this.$el.addClass('loading');
        this.$('.fa').addClass('fa-spin fa-spinner');
      }
    }
  });
}(Nervenet.createNameSpace('tp.view')));