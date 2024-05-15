import $api from '../api/axios'
import {DeviceRead} from '../models/Device'
import {RoomRead, RoomCreate, RoomUpdate} from '../models/Room'

const ROOMS_URL = '/rooms'

export default class RoomService {
    static async fetchRooms(
        limit?: number,
        offset?: number,
        order_list?: string
    ): Promise<{roomArray: RoomRead[]; count: number}> {
        const response = await $api.get(ROOMS_URL, {
            params: {limit, offset, order_list},
        })
        const roomArray = response.data
        const count = response.headers['x-total-count']
        return {roomArray, count}
    }

    static async createRoom(newRoom: RoomCreate): Promise<RoomRead> {
        const response = await $api.post(ROOMS_URL, newRoom)
        return response.data
    }

    static async fetchRoom(id: number): Promise<RoomRead> {
        const response = await $api.get(`${ROOMS_URL}/${id}`)
        return response.data
    }

    static async editRoom(id: number, updatedRoom: RoomUpdate): Promise<RoomRead> {
        const response = await $api.patch(`${ROOMS_URL}/${id}`, updatedRoom)
        return response.data
    }

    static async removeRoom(id: number): Promise<string> {
        const response = await $api.delete(`${ROOMS_URL}/${id}`)
        return response.data
    }

    static async fetchRoomDevices(
        id: number,
        limit?: number,
        offset?: number,
        order_list?: string
    ): Promise<{deviceArray: DeviceRead[]; count: number}> {
        const response = await $api.get(`${ROOMS_URL}/${id}/devices`, {
            params: {limit, offset, order_list},
        })
        const deviceArray = response.data
        const count = response.headers['x-total-count']
        return {deviceArray, count}
    }
}
