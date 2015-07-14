/**
 * Created by meathill on 13-11-12.
 */
"use strict";
(function (ns) {
  ns.MorrisChart = Backbone.View.extend({
    $colors: null,
    initialize: function (options) {
      if (options.data) {
        this.createOptions(options);
        this.drawChart();
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
          this.collection.once('sync reset', this.collection_fetchHandler, this);
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
          this.drawChart();
          return;
        }
      }

      this.showEmpty();
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
        options.ykeys = [options.ykeys];
      }
      if (!_.isArray(options.labels)) {
        options.labels = [options.labels];
      }
      this.options = options;
    },
    drawChart: function () {
      this.$('.fa-spin').remove();
      this.chart = new Morris[this.className](this.options);
    },
    showEmpty: function () {
      this.$el.addClass('empty').text('（无数据）');
    },
    collection_fetchHandler: function () {
      if (this.collection.length === 0) {
        this.showEmpty();
      }
      this.options.data = this.collection.toJSON();
      this.drawChart();
    }
  });
}(Nervenet.createNameSpace('tp.component')));