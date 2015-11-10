'use strict';
(function (ns) {
  var key = tp.PROJECT + '-menu-list';
  ns.SidebarEditor = Backbone.View.extend({
    events: {
      'click #eye-edit-button': 'eyeEditButton_clickHandler',
      'click #menu-edit-button': 'menuEditButton_clickHandler',
      'click #menu-search-button': 'menuSearchButton_clickHandler',
      'click #search-clear-button': 'searchClearButton_clickHandler',
      'click #menu-collapse-button': 'menuCollapseButton_clickHandler',
      'blur #menu-search-input': 'menuSearchInput_blurHandler',
      'keyup #menu-search-input': 'menuSearchInput_keyupHandler'
    },
    initialize: function () {
      this.manageSidebar();
    },
    eyeEditButton_clickHandler: function (event) {
      var target = event.currentTarget
        , item = $(target).parents('.sidebar-nav-item').attr('id')
        , store = localStorage.getItem(key)
        , menuList = JSON.parse(store);
      $(target).toggleClass('slash');
      $(target).hasClass('slash') ? menuList.push(item) : menuList.splice(menuList.indexOf(item), 1);
      localStorage.setItem(key, JSON.stringify(menuList));
      event.stopPropagation();
    },
    menuEditButton_clickHandler: function () {
      $('body').toggleClass('sidebar-editing');
      $('body').hasClass('sidebar-editing') ? $('.sidebar-nav-item').removeClass('hidden') : this.manageSidebar();
    },
    menuSearchButton_clickHandler: function (event) {
      $(event.currentTarget).fadeOut(function () {
        $('#menu-search form').fadeIn(function () {
          $(this).find('input').focus();
        });
      });
    },
    searchClearButton_clickHandler: function () {
      $('#menu-search-input').val('').focus().trigger('keyup');
    },
    menuSearchInput_blurHandler: function (event) {
      var val = $(event.currentTarget).val();
      if (!val) {
        $('#menu-search form').fadeOut(function () {
          $('#menu-search-button').fadeIn();
        });
      }
    },
    menuSearchInput_keyupHandler: function (event) {
      var val = $(event.currentTarget).val() || '\\S'
        , reg = new RegExp(val + '+');
      $('.sidebar-nav-item').each(function () {
        var title = $(this).find('.title').text()
          , isSlash = $(this).find('a .fa-eye').hasClass('slash');
        if (!isSlash) {
          reg.test(title) ? $(this).removeClass('hidden') : $(this).addClass('hidden');
        }
      });
    },
    menuCollapseButton_clickHandler: function () {
      $('body').toggleClass('sidebar-collapsed');
      $('.sidebar-nav-item > a').each(function () {
        $(this).attr('data-toggle') ? $(this).removeAttr('data-toggle') : $(this).attr('data-toggle', 'collapse');
        $(this).siblings('.nav').removeAttr('style');
      });
      if ($('body').hasClass('sidebar-collapsed')) {
        $('.sidebar-nav-item').hover(
          function () {
            $(this).find('.nav').addClass('hover');
          },
          function () {
            $(this).find('.nav').removeClass('hover');
          }
        );
      }
    },
    manageSidebar: function () {
      var store = localStorage.getItem(key);
      if (store) {
        var menuList = JSON.parse(store);
        _.each(menuList, function (element) {
          $('#' + element).addClass('hidden').find('.fa-eye').addClass('slash');
        });
      } else {
        localStorage.setItem(key, JSON.stringify([]));
      }
    }
  });
}(Nervenet.createNameSpace('tp.page')));