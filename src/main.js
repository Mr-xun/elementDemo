// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import axios from 'axios'
import { Button,Row,Header,Aside,Main,Container,Input,Form,FormItem,DatePicker,Select,Option,Switch,Col,
  TimePicker,Checkbox,CheckboxGroup,RadioGroup,Radio,Table,TableColumn,Pagination,InputNumber,Autocomplete,
  Loading,Message,Menu,Submenu,MenuItem,MenuItemGroup,Tree } from 'element-ui'
import api from '@/utils/api'   // 引入网络请求模块
import filters from '@/utils/filter'  //过滤器


Vue.prototype.$http = axios; //把axios挂在到vue的原型上

Vue.use(Button);
Vue.use(Row);
Vue.use(Container);
Vue.use(Main);
Vue.use(Aside);
Vue.use(Header);
Vue.use(Input);
Vue.use(Form);
Vue.use(FormItem);
Vue.use(DatePicker);
Vue.use(Select);
Vue.use(Option);
Vue.use(Switch);
Vue.use(Col);
Vue.use(TimePicker);
Vue.use(Checkbox);
Vue.use(CheckboxGroup);
Vue.use(RadioGroup);
Vue.use(Radio);
Vue.use(Table);
Vue.use(TableColumn);
Vue.use(Pagination);
Vue.use(InputNumber);
Vue.use(Autocomplete);
Vue.use(Menu);
Vue.use(Submenu);
Vue.use(MenuItem);
Vue.use(MenuItemGroup);
Vue.use(Tree);
Vue.use(Loading);
Message.install = function (Vue) {
  Vue.prototype.$message = Message
}
Vue.use(Message)

Vue.config.productionTip = false;

Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
});

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>',
  api,
  filters,
});
