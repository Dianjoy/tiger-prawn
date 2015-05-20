/**
 * Created by chensheng on 15/5/18.
 */
'use strict';
(function (ns) {
  var minDate,regularDate;
  ns.DateCheck = tp.popup.Base.extend({
    events: _.extend(tp.popup.Base.prototype.events, {
      'dp.change input[name="start-date"]': 'startDate_changeHandler',
      'dp.change input[name="end-date"]': 'endDate_changeHandler'
    }),
    startDate_changeHandler: function (event) {
      var endDate = $('input[name="end-date"]'),
          startDate = event.date;
      if (endDate.val() != "") {
        if (moment(startDate) < minDate) {
          endDate.val(moment(startDate).add(7, 'days').format('YYYY-MM-DD'));
        } else if (moment(startDate) > regularDate) {
          endDate.val(moment(startDate).format('YYYY-MM-DD'));
        }
      }
      endDate.data('DateTimePicker').minDate(startDate);
      endDate.data('DateTimePicker').maxDate(moment(startDate).add(7, 'days'));
    },
    endDate_changeHandler: function (event) {
      minDate = moment(event.date).subtract(7, 'days');
      regularDate = moment(event.date);
    }
  });
}(Nervenet.createNameSpace('tp.page')));