'use strict';
(function (ns) {
  var key = tp.PROJECT + '-menu-list'
    , eyesSelector = '.sidebar-nav-item, .sidebar-nav-item ul li';
  ns.SidebarEditor = Backbone.View.extend({
    events: {
      'click .eye-edit-button': 'eyeEditButton_clickHandler',
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
      this.menuList = JSON.parse(localStorage.getItem(key));
    },
    createSidebar: function () {
      this.template = this.template || Handlebars.compile(this.$('#navbar-side-inner').find('script').remove().html());
      this.$('.sidebar-nav-item').remove();
      var role = this.model.get('sidebar') ? this.model.get('sidebar') : 'default'
        , template = this.template
        , menuList = this.menuList;
      $.getJSON('page/sidebar/' + role + '.json', function (response) {
        if (menuList) {
          _.each(response, function (parent) {
            var item = parent['link'] || parent['sub-id'];
            if (menuList.indexOf('parent-' + item) !== -1) {
              parent.invisible = 'invisible';
            }
            if (parent.sub)  {
              _.each(parent.sub, function (child) {
                if (menuList.indexOf(child.link) !== -1) {
                  child.invisible = 'invisible';
                }
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
      li.toggleClass('invisible');
      event.preventDefault();
      event.stopPropagation();
    },
    menuEditButton_clickHandler: function () {
      this.$el.addClass('sidebar-editing');
      $(eyesSelector).find('.collapse').collapse('show');
    },
    editConfirmButton_clickHandler: function () {
      var menuList = [];
      this.$el.removeClass('sidebar-editing');
      this.$('.invisible').each(function () {
        menuList.push($(this).attr('id'));
      });
      localStorage.setItem(key, JSON.stringify(menuList));
    },
    editCancelButton_clickHandler: function () {
      this.$el.removeClass('sidebar-editing');
      this.$(eyesSelector).find('.collapse').collapse('hide');
      this.createSidebar();
    },
    menuSearchButton_clickHandler: function () {
      this.$el.addClass('sidebar-search');
      this.$('#menu-search-input').focus();
    },
    menuSearchInput_blurHandler: function (event) {
      var val = $(event.currentTarget).val();
      if (!val) {
        this.$el.removeClass('sidebar-search');
      }
    },
    searchClearButton_clickHandler: function () {
      $('#menu-search-input').val('').focus();
    },
    menuSearchInput_keyupHandler: function (event) {
      var val = $(event.currentTarget).val().trim();
      if (val) {
        var str = '.*' + val.split('').join('.*') + '.*'
          , reg = new RegExp(str);
        this.$('.sidebar-nav-item ul').collapse('show');
        this.$(eyesSelector).each(function () {
          reg.test($(this).find('.title').text()) ? $(this).removeClass('hidden') : $(this).addClass('hidden');
        });
      }
    },
    menuCollapseButton_clickHandler: function () {
      $('body').toggleClass('sidebar-collapsed');
      this.$('#menu-search, #menu-edit').toggleClass('hidden');
      this.$('.sidebar-nav-item > .accordion-toggle').each(function () {
        $(this).attr('data-toggle') ? $(this).removeAttr('data-toggle') : $(this).attr('data-toggle', 'collapse');
      });
      if ($('body').hasClass('sidebar-collapsed')) {
        this.$('.sidebar-nav-item').unbind('click').click(function (event) {
          $(event.currentTarget).find('.nav').toggleClass('view');
        });
      }
    }
  });
}(Nervenet.createNameSpace('tp.view')));