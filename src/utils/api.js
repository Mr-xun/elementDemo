// 引入 axios
import axios from 'axios'
// 引入  post  跨越
import qs from 'qs'

axios.defaults.withCredentials = true; /* 让 axios 携带cookie*/

// 测试地址
// axios.defaults.baseURL = 'http://merchant.lekabao.net/materiel/';
// 线上地址
// axios.defaults.baseURL = '';
// request拦截器
// axios.interceptors.request.use(function (config) {
//     return config;
// }, function (error) {
//
//   return Promise.reject(error);
// });
const api = {
  /** get 请求
   * @param  {接口地址} url
   * @param  {请求参数} params
   */
  get(url,params){
    return new Promise((resolve,reject) => {
      axios.get(url,{
        params:params
      })
        .then((response) => {
          resolve( response.data );
        })
        .catch((error) => {
          reject( error );
        });
    })
  },
  /** post 请求
   * @param  {接口地址} url
   * @param  {请求参数} params
   */
  post(url,params){
    return new Promise((resolve,reject) => {
      axios(url,qs.stringify(params))
        .then((response) => {
          resolve( response.data );
        })
        .catch((error) => {
          reject( error );
        });
    })
  }
}
export default api
