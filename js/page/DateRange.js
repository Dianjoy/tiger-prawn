/**
 * Created by meathill on 15/5/20.
 */
'use strict';
(function (ns) {
  var FORMAT = 'YYYY-MM-DD';

  ns.DateRange = Backbone.View.extend({
    getDateFromEnd: function (current, end) {
      var min = current
        , max = moment(current).add(7, 'days').format(FORMAT);
      if (end >= min && end <= max) {
        return current;
      }
    },
    getDateFromStart: function (current, start) {

    }
  });
}(Nervenet.createNameSpace('tp.page')));