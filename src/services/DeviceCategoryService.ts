import $api from '../api/axios'
import {DeviceConfigFieldTemplate} from '../models/Config'
import {DeviceCategory} from '../models/Device'
import {DeviceStatType} from '../models/Stats'

const CATEGORIES_URL = '/categories'

export default class DeviceCategoryService {
    static async fetchExistingCategories(): Promise<DeviceCategory[]> {
        const response = await $api.get(CATEGORIES_URL)
        return response.data
    }

    static async getConfigTemplate(category_key: string): Promise<DeviceConfigFieldTemplate[]> {
        const response = await $api.get(`${CATEGORIES_URL}/${category_key}/config-template`)
        return response.data
    }

    static async fetchStatTypesForCategory(category_key: string): Promise<DeviceStatType[]> {
        const response = await $api.get(`${CATEGORIES_URL}/${category_key}/stat-types`)
        return response.data
    }
}
