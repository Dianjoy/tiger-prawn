/**
 * Created by meathill on 15/5/20.
 */
'use strict';
(function (ns) {
  var FORMAT = 'YYYY-MM-DD';
  ns.DateRange = tp.popup.Base.extend({
    events: _.extend(tp.popup.Base.prototype.events, {
      'dp.change input[name="start-date"]': 'startDate_changeHandler',
      'dp.change input[name="end-date"]': 'endDate_changeHandler'
    }),
    startDate_changeHandler: function (event) {
      var startDate = event.date,
        end = $('input[name="end-date"]');
      var result = this.getDateFromStart(end.val(), startDate.format(FORMAT));
      //end.val(result);
      end.data('DateTimePicker').defaultDate(result);
      this.setDateRange(end, startDate, startDate.add(7, 'days'));
    },
    endDate_changeHandler: function(event) {
      var start = $('input[name="start-date"]'),
        end = $('input[name="end-date"]'),
        endDate = event.date;
      var result = this.getDateFromEnd(start.val(), endDate.format(FORMAT));
      //start.val(result);
      this.setDateRange(end, moment(result), moment(result).add(7, 'days'));
    },
    setMinDate: function (elem, date) {
      elem.data("DateTimePicker").minDate(date);
    },
    setMaxDate: function (elem, date) {
      elem.data("DateTimePicker").maxDate(date);
    },
    setDateRange: function (element, start, end) {
      var is_min = true;
      try {
        this.setMinDate(element, start);
      } catch (e) {
        is_min = false;
        this.setMaxDate(element, end);
      }
      if (is_min) {
        this.setMaxDate(element, end);
      } else {
        this.setMinDate(element, start);
      }
    },
    getDateFromEnd: function (current, end) {
      var min = current
        , max = moment(current).add(7, 'days').format(FORMAT);
      if (end >= min && end <= max) {
        return current;
      } else if (end < min) {
        return end;
      } else if (end > max) {
        return end;
      }
    },
    getDateFromStart: function (current, start) {
      var min = moment(current).subtract(7, 'days').format(FORMAT),
        max = current;
      if (start < min) {
        return moment(start).add(7,'days').format(FORMAT);
      } else if (start >= min && start <= max) {
        return current;
      } else if (start > max) {
        return moment(start).add(7,'days').format(FORMAT);
      }
    }
  });
}(Nervenet.createNameSpace('tp.page')));
