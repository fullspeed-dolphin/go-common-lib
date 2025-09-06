import App from './App'
import Vue from 'vue'
import store from "./store";
import { toast } from "@/utils/util.js";
import request from "@/utils/request.js";

// 引入全局uView
import uView from '@/uni_modules/uview-ui'
Vue.use(uView)

store.dispatch('getUserInfo')

Vue.prototype.$toast = toast;
Vue.prototype.$axios = request;

App.mpType = "app";
Vue.config.productionTip = false;
const app = new Vue({
    ...App,
    store
});

app.$mount();