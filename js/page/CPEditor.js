/**
 * Created by meathill on 15/9/8.
 */
'use strict';
(function (ns) {
  ns.CPEditor = Backbone.View.extend({
    $me: null,
    events: {
      'submit': 'submitHandler',
      'change [name=job_num],[name=total_num]': 'jobNum_changerHandler',
      'dp.change [name=start_time],[name=end_time]': 'jobNum_changerHandler',
      'change [name=quote_rmb]': 'quoteRMB_changeHandler'
    },
    checkBalance: function (total) {
      var quote_rmb = this.$('[name=quote_rmb]').val();
      total = total || this.$('[name=total_num]').val();
      if (!quote_rmb || !total) {
        return;
      }
      if (quote_rmb * total > this.$me.get('balance')) {
        this.$('[name=total_num]')
          .popover({
            container: 'body',
            content: '您的余额不足以完成这份计划，请先充值，或调低计划。',
            trigger: 'manual'
          })
          .popover('show')
          .focus()
          .closest('.form-group').addClass('has-error');
        this.$('button').prop('disabled', true);
      } else {
        this.$('[name=total_num]')
          .popover('destroy')
          .closest('.form-group').removeClass('has-error');
        this.$('button').prop('disabled', false);
      }
    },
    jobNum_changerHandler: function () {
      var job_num = this.$('[name=job_num]').val()
        , start = this.$('[name=start_time]').val()
        , end = this.$('[name=end_time]').val()
        , total;
      if (!start || !end || !job_num) {
        return;
      }
      start = new Date(start).getTime();
      end = new Date(end).getTime();
      total = ((end - start) /  86400000 >> 0) * job_num;
      this.$('[name=total_num]').val(total);
      this.checkBalance(total);
    },
    quoteRMB_changeHandler: function () {
      this.checkBalance();
    },
    submitHandler: function (event) {
      
    }
  });
}(Nervenet.createNameSpace('tp.page')));