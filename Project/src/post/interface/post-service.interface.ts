import { CreatePostDto } from "../dto/requests/create-post.dto";
import { UpdatePostDto } from "../dto/requests/update-post.dto";
import { PostDto } from "../dto/responses/post.dto";

export const POST_SERVICE = "PostService";

export interface IPostService {
    getPendingPosts(): Promise<PostDto[]>
    getPosts(date: string): Promise<PostDto[]>
    getMyPosts(userId: number, date: string): Promise<PostDto[]>
    getPostPhotoPath(id: number, order: number): Promise<string>;
    getPostPhotoUrls(id: number): Promise<string[]>;
    createPost(userId: number, userName: string, post: CreatePostDto): Promise<void>
    realCreatePost(id: number): Promise<void>
    updatePost(id: number, userId: number, post: UpdatePostDto): Promise<void>
    deletePost(id: number, userId: number): Promise<void>
}