/**
 * Created by meathill on 15/2/11.
 */
'use strict';
(function (ns) {
  ns.Info = tp.view.Loader.extend({
    events: {
      'submit': 'searchHandler'
    },

    searchHandler: function (event) {
      this.collection.fetch();
    }
  });
}(Nervenet.createNameSpace('tp.page')));