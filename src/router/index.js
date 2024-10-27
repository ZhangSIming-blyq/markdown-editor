import Vue from 'vue';
import Router from 'vue-router';
import Welcome from '@/components/Welcome.vue';
import Editor from '@/components/Editor.vue';

Vue.use(Router);

export default new Router({
  mode: 'history', // 使用 history 模式
  routes: [
    {
      path: '/',
      name: 'Welcome',
      component: Welcome
    },
    {
      path: '/editor',
      name: 'Editor',
      component: Editor
    }
  ]
});