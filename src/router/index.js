import Vue from 'vue'
import Router from 'vue-router'
import ChartComponent from '@/components/ChartComponent'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'ChartComponent',
      component: ChartComponent
    }
  ]
})
