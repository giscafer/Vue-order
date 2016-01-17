# Vue-order

基于vue.js+node.js+mongodb开发的订餐系统，代码注释详细，适合初学者.


PS：并不是所有页面都是用Vue.js做前台数据绑定，只是首页使用了Vue.js做数据的展示；
其他页面因Node.js方便而用了ejs渲染，样式使用Boostrap3。

**本版本还在继续开发中……在线演示版本为**[bae分支](https://github.com/giscafer/Vue-order/tree/bae)

<a href="http://vueorder.duapp.com/" target="_blank">http://vueorder.duapp.com/</a>



# Function

 - 注册+登录（注册含有效验证，激活，密码找回等整套流程）

 - 订餐功能
 
 - 评论回复

 - 统计功能（计划……）

 - 在线实时对话功能（计划……）

 - Vue.js + Webpack 开发App端（计划……）
 
# OverView

![][1]

[1]: https://github.com/giscafer/Vue-order/blob/master/src/assets/overview1.0.png


# 使用

**1、配置文件**

`src/server/config.default.js`重命名为`config.js`，然后根据注释说明修改即可。
管理员权限需要在`config.js`里边配置
```
     //超级管理员账户（user_login_name: true ）
    admins: {
        giscafer:true
    }

```
只有配置了超级管理员权限的用户登录才能看到管理员权限的相关功能模块