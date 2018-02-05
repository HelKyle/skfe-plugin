
# fe-sketch-plugin
A simple Sketch plugin for font end development.

## 解决什么问题
最近做 h5 页面重构的时候，遇上几个让我很难受的问题：

- 为了设配，h5 通常会使用 rem 单位，几乎所有尺寸单位，都需要手动写一遍，px2rem($pixel);
- 对于颜色，阴影这些属性，每次都得手动加 #， 或者 rgba;
- 对于一些不常用的属性，得手动查文档，比如 box-shadow linear-gradient;
- 对于一些不是很明显的样式，经常会出现错漏，比如 text-shadow;

![effect](https://ohc0m0ub0.qnssl.com/1aa80a79376eac11209dab42899138181512653717478.gif)

## 如何使用
- 下载，安装
- 快捷键 `option` + `command` + `p` 打开插件
- 点击选中图层
- 复制 scss 代码

## ChangeLog
#### 0.0.4
- 修复 CSS3 linear-gradient 角度问题
- 修复 font-weight
- 监听 sketch close document 事件，保证只有一个实例在运行

