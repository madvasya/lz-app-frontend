import {AxiosResponse} from 'axios'
import $api from '../api/axios'
import {AuthResponse} from '../models/response/AuthResponse'

const LOGIN_URL = '/auth/login'
const LOGOUT_URL = '/auth/logout'

export default class AuthService {
    static async login(username: string, password: string): Promise<AxiosResponse<AuthResponse>> {
        return $api.post(LOGIN_URL, {username, password})
    }

    static async logout(refresh_token: string | undefined): Promise<AxiosResponse<void>> {
        return $api.delete(LOGOUT_URL, {data: {refresh_token}})
    }
}
