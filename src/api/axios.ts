import axios from 'axios'
import useAuthStore from '../store/auth'
import {AuthResponse} from '../models/response/AuthResponse'
import {API_URL} from './consts'

const $api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
})

$api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().access_token
    config.headers.Authorization = `Bearer ${token ?? ''}`
    return config
})

$api.interceptors.response.use(
    (config) => {
        return config
    },
    async (error) => {
        const originalRequest = error.config
        const oldRefreshToken = useAuthStore.getState().refresh_token
        if (error.response.status == 401 && error.config && !error.config._isRetry) {
            originalRequest._isRetry = true
            try {
                const response = await axios.post<AuthResponse>(
                    `${API_URL}/auth/refresh`,
                    {refresh_token: oldRefreshToken},
                    {withCredentials: true}
                )
                const new_access = response.data.access_token
                const new_refresh = response.data.refresh_token
                useAuthStore.setState({access_token: new_access, refresh_token: new_refresh})
                return await $api.request(originalRequest)
            } catch (e) {
                console.log('interceptor')
            }
        }
        throw error
    }
)

export default $api
