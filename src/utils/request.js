import axios from 'axios'

const service = axios.create({
  baseURL: 'http://127.0.0.1:8080/',
  timeout: 30 * 1000
})

service.interceptors.request.use(config => {
  config.data = JSON.stringify(config.data)
  config.headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Origin, Content-Type, X-Auth-Token, Authorization, Accept,charset,boundary,Content-Length'
  }
  return config
}, error => {
  Promise.reject(error)
})

service.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    return Promise.reject(error)
  }
)

export default service
