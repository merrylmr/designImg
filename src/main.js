import Vue from 'vue';
import App from './App';
import router from './common/router';
import VueResource from 'vue-resource';
import store from './common/store';

import clipboard from 'vue-clipboards' //复制到剪切板

Vue.use(clipboard);
Vue.use(store);
Vue.use(VueResource);
require('./assets/css/index.css');

require('./assets/css/reset.css');
require('./assets/css/iconfont/iconfont.css');

require('./assets/css/font-awesome.min.css');

Vue.config.productionTip = false;
//Vue.config.warnHandler = function (err, vm, info) {};

const vue = new Vue({
  el: '#app',
  router,
  store,
  VueResource,
  template: '<App/>',
  components: {
    App
  },
  socket: {}
})
window.vue = vue;


// WEBPACK FOOTER //
// ./src/main.js
