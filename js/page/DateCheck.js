/**
 * Created by chensheng on 15/5/18.
 */
'use strict';
(function (ns) {
  var startDate;
  ns.DateCheck = tp.popup.Base.extend({
    events: {
      'dp.change #stat-range-start-date': 'startDate_changeHandler',
      'dp.change #stat-range-end-date': 'endDate_changeHandler'
    },
    startDate_changeHandler: function (e) {
      startDate = e.target.value;
    },
    endDate_changeHandler: function (e) {
      var endDate = e.target.value,
          regularDate = new Date(Date.parse(startDate)).getTime() + 7*1000*60*60*24;
      if (endDate < startDate) {
        alert('亲，结束日期不得小于开始日期');
      }
      endDate = new Date(Date.parse(endDate)).getTime();
      if (endDate > regularDate) {
        alert('商务人员只能导出一周内的数据，如有需要，请联系技术');
      }
    }
  });
}(Nervenet.createNameSpace('tp.page')));