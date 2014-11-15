/**
 * Created by 路佳 on 2014/11/15.
 */
'use strict';
(function (ns) {
  ns.AD = Backbone.Model.extend({
    className: 'ad ad-edit',
    defaults: {

    },
    url: tp.API + 'ad/'
  });
}(Nervenet.createNameSpace('tp.model')));