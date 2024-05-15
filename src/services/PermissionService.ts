import $api from '../api/axios'
import {RolePermission} from '../models/Permission'

const PERMISSIONS_URL = '/permissions'

export default class PermissionService {
    static async fetchPermissionsMy(): Promise<string[]> {
        return (await $api.get(`${PERMISSIONS_URL}/me`)).data
    }

    static async fetchPermissions(): Promise<RolePermission[]> {
        return (await $api.get(PERMISSIONS_URL)).data
    }
}
