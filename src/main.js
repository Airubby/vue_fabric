import Vue from 'vue'
import ElementUI from 'element-ui'
import App from '@/App'
import {router} from '@/router/index'
import Request from '@/utils/Request'

import 'element-ui/lib/theme-chalk/index.css'
import ElTablePagination from 'el-table-pagination'
import 'promise-polyfill'  //兼容低版本浏览器  
import 'babel-polyfill' //兼容低版本浏览器  

import '@/assets/css/basic.less'

// 将API方法绑定到全局
Vue.prototype.$api =Request

Vue.use(ElTablePagination)
Vue.use(ElementUI,{size: 'small'})
Vue.config.productionTip = false


function init() {
    new Vue({
        router,
        render: h => h(App),
    }).$mount('#app')
}
init();
