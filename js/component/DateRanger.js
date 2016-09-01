/**
 * Created by meathill on 15/11/16.
 */
'use strict';
(function (ns, _, Backbone) {
  /**
   * @class
   *
   * @type Backbone.View
   */
  ns.DateRanger = Backbone.View.extend({
    events: {
      'click .shortcut': 'shortcut_clickHandler',
      'click .range input': 'input_clickHandler',
      'click .range button': 'range_clickHandler'
    },
    initialize: function () {
      this.$('.date input').datetimepicker({format: moment.DATE_FORMAT});
      if (!this.$('script').html()) {
        return;
      }

      this.template = Handlebars.compile(this.$('script').html());
      var date = new Date()
        , month = date.getMonth()
        , months = _.map(_.range(month, month - 3, -1), function (value) {
          return {
            month: value <= 0 ? value + 12 : value,
            start: moment(new Date(date.getFullYear(), value - 1, 1)).format(moment.DATE_FORMAT),
            end: moment(new Date(date.getFullYear(), value, 0)).format(moment.DATE_FORMAT)
          }
        })
        , self = this;
      this.$('script').replaceWith(this.template({ months: months }));
      this.$('.this-month').data('start', moment().startOf('month').format(moment.DATE_FORMAT));
      this.$('.this-season').data('start', moment().startOf('quarter').format(moment.DATE_FORMAT));
      this.$('.shortcut').each(function () {
        var data = $(this).data();
        data.end = self.formatDate(data.end, date.getDate(), data.start);
        data.start = self.formatDate(data.start);
        $(this).data(data)
          .attr('data-start', data.start)
          .attr('data-end', data.end);
      });
    },
    render: function (options) {
      // 默认显示一个月
      options.dateFormat = options.dateFormat || moment.DATE_FORMAT;
      var isMonth = !/d/i.test(options.dateFormat) && /M/.test(options.dateFormat)
        , unit = isMonth ? 'months' : 'days'
        , range = _.defaults(options, {
          start: isMonth ? -1 : -31,
          end: 0
        });
      this.$('.date input').each(function () {
        $(this).data("DateTimePicker").format(range.dateFormat).viewMode(unit);
      });
      this.$el.toggleClass('select-month', isMonth);

      if (!isNaN(range.start)) {
        range.start = moment().add(range.start, unit).format(range.dateFormat);
      }
      if (!isNaN(range.end)) {
        range.end = moment().add(range.end, unit).format(range.dateFormat);
      }

      this.$('[name=start]').val(range.start);
      this.$('[name=end]').val(range.end);
      var shortcut = this.$('[data-start="' + range.start + '"][data-end="' + range.end + '"]').eq(0);
      this.$('.label').text(shortcut.length ? shortcut.text() : range.start + ' ~ ' + range.end);
      return range;
    },
    trigger: function (range, options) {
      options = options || {};
      options.reset = true;
      this.model.set(range, options);
    },
    formatDate: function (date, today, start) {
      if (isNaN(date)) {
        return date;
      }
      if (today && today === 1 && date === -1 && isNaN(start)) {
        date = 0;
      }
      return moment().add(date, 'days').format(moment.DATE_FORMAT);
    },
    use: function (model) {
      this.model = model;
      var range = this.render(model.pick('start', 'end', 'dateFormat'));
      this.model.set(range, {silent: true});
    },
    input_clickHandler: function (event) {
      event.stopPropagation();
    },
    range_clickHandler: function () {
      var start = this.$('[name=start]').val()
        , end = this.$('[name=end]').val();
      this.$('.shortcut').removeClass('active');
      this.$('.label').text(start + ' - ' + end);
      this.trigger({
        start: start,
        end: end
      });
    },
    shortcut_clickHandler: function (event) {
      var item = $(event.currentTarget)
        , start = item.data('start')
        , end = item.data('end');
      item.addClass('active')
        .siblings().removeClass('active');
      this.$('.label').text(item.text());
      var range = this.render({start: start, end: end});
      this.trigger(range);
      event.preventDefault();
    }
  });
}(Nervenet.createNameSpace('tp.component'), _, Backbone));