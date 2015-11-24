'use strict';
(function (ns) {
  var key = tp.PROJECT + '-hidden-items'
    , eyesSelector = '.sidebar-nav-item, .sidebar-nav-item ul li';
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
      this.hiddenItems = JSON.parse(localStorage.getItem(key));
      this.template = this.template || Handlebars.compile(this.$('#navbar-side-inner').find('script').remove().html());
    },
    createSidebar: function () {
      this.$('.sidebar-nav-item').remove();
      var role = this.model.get('sidebar') ? this.model.get('sidebar') : 'default'
        , template = this.template
        , hiddenItems = this.hiddenItems;
      $.getJSON('page/sidebar/' + role + '.json', function (response) {
        if (hiddenItems) {
          _.each(response, function (parent) {
            var item = parent['link'] || parent['sub-id'];
              parent.invisibility = hiddenItems.indexOf('parent-' + item) !== -1;
            if (parent.sub)  {
              _.each(parent.sub, function (child) {
                child.invisibility = hiddenItems.indexOf(child.link) !== -1;
              });
            }
          });
        }
        var html = template({list: response});
        $('#navbar-side-inner').append(html);
      });
    },
    eyeEditButton_clickHandler: function (event) {
      var target = $(event.currentTarget)
        , li = target.closest('li');
      li.toggleClass('hidden');
      event.preventDefault();
      event.stopPropagation();
    },
    menuEditButton_clickHandler: function () {
      this.$el.addClass('sidebar-editing');
      this.$(eyesSelector).find('.collapse').collapse('show');
    },
    editConfirmButton_clickHandler: function () {
      var hiddenItems = _.map(this.$('#navbar-side-inner .hidden'), function (node) {
        return node.id;
      });
      this.$el.removeClass('sidebar-editing');
      this.hiddenItems = hiddenItems;
      localStorage.setItem(key, JSON.stringify(hiddenItems));
    },
    editCancelButton_clickHandler: function () {
      this.$el.removeClass('sidebar-editing');
      this.$(eyesSelector).find('.collapse').collapse('hide');
      this.createSidebar();
    },
    menuSearchButton_clickHandler: function () {
      this.$el.addClass('sidebar-search');
      this.$('.sidebar-nav-item ul').collapse('show');
      this.$('#menu-search-input').focus();
    },
    menuSearchInput_blurHandler: function (event) {
      var val = $(event.currentTarget).val();
      if (!val) {
        this.$el.removeClass('sidebar-search');
        this.createSidebar();
      }
    },
    searchClearButton_clickHandler: function () {
      this.$('#menu-search-input').val('').focus();
    },
    menuSearchInput_keyupHandler: function (event) {
      setTimeout(function () {
        var val = $(event.currentTarget).val().trim();
        if (val) {
          var str = '.*' + val.split('').join('.*') + '.*'
            , reg = new RegExp(str);
          this.$(eyesSelector).each(function () {
            reg.test($(this).find('.title').text()) ? $(this).show() : $(this).hide();
          });
        }
      }, 500);
    },
    menuCollapseButton_clickHandler: function () {
      $('body').toggleClass('sidebar-collapsed');
      this.$('#menu-search-button, #menu-edit-button').toggleClass('hidden');
    },
    accordionToggle_clickHandler: function (event) {
      if ($('body').hasClass('sidebar-collapsed')) {
        $(event.currentTarget).siblings('ul').toggleClass('view');
        return false;
      }
    }
  });
}(Nervenet.createNameSpace('tp.view')));