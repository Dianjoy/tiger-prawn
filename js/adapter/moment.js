/**
 * Created by meathill on 15/7/8.
 */
'use strict';
(function (m) {
  var DATE = m.DATE_FORMAT = 'YYYY-MM-DD' // 通用日期格式
    , TIME = m.TIME_FORMAT = 'HH:mm:ss'; // 通用时间格式
  m.DATETIME_FORMAT = m.defaultFormat = DATE + ' ' + TIME; // 通用格式

  /**
   * 生成常用的日期范围,通常是本月
   *
   * @param {string|number} start 开始日期
   * @param {string|number} end 结束日期
   * @param {boolean} [withToday] 是否包含今天
   * @returns {{start: (string), end: (string)}}
   */
  m.createRange = function (start, end, withToday) {
    start = start || moment().startOf('month').format(DATE);
    if (!end) {
      var today = (new Date()).getDate();
      end = withToday || today === 1 ? 0 : -1;
      end = moment().add(end, 'days').format(DATE);
    }
    return {
      start: start,
      end: end
    }
  };

  /**
   * 昨天,今天,明天
   * 默认今天
   * @param {string|number} date
   */
  m.createNearDates = function (date) {
    var current = date ? moment(date) : moment().add(-1, 'days')
      , today = moment().add(-1, 'days')
      , yesterday = current.clone().add(-1, 'days').format(DATE)
      , tomorrow = current.isSame(today) ? null : current.add(1, 'days').format(DATE);
    return {
      date: current.format(DATE),
      yesterday: yesterday,
      tomorrow: tomorrow
    }
  }
}(moment));