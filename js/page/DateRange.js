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
    onLoadComplete: function (response) {
      tp.popup.Base.prototype.onLoadComplete.call(this, response);
      var start = $('input[name="start-date"]');
      this.setMaxDate(start, moment());
    },
    startDate_changeHandler: function (event) {
      var startDate = event.date,
          start = $('input[name="start-date"]'),
          end = $('input[name="end-date"]');
      var result = this.getDateFromStart(end.val(), startDate.format(FORMAT));
      end.val(result);
      this.setEndDateRange(startDate, startDate.clone().add(6, 'days'));
    },
    endDate_changeHandler: function(event) {
      var start = $('input[name="start-date"]'),
          end = $('input[name="end-date"]'),
          endDate = event.date;
      var result = this.getDateFromEnd(start.val(), endDate.format(FORMAT));
      start.val(result);
      this.setEndDateRange(moment(result), moment(result).add(6, 'days'));
    },
    setMinDate: function (elem, date) {
      elem.data("DateTimePicker").minDate(date);
    },
    setMaxDate: function (elem, date) {
      elem.data("DateTimePicker").maxDate(date);
    },
    setEndDateRange: function (start, end) {
      var endElem = $('input[name="end-date"]');
      try {
        this.setMinDate(endElem, start);
        this.setMaxDate(endElem, end);
      } catch (e) {
        this.setMaxDate(endElem, end);
        this.setMinDate(endElem, start);
      }
    },
    getDateFromEnd: function (current, end) {
      var min = current
        , max = moment(current).add(6, 'days').format(FORMAT);
      if (end >= min && end <= max) {
        return current;
      } else if (end < min) {
        return end;
      } else if (end > max) {
        return end;
      }
    },
    getDateFromStart: function (current, start) {
      var min = moment(current).subtract(6, 'days').format(FORMAT),
          max = current;
      if (start < min) {
        return moment(start).add(6,'days').format(FORMAT);
      } else if (start >= min && start <= max) {
        return current;
      } else if (start > max) {
        return moment(start).add(6,'days').format(FORMAT);
      }
    }
  });
}(Nervenet.createNameSpace('tp.page')));
