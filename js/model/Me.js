/**
 * Created by meathill on 14/11/13.
 */
;(function (ns) {
  ns.Me = Backbone.Model.extend({
    url: tp.API + 'user/',
    initialize: function () {
      this.on('change:id', this.id_changeHandler, this);
    },
    id_changeHandler: function (id) {
      if (id) {
        if (location.hash === '#/user/login') {
          location.hash = '#/dashboard';
        }
      } else {
        location.hash = '#/user/login';
      }
    }
  });
}(Nervenet.createNameSpace('tp.model')));