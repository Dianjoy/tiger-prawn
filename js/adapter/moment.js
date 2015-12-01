/**
 * Created by meathill on 15/7/8.
 */
'use strict';
(function (m) {
  var date = m.DATE_FORMAT = 'YYYY-MM-DD';
  m.TIME_FORMAT = 'HH:mm:ss';
  m.DATETIME_FORMAT = m.defaultFormat = 'YYYY-MM-DD HH:mm:ss';
  m.createRange = function (start, end, withToday) {
    var today = (new Date()).getDate();
    start = start || moment().add(1 - today, 'days').format(date);
    if (!end) {
      end = withToday || today === 1 ? 0 : -1;
      end = moment().add(end, 'days').format(date);
    }
    return {
      start: start,
      end: end
    }
  }
}(moment));