import Vue from 'vue'
import Router from 'vue-router'
Vue.use(Router)
export const syncRouter=[
    {
        path: '/',
        name: 'home',
        meta: { title: 'home'},
        component: () => import('@/views/Index.vue'),
    },
    {
        path: '/test',
        name: 'test',
        meta: { title: 'test'},
        component: () => import('@/views/Test.vue'),
    },
    { path: '*', component: () => import('@/views/errorPage/Loading') }, //这个不要给meta的键值对
];

/**
 * 重写路由的push方法  解决 Navigating to current location ("url") is not allowed
 */
const routerPush = Router.prototype.push
Router.prototype.push = function push(location) {
  return routerPush.call(this, location).catch(error=> error)
}

const createRouter = () => new Router({
    // mode: 'history',  //默认hash
    base: process.env.BASE_URL,
    routes: syncRouter
 })
 
 export function resetRouter () {
    const newRouter = createRouter()
    router.matcher = newRouter.matcher
 }
 export const router = createRouter()