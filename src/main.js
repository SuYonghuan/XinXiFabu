import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementUI from 'element-ui'
import { get } from 'http/http'
import VueKonva from 'vue-konva'

import 'common/scss/index.scss'
ElementUI.Dialog.props.closeOnClickModal = false
ElementUI.Dialog.props.closeOnPressEscape = false
ElementUI.Breadcrumb.props.separatorClass.default = 'el-icon-arrow-right'
Vue.use(ElementUI)
Vue.use(VueKonva)
Vue.config.productionTip = false

//引入Excel
import Blob from './vendor/Blob'
// import Export2Excel from './vendor/Export2Excel.js'

// 引入echarts
import echarts from "echarts";
Vue.prototype.$echarts = echarts;


get('/static/config/config.json')
  .then((res) => {
    store.dispatch('setConfig', res)
    new Vue({
      router,
      store,
      render: h => h(App)
    }).$mount('#app')
  })
  .catch((err) => {
    console.log('Check if config.json exists')
  })
