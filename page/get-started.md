## 安装

    bower install tiger-prawn --save
    
## 使用

Tiger Prawn 现在仍处于比较初级的阶段，安装和使用比较依赖人工。

它本身也在线上正常运行，现在这篇文档也是基于它制作的。使用者可以直接参考当前代码结构。

### 目录结构

Tiger Prawn 的目录结构大体如下。通常来说，基于TP开发只需要引用`dist/`目录里的内容即可。

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
    ├-- index.dev.html
    └-- gulpfile.js // 处理当前项目文件
    
## 建立新项目

1. 安装依赖
2. 复制 `index.dev.html` 到新项目根目录，改名为 `index.html`
3. 复制 `index.js` 和 `config.js` 到新项目 `js/`
4. 修改 `index.html` 里的资源引用，主要是添加对 `screen.min.css` 和 `tiger-prawn.min.js` 的引用
4. 修改 `config.js` 里的常量
5. 创建 [Backbone](http://backbonejs.org/#Router) 风格的路由，在 `index.js` 里实例化
6. 参考 `page/sidebar/default.json`，创建符合需要的侧边栏数据
7. 开发各业务功能页
8. 在浏览器里打开 `index.html` 进行预览（需要静态服务器）

## 使用其它库

Tiger Prawn 使用命名空间组织代码，侵入性在诸多框架当中是非常低的，基本可以任意组合、接入其它库。

## 针对样式的二次开发

Tiger Prawn 使用 [Bootstrap](https://getbootstrap.com/) 作为基础，所以几乎任何基于Bootstrap的样式库都可以直接使用。

Tiger Prawn 使用 [Compass](https://compass-style.org/) + [Sass](https://sass-lang.com/) 作为样式预处理工具，自身样式都放在 `sass/` 文件夹中，用户可以自由组合。大部分间距、颜色等定义在 `sass/_define.sass`，用户可以通过修改它完成整体修改。

## 针对功能的二次开发

这方面想对复杂，我们将单开一个页面详述。