/**
 * Created by meathill on 14/11/13.
 */
;(function (ns) {
  ns.Body = Backbone.View.extend({
    clear: function (container) {
      tp.component.Manager.clear(this.$el);
    },
    load: function (url, data, isFull) {
      this.setDisabled(true);
      var container = isFull ? this.$el : this.sub;
      this.clear(container);
      // html or hbs
      if (/.hbs$/.test(url)) {
        $.ajax(url, {
          context: this,
          success: function (response) {
            var template = Handlebars.compile(response)
              , html = template(data);
            container.html(html);
            tp.component.Manager.check(this.$el);
          }
        })
      } else {
        container.load(url, _.bind(this.loadCompleteHandler, this));
      }

      this.trigger('load:start', url);
      ga('send', 'pageview', url);
    },
    setDisabled: function (bl) {
      this.$('a.btn').toggleClass('disabled', bl);
      this.$('button').prop('disabled', bl);
    },
    loadCompleteHandler: function (response, status) {
      if (status === 'error') {
        this.trigger('load:failed');
      } else {
        tp.component.Manager.check(this.$el);
      }
      this.trigger('load:complete');
    }
  });
}(Nervenet.createNameSpace('tp.view')));