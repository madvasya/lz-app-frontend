import $api from '../api/axios'
import { PostReadSimple } from '../models/Post';

const POSTS_URL = '/posts'

export default class PostService {
    static async fetchPost(id: number): Promise<PostReadSimple> {
        const response = await $api.get(`${POSTS_URL}/${id}`)
        return response.data
    }

    static async fetchPosts(
        limit?: number,
        offset?: number,
        order_list?: string
    ): Promise<{postArray: PostReadSimple[]; count: number}> {
        const response = await $api.get(POSTS_URL, {params: {limit, offset, order_list}})
        const postArray = response.data
        const count = response.headers['x-total-count']
        return {postArray, count}
    }
    
    static async putLikeOnPost(
        id: number
    ): Promise<number>{
        const response = await $api.patch(`${POSTS_URL}/${id}/like`)
        return response.data
    }

    static async putDislikeOnPost(
        id: number
    ): Promise<number>{
        const response = await $api.patch(`${POSTS_URL}/${id}/dislike`)
        return response.data
    }
}
