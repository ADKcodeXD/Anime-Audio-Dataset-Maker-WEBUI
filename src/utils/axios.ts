import { useGlobalStore } from '@/stores/store'
import axios, { AxiosResponse } from 'axios'
const httpClient = axios.create({
  baseURL: 'http://localhost:7896/'
})

// 请求拦截器
httpClient.interceptors.request.use(
  (request) => {
    return request
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
httpClient.interceptors.response.use(
  (response: AxiosResponse<ResponseModel>) => {
    if (response.status === 200) {
      if (response.data?.code && response.data?.code !== 200) {
        useGlobalStore().openSnackBar(response.data?.msg || '出现错误')
        return Promise.reject(response.data?.msg || '出现错误')
      }
    }
    return response
  },
  (error) => {
    useGlobalStore().openSnackBar('出现错误')
    return Promise.reject(error)
  }
)

export default httpClient
