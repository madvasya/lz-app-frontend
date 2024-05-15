import $api from '../api/axios'
import {Role, RoleCreate, RoleRead, RoleUpdate} from '../models/Role'
import {RolePermission} from '../models/Permission'

const ROLES_URL = '/roles'

export default class RoleService {
    static async fetchRoles(
        limit?: number,
        offset?: number,
        order_list?: string
    ): Promise<{roleArray: RoleRead[]; count: number}> {
        const response = await $api.get(ROLES_URL, {params: {limit, offset, order_list}})
        const roleArray = response.data
        const count = response.headers['x-total-count']
        return {roleArray, count}
    }

    static async fetchRole(id: number): Promise<RoleRead> {
        const response = await $api.get(`${ROLES_URL}/${id}`)
        return response.data
    }

    static async editRole(id: number, updatedRole: RoleUpdate): Promise<RoleRead> {
        const response = await $api.patch(`${ROLES_URL}/${id}`, updatedRole)
        return response.data
    }

    static async fetchRolePermissions(id: number): Promise<RolePermission[]> {
        const response = await $api.get(`${ROLES_URL}/${id}/permissions`)
        return response.data
    }

    static async assignPermissions(id: number, permission_list: string[]): Promise<RolePermission[]> {
        const response = await $api.post(
            `${ROLES_URL}/${id}/permissions`,
            {},
            {params: {permission_list}, paramsSerializer: {indexes: null}}
        )
        return response.data
    }

    static async unassignPermissions(id: number, permission_list: string[]): Promise<RolePermission[]> {
        const response = await $api.delete(`${ROLES_URL}/${id}/permissions`, {
            params: {permission_list},
            paramsSerializer: {indexes: null},
        })
        return response.data
    }

    static async createRole(newRole: RoleCreate): Promise<Role> {
        const response = await $api.post(ROLES_URL, newRole)
        return response.data
    }

    static async removeRole(id: number): Promise<string> {
        const response = await $api.delete(`${ROLES_URL}/${id}`)
        return response.data
    }
}
