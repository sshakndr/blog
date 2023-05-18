export interface IPost {
    id: number
    text: string
    username: string
    user_id: number
    content: string[]
    date: string
}

export interface IUserInfo {
    token:string
    user:{
        username:string
        id:number
    }
}