import { UserUpdate } from "./User"

export interface PostReadSimple{
    id: number
    user_id: number
    user: UserUpdate
    title: string
    text: string
    likes: number
    dislikes: number
    created_on: string
}
