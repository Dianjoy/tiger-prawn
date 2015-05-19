/**
 * Created by chensheng on 15/5/18.
 */
'use strict';
(function (ns) {
  ns.DateCheck = tp.popup.Base.extend({
    events: _.extend(tp.popup.Base.prototype.events, {
      'dp.change input[name="start-date"]': 'startDate_changeHandler',
      'dp.change input[name="end-date"]': 'endDate_changeHandler'
    }),
    startDate_changeHandler: function (event) {
      $('input[name="end-date"]').data('DateTimePicker').minDate(event.date);
      $('input[name="end-date"]').data('DateTimePicker').maxDate(moment(event.date).add(7, 'days'));
    },
    endDate_changeHandler: function (event) {
      $('input[name="start-date"]').data('DateTimePicker').maxDate(event.date);
    }
  });
}(Nervenet.createNameSpace('tp.page')));