/**
 * Created by zlk on 15/7/17.
 */
'use strict';
(function (ns) {

  ns.ReceiptList = Backbone.View.extend({
    events: {
      'click .receipt-button': 'receiptButton_clickHandler'
    },
    receiptButton_clickHandler: function (event) {
      var target = event.currentTarget;
      var agreement_id = $(target).data('agreement');
      var ad_id = $(target).closest('tr').attr('id');
      var options = {
        title: target.title,
        id: ad_id,
        //collectionId: 'stat',
        confirm: '确定',
        content: "page/stat/choose-ad.hbs",
        isRemote: true,
        fromList: true
      };

      if(agreement_id){
        var popup = tp.popup.Manager.popup(options);
        popup.on('confirm', this.receiptPopup_confirmHandler, this);
      }
      else{
        alert('合同未录入，无编号，请通过邮件将合同客户全称和客户类型发给邱咏霞申请合同备案，获取合同编号');
      }
      localStorage.removeItem('ad-diy#applyReceipt');
    },
    receiptPopup_confirmHandler: function (popup) {
      var products = ""
        ,channel = ""
        ,agreement = ""
        ,settle_start_date = popup.$('#settle-start-date').val()
        ,settle_end_date = popup.$('#settle-end-date').val()
        ,len = popup.$(':checked').length;

      popup.$(':checked').each(function (i) {
        if(i + 1 != len){
          products += $(this).attr('id') + ',';
        }
        else{
          products += $(this).attr('id');
          channel = $(this).data('channel');
          agreement = $(this).data('agreement');
        }
      });
      window.location = '#/receipt/apply/'
        + settle_start_date + '/'
        + settle_end_date + '/'
        + channel+ '/'
        + agreement + '/'
        + products;
    }
  });
}(Nervenet.createNameSpace('tp.page')));