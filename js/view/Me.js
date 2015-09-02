/**
 * Created by meathill on 15/8/27.
 */
'use strict';
(function (ns) {
  ns.Me = Backbone.View.extend({
    events: {

    },
    initialize: function () {
      this.model.on('change', this.model_changeHandler, this);
    },
    setFullname: function (fullname) {
      this.$('.username').text(fullname);
    },
    setFace: function (face) {
      this.$('.face').attr('src', face);
    },
    setBalance: function (balance) {
      this.$('.balance').text(balance);
    },
    model_changeHandler: function (model) {
      var key, value;
      for (key in model.changed) {
        value = model.changed[key];
        switch (key) {
          case 'fullname':
            this.setFullname(value);
            break;

          case 'face':
            this.setFace(value);
            break;

          case 'balance':
            this.setBalance(value);
            break;
        }
      }
    }
  });
}(Nervenet.createNameSpace('tp.view')));