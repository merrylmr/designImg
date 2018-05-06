import Vue from 'vue'
import Router from 'vue-router'

import editor from '@/page/editor'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '*',
      component: editor
    }
  ]
})



// WEBPACK FOOTER //
// ./src/common/router.js