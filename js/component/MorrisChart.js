/**
 * Created by meathill on 13-11-12.
 */
"use strict";
(function (ns) {
  ns.MorrisChart = Backbone.View.extend({
    $colors: null,
    src: {},
    initialize: function (options) {
      if (options.data) {
        this.createOptions(options);
        this.render();
        return;
      }

      var init = this.$el.data();
      options = _.extend({
        autoFetch: true
      }, options, init);
      if (options.url) {
        this.collection = tp.model.ListCollection.getInstance(options);
        this.createOptions(options);
        if (options.autoFetch) {
          this.collection.on('sync reset', this.collection_fetchHandler, this);
          this.collection.fetch();
        } else {
          this.collection_fetchHandler();
        }
        return;
      }

      var data = this.$('script');
      if (data.length) {
        var chartData = JSON.parse(data.remove().html().replace(/,\s?]/, ']'));
        if (chartData.data.length) {
          this.createOptions(options, chartData);
          this.render();
          return;
        }
      }

      this.showEmpty();
    },
    remove: function () {
      if (this.collection) {
        this.collection.off(null, null, this);
      }
      Backbone.View.prototype.remove.call(this);
    },
    render: function () {
      this.$el.empty();
      this.chart = new Morris[this.className](this.options);
    },
    createOptions: function (options, chartData) {
      options = _.extend({
        element: this.el,
        lineWidth: 2
      }, options, chartData);
      this.className = 'type' in options ? options.type.charAt(0).toUpperCase() + options.type.substr(1) : 'Line';
      if ('colors' in options) {
        options.colors = options.lineColors = options.barColors = _.isArray(options.colors) ? options.colors : options.colors.split(',');
      } else {
        options.colors = options.lineColors = options.barColors = this.$colors;
      }
      if (this.className === 'Donut') {
        options.formatter = function (y, data) {
          return 'percent' in data ? y + '(' + data.percent + '%)' : y;
        }
      }
      if (!_.isArray(options.ykeys)) {
        this.src.ykeys = options.ykeys = options.ykeys.split(',');
      }
      if (!_.isArray(options.labels)) {
        this.src.labels = options.labels = options.labels.split(',');
      }
      this.options = options;
    },
    showEmpty: function () {
      this.$el.addClass('empty').text('（无数据）');
    },
    collection_fetchHandler: function () {
      if (this.collection.length === 0) {
        this.showEmpty();
      }
      if (this.collection.options) {
        if (this.collection.options.ykeys) {
          this.options.ykeys = this.src.ykeys.concat(this.collection.options.ykeys);
        }
        if (this.collection.options.labels) {
          this.options.labels = this.src.labels.concat(this.collection.options.labels);
        }
      }
      this.options.data = this.collection.toJSON();
      this.render();
    }
  });
}(Nervenet.createNameSpace('tp.component')));