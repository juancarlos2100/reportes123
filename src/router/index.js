import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ReporteView1 from '../views/ReporteView1.vue'
import ReporteView2 from '../views/ReporteView2.vue'
import ReporteView3 from '../views/ReporteView3.vue'
import ReporteView4 from '../views/ReporteView4.vue'
import ReporteView5 from '../views/ReporteView5.vue'
import ReporteView6 from '../views/ReporteView6.vue'
import ReporteView7 from '../views/ReporteView7.vue'
import ReporteView8 from '../views/ReporteView8.vue'
import ReporteView9 from '../views/ReporteView9.vue'
import ReporteView10 from '../views/ReporteView10.vue'
import ReporteView11 from '../views/ReporteView11.vue'
import ReporteView12 from '../views/ReporteView12.vue'
import Desglose from '../views/ReporteDesglose.vue'
import ReporteView13 from '../views/ReporteView13.vue'
import ReporteView14 from '../views/ReporteView14.vue'
import ReporteView15 from '../views/ReporteView15.vue'
import ReporteProveedores from '../views/ReporteSaldosProveedores.vue'
import ReporteComprobacion from '../views/ReporteComprobacion.vue';
import ReporteView17 from '../views/ReporteView17.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/reporte1',
    name: 'reporte1',
    component: ReporteView1
  },
  {
    path: '/reporte2',
    name: 'reporte2',
    component: ReporteView2
  },
  {
    path: '/reporte3',
    name: 'reporte3',
    component: ReporteView3
  },
  {
    path: '/reporte4',
    name: 'reporte4',
    component: ReporteView4
  },
  {
    path: '/reporte5',
    name: 'reporte5',
    component: ReporteView5
  },
  {
    path: '/reporte6',
    name: 'reporte6',
    component: ReporteView6
  },
  {
    path: '/reporte7',
    name: 'reporte7',
    component: ReporteView7
  },
  {
    path: '/reporte8',
    name: 'reporte8',
    component: ReporteView8
  },
  {
    path: '/reporte9',
    name: 'reporte9',
    component: ReporteView9
  },
  {
    path: '/reporte10',
    name: 'reporte10',
    component: ReporteView10
  },
  {
    path: '/reporte11',
    name: 'reporte11',
    component: ReporteView11
  },
  {
    path: '/reporte12',
    name: 'reporte12',
    component: ReporteView12
  },
  {
    path: '/desglose',
    name: 'desglose',
    component: Desglose
  },
  {
    path: '/comprobacion',
    name: 'comprobacion',
    component: ReporteComprobacion
  }
  ,
  {
    path: '/reporte13',
    name: 'reporte13',
    component: ReporteView13
  },
  {
    path: '/reporte14',
    name: 'reporte14',
    component: ReporteView14
  },
  {
    path: '/reporte15',
    name: 'reporte15',
    component: ReporteView15
  },
  {
    path: '/proveedores',
    name: 'proveedores',
    component: ReporteProveedores
  },
  {
    path: '/reporte17',
    name: 'reporte17',
    component: ReporteView17
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
