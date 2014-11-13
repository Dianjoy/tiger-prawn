/**
 * Created by meathill on 14/11/13.
 */
;(function (ns) {
  ns.Me = Backbone.Model.extend({
    url: tp.API + 'user/'
  });
}(Nervenet.createNameSpace('tp.model')));