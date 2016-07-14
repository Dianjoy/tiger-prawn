/**
 * Created by meathill on 16/7/14.
 */
'use strict';
(function (ns) {
  ns.DIY = ns.Model.extend({
    urlRoot: tp.API + 'diy/'
  });
}(Nervenet.createNameSpace('tp.model'), Backbone));