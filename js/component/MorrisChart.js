/**
 * Created by meathill on 13-11-12.
 */
"use strict";
(function (ns) {
  ns.MorrisChart = Backbone.View.extend({
    $colors: null,
    initialize: function (options) {
      var chartData = JSON.parse(this.$('script').remove().html().replace(/,\s?]/, ']'));
      if (chartData.data.length <= 1) {
        this.$el.addClass('empty').text('（无数据）');
        return;
      }
      this.createOptions(options, chartData);
      this.drawChart();
    },
    createOptions: function (options, chartData) {
      var data = this.$el.data();
      options = _.extend({
        element: this.el,
        lineWidth: 2
      }, options, chartData, data);
      this.className = 'type' in options ? options.type.charAt(0).toUpperCase() + options.type.substr(1) : 'Line';
      if ('colors' in options) {
        options.colors = options.lineColors = options.barColors = options.colors.split(',');
      } else {
        options.colors = options.lineColors = options.barColors = this.$colors;
      }
      if (this.className === 'Donut') {
        options.formatter = function (y, data) {
          return 'percent' in data ? y + '(' + data.percent + '%)' : y;
        }
      }
      this.options = options;
    },
    drawChart: function () {
      this.chart = new Morris[this.className](this.options);
    }
  });
}(Nervenet.createNameSpace('tp.component')));