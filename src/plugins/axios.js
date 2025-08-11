import axios from 'axios'

const api = axios.create({
  baseURL: 'https://feedend.bditfirm.com/api/', // your Laravel API base URL
  headers: {
    Accept: 'application/json',
  },
})

export default api
