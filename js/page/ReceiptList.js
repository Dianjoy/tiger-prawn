/**
 * Created by zlk on 15/7/17.
 */
'use strict';
(function (ns) {
  var hash;

  ns.ReceiptList = Backbone.View.extend({
    events: {
      'click .receipt-button': 'receiptButton_clickHandler'
    },
    receiptButton_clickHandler: function (event) {
      var target = event.currentTarget
      var ad_id = $(target).closest('tr').attr('id');
      var options = {
          title: target.title,
          id: ad_id,
          collectionId: 'stat',
          confirm: '确定',
          content: "page/stat/choose-ad.hbs",
          isRemote: true,
          fromList: true
        };
      var collection = tp.model.ListCollection.getInstance(options);

      hash = ad_id;
      options.model = collection.get(options.id);
      var popup = tp.popup.Manager.popup(options);

      popup.on('confirm', this.receiptPopup_confirmHandler, this);
    },
    receiptPopup_confirmHandler: function (popup) {
      var products = []
        ,ad_name =[]
        ,channel_id = popup.$('tbody').attr('id')
        ,full_name = popup.$('tbody').attr('title')
        ,settle_start_date = popup.$('#settle-start-date').val()
        ,settle_end_date = popup.$('#settle-end-date').val();

      popup.$(':checked').each(function () {
        products.push($(this).attr('id'));
        ad_name.push($(this).parent().text());
      });
        localStorage.setItem('products',products);
        localStorage.setItem('ad_name',ad_name);
        localStorage.setItem('channel_id',channel_id);
        localStorage.setItem('full_name',full_name);
        localStorage.setItem('settle_start_date',settle_start_date);
        localStorage.setItem('settle_end_date',settle_end_date);
        window.location = '#/receipt/detail/';
    }
  });
}(Nervenet.createNameSpace('tp.page')));