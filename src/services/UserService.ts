import {AxiosResponse} from 'axios'
import $api from '../api/axios'
import {User, UserCreate, UserUpdate} from '../models/User'
import {Role} from '../models/Role'

const ME_URL = '/users/me'
const USERS_URL = '/users'

export default class UserService {
    static async fetchUserMe(): Promise<User> {
        const response = await $api.get(ME_URL)
        return response.data
    }

    static async fetchUsers(limit: number, offset: number, order_list?: string): Promise<AxiosResponse<User[]>> {
        const response = await $api.get(USERS_URL, {params: {limit, offset, order_list}})
        return response
    }

    static async createUser(newUser: UserCreate): Promise<AxiosResponse<User>> {
        const response = await $api.post(USERS_URL, newUser)
        return response
    }

    static async removeUser(id: number): Promise<AxiosResponse<string>> {
        const response = await $api.delete(`${USERS_URL}/${id}`)
        return response
    }

    static async updateUser(updatedUser: UserUpdate, id: number): Promise<AxiosResponse<User>> {
        const response = await $api.patch(`${USERS_URL}/${id}`, updatedUser)
        return response
    }

    static async updateUserPassword(id: number, newPassword: string): Promise<AxiosResponse<User>> {
        const response = await $api.put(`${USERS_URL}/${id}/password`, {new_password: newPassword})
        return response
    }

    static async fetchUser(id: number): Promise<User> {
        const response = await $api.get(`${USERS_URL}/${id}`)
        return response.data
    }

    static async fetchUserRoles(id: number, limit?: number, offset?: number): Promise<Role[]> {
        const response = await $api.get(`${USERS_URL}/${id}/roles`, {params: {limit, offset}})
        return response.data
    }

    static async assignRoles(id: number, role_list: string[]): Promise<Role[]> {
        const response = await $api.post(
            `${USERS_URL}/${id}/roles`,
            {},
            {params: {role_list}, paramsSerializer: {indexes: null}}
        )
        return response.data
    }

    static async unassignRoles(id: number, role_list: string[]): Promise<Role[]> {
        const response = await $api.delete(`${USERS_URL}/${id}/roles`, {
            params: {role_list},
            paramsSerializer: {indexes: null},
        })
        return response.data
    }
}
