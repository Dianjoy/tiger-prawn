Tiger Prawn
===========

“虎虾”企业级后台前端框架，旨在提供简单快捷的企业级应用开发环境。后面简称tp。

虎虾是东南亚常见的食材，体型较大，价格适中，视觉冲击力不如龙虾那么大，但是味道更好，口感也更好。如此取名便是寄寓这个框架，可能不如Angular、React那么响亮，但更好用，更强大。

## 安装

tp现在仍处于比较初级的阶段，安装和使用比较依赖人工。

建议使用[bower](https://bower.io/)进行安装。

    bower install tiger-prawn --save
    
安装后，使用`link`和`script`引用资源。tp中使用了大量外部库和框架，引用这些资源的时候，可以使用公共CDN也可以使用bower_components。

### 目录结构

tp 的目录结构大体如下。通常来说，基于tp开发只需要引用`dist/`目录里的内容即可。

    tiger-prawn
    ├-- dist/
    |   ├-- js
    |   |   ├-- tiger-prawn.js
    |   |   └-- tiger-prawn.min.js
    |   └-- css
    |       └-- screen.min.js
    ├-- sass/
    ├-- js/
    |   ├-- config.js
    |   └-- index.js
    ├-- page/ // 用来存放各种与业务逻辑相关的小页面
    |   ├-- sidebar/ // 用来存放侧边栏结构
    |   |   └-- default.json
    |   └-- login.hbs
    ├-- template/
    |   └-- popup-*.hbs // 各种编辑器表单
    └-- index.html
    
## 开发项目

1. 安装tp
2. 复制`index.html`到根目录，复制`index.js`和`config.js`到`js/`
3. 修改`index.html`里的资源引用
4. 修改`config.js`里的常量
5. 创建[Backbone](http://backbonejs.org/#Router)风格的路由，在`index.js`里使用它
6. 参考`page/sidebar/default.json`，创建符合需要的侧边栏数据
7. 开发各业务功能页
8. 在浏览器里打开`index.html`进行预览

更详细的组建使用会逐步添加。

## 二次开发

tp的侵入性在诸多框架当中是非常低的，大家可以随意组合、接入各种库，不太需要考虑冲突问题。

### 针对样式的二次开发

tp使用[Bootstrap](https://getbootstrap.com/)作为基础，所以几乎任何基于Bootstrap的样式库都可以直接使用。

tp自己的样式放在`sass/`文件夹中，用户可以直接引用，进行修改。

### 针对功能的二次开发

tp提供了大量常用组件，以及编辑工具，足以覆盖大部分办公场景。

但是，企业级场景更复杂，难免碰到力有不逮需要二次开发的时候。tp的二次开发非常简单。首先，tp是基于[Backbone](http://backbonejs.org/)的，后者是一个MV*框架；其次，“组件化”是tp的指导原则。所以，基于tp的二次开发应当这样进行：

1. 创建基于[Backbone.View](http://backbonejs.org/#View)的组件
2. 将组件注册到特定选择器上
3. 完成

## 协议

本项目在[MIT](http://opensource.org/licenses/MIT)下发布。

## TODO

1. 自动化创建项目
2. 详细文档