/**
 * Created by meathill on 15/5/20.
 */
'use strict';
(function (ns) {
  ns.DateRange = tp.popup.Base.extend({
    dpEvents: {
      'dp.change [name="start"]': 'startDate_changeHandler',
      'dp.change [name="end"]': 'endDate_changeHandler'
    },
    onLoadComplete: function (response) {
      tp.popup.Base.prototype.onLoadComplete.call(this, response);
      this.start = this.$('[name="start"]');
      this.end = this.$('[name="end"]');
      this.setMinDate(this.start, moment().subtract('1', 'months').format(moment.DATE_FORMAT));
      this.setMaxDate(this.start, moment());
      if (this.start.val()) {
        var start = this.start.val();
        this.setEndDateRange(start, moment(start).add(6, 'days'));
      }
      this.delegateEvents(this.dpEvents);
    },
    startDate_changeHandler: function (event) {
      var startDate = event.date
        , result = this.getDateFromStart(this.end.val(), startDate.format(moment.DATE_FORMAT));
      this.end.val(result);
      this.setEndDateRange(startDate, startDate.clone().add(6, 'days'));
    },
    endDate_changeHandler: function(event) {
      var endDate = event.date
        , result = this.getDateFromEnd(this.start.val(), endDate.format(moment.DATE_FORMAT));
      this.start.val(result);
      this.setEndDateRange(moment(result), moment(result).add(6, 'days'));
    },
    setMinDate: function (elem, date) {
      elem.data("DateTimePicker").minDate(date);
    },
    setMaxDate: function (elem, date) {
      elem.data("DateTimePicker").maxDate(date);
    },
    setEndDateRange: function (start, end) {
      try {
        this.setMinDate(this.end, start);
        this.setMaxDate(this.end, end);
      } catch (e) {
        this.setMaxDate(this.end, end);
        this.setMinDate(this.end, start);
      }
    },
    getDateFromEnd: function (current, end) {
      var min = current
        , max = moment(current).add(6, 'days').format(moment.DATE_FORMAT);
      if (end >= min && end <= max) {
        return current;
      } else if (end < min) {
        return end;
      } else if (end > max) {
        return end;
      }
    },
    getDateFromStart: function (current, start) {
      var min = moment(current).subtract(6, 'days').format(moment.DATE_FORMAT),
          max = current;
      if (start < min) {
        return moment(start).add(6,'days').format(moment.DATE_FORMAT);
      } else if (start >= min && start <= max) {
        return current;
      } else if (start > max) {
        return moment(start).add(6,'days').format(moment.DATE_FORMAT);
      }
    },
    submitButton_clickHandler: function () {
      this.$el.modal('hide');
    }
  });
}(Nervenet.createNameSpace('tp.page')));
