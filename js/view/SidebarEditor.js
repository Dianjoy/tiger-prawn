'use strict';
(function (ns) {
  var key = tp.PROJECT + '-hidden-items';
  ns.SidebarEditor = Backbone.View.extend({
    events: {
      'click .eye-edit-button': 'eyeEditButton_clickHandler',
      'click .accordion-toggle': 'accordionToggle_clickHandler',
      'click #menu-edit-button': 'menuEditButton_clickHandler',
      'click #edit-confirm-button': 'editConfirmButton_clickHandler',
      'click #edit-cancel-button': 'editCancelButton_clickHandler',
      'click #menu-search-button': 'menuSearchButton_clickHandler',
      'click #search-clear-button': 'searchClearButton_clickHandler',
      'click #menu-collapse-button': 'menuCollapseButton_clickHandler',
      'blur #menu-search-input': 'menuSearchInput_blurHandler',
      'keyup #menu-search-input': 'menuSearchInput_keyupHandler'
    },
    initialize: function () {
      this.hiddenItems = JSON.parse(localStorage.getItem(key)) || [];
      this.template = Handlebars.compile(this.$('#navbar-side-inner').find('script').remove().html());
    },
    render: function () {
      this.$('.sidebar-nav-item').remove();
      var role = this.model.get('sidebar') ? this.model.get('sidebar') : 'default';
      $.getJSON('page/sidebar/' + role + '.json', _.bind(function (response) {
        _.each(response, function (parent) {
          var item = parent['link'] || parent['sub-id'];
          parent.visibility = this.hiddenItems.indexOf('parent-' + item) !== -1;
          if (parent.sub)  {
            _.each(parent.sub, function (child) {
              child.visibility = this.hiddenItems.indexOf(child.link) !== -1;
            }, this);
          }
        }, this);
        var html = this.template({list: response});
        this.$('#navbar-side-inner').append(html);
      }, this));
    },
    eyeEditButton_clickHandler: function (event) {
      var li = $(event.currentTarget).closest('li');
      li.toggleClass('hidden');
      event.preventDefault();
      event.stopPropagation();
    },
    menuEditButton_clickHandler: function () {
      this.$el.addClass('sidebar-editing');
      this.$('.collapse').collapse('show');
    },
    editConfirmButton_clickHandler: function () {
      var hiddenItems = _.map(this.$('.hidden'), function (node) {
        return node.id;
      });
      this.$el.removeClass('sidebar-editing');
      this.hiddenItems = hiddenItems;
      localStorage.setItem(key, JSON.stringify(hiddenItems));
    },
    editCancelButton_clickHandler: function () {
      this.$el.removeClass('sidebar-editing');
      this.$('.collapse').collapse('hide');
      this.render();
    },
    menuSearchButton_clickHandler: function () {
      this.$el.addClass('sidebar-search');
      this.$('.collapse').collapse('show');
      this.$('#menu-search-input').focus();
    },
    menuSearchInput_blurHandler: function (event) {
      if (!event.target.value) {
        this.$el.removeClass('sidebar-search');
        this.$('#navbar-side-inner').removeClass('search-typing');
      }
    },
    searchClearButton_clickHandler: function () {
      this.$('#menu-search-input').val('').focus();
    },
    menuSearchInput_keyupHandler: function (event) {
      var self = this
        , val = event.target.value.trim();
      this.$('#navbar-side-inner').addClass('search-typing');
      clearTimeout(this.searchTimeout);
      if (val) {
        this.searchTimeout = setTimeout(function () {
          var str = '.*' + val.split('').join('.*') + '.*'
            , reg = new RegExp(str);
          self.$('a[href*="#/"]').each(function () {
            var isMatch = reg.test(this.innerText);
            $(this).closest('li').toggleClass('mismatch', !isMatch);
          })
        }, 500);
      }
    },
    menuCollapseButton_clickHandler: function () {
      $('body').toggleClass('sidebar-collapsed');
    },
    accordionToggle_clickHandler: function (event) {
      if ($('body').hasClass('sidebar-collapsed')) {
        $(event.currentTarget).siblings('ul').toggleClass('view').height('auto');
        event.preventDefault();
        event.stopPropagation();
      }
    }
  });
}(Nervenet.createNameSpace('tp.view')));