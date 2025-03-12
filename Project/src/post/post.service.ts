import fs from "node:fs/promises";
import { join } from "path";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { InjectRedis } from "@nestjs-modules/ioredis";
import { Repository } from "typeorm";
import { Redis } from "ioredis";
import { EntityNotFound } from "../common/errors/entity-not-found.error";
import { ProcessFailed } from "../common/errors/process-failed.error";
import { DateHelperService } from "../common/helpers/date-helper.service";
import { IPostService } from "./interface/post-service.interface";
import { UserInfo } from "../common/types/user-info.type";
import { Post } from "./entity/post.entity";
import { PostDto } from "./dto/responses/post.dto";
import { CreatePostDto } from "./dto/requests/create-post.dto";
import { UpdatePostDto } from "./dto/requests/update-post.dto";
import { FileNotFound } from "../common/errors/file-not-found.error";

@Injectable()
export class PostService implements IPostService {
    constructor(
        @InjectRepository(Post)
        private readonly repository: Repository<Post>,
        @InjectRedis()
        private readonly redis: Redis,
        private readonly dateHelperService: DateHelperService
    ) {
        this.registerUploadPendingPosts();
    }

    // 승인 대기중인 게시물들을 가져옵니다. redis에서 hash에 post:pending:* 에 매치되는 키들을 모두 가져와 하나씩 조회합니다.
    async getPendingPosts(): Promise<PostDto[]> {
        let cursor = "0";
        const keys: string[] = [];
        const results: PostDto[] = [];

        do {
            const result = await this.redis.scan(cursor, "MATCH", "post:pending:*", "COUNT", 300);

            cursor = result[0];
            keys.push(...result[1]);
        } while(cursor !== "0");

        for(const key of keys) {
            const value = await this.redis.hget(key, "json");
            if(value) {
                const match = /post:pending:(\d+)$/.exec(key); // scan의 MATCH는 매칭되는 값들을 찾긴 하지만, 어떨때는 매칭되지 않는 값도 가져오기도 하므로 한번 더 정규식을 통해 걸러냅니다. 또한 이를 통해 키에서 id값을 추출 할 수 있도록 합니다.
                if(!match) {
                    continue;
                }

                const id = Number(match[1]);
                const date = await this.redis.zscore("post:temp", id);
                if(!date) {
                    continue;
                }

                const json: { post: CreatePostDto, user: { id: number, name: string } } = JSON.parse(value);
                const user: UserInfo = { id: json.user.id, name: json.user.name };

                const dto = new PostDto(id, json.post.title, json.post.content, 0, date, user);
                results.push(dto);
            }
        }
        return results;
    }

    // 해당하는 date 이전의 게시물들을 조회, 20개 제한
    async getPosts(date: string): Promise<PostDto[]> {
        const results = await this.repository
            .createQueryBuilder("post")
            .select(["post.id", "post.title", "post.content", "post.createAt", "COUNT(comment.id) as commentCount"])
            .leftJoin("post.user", "user", "user.disableAt IS NULL")
            .addSelect(["user.id", "user.name"])
            .leftJoin("post.comments", "comment")
            .where("post.createAt < :date", { date: date })
            .groupBy("post.id, user.id, user.name")
            .orderBy("post.createAt", "DESC")
            .getRawMany();
        if(!results || results.length === 0) {
            throw new EntityNotFound("Post not found");
        }

        const posts: PostDto[] = [];
        results.forEach(result => {
            const kst = this.dateHelperService.toKst(result["post_create_at"]);
            const userInfo: UserInfo = { id: result["user_id"] ?? 0, name: result["user_name"] ?? "탈퇴한 사용자" };

            const post = new PostDto(result["post_id"], result["post_title"], result["post_content"], Number(result["commentCount"]), kst, userInfo);
            posts.push(post);
        });
        return posts;
    }

    // 내 게시물만 조회하며, 해당하는 date 이전의 게시물들을 조회
    async getMyPosts(userId: number, date: string): Promise<PostDto[]> {
        const results = await this.repository
            .createQueryBuilder("post")
            .select(["post.id", "post.title", "post.content", "post.createAt", "COUNT(comment.id) as commentCount"])
            .leftJoin("post.comments", "comment")
            .where("post.userId = :id AND post.createAt < :date", { id: userId, date: date })
            .groupBy("post.id")
            .orderBy("post.createAt", "DESC")
            .getRawMany();
        if(!results || results.length === 0) {
            throw new EntityNotFound("Post not found");
        }

        const posts: PostDto[] = [];
        results.forEach(result => {
            const kst = this.dateHelperService.toKst(result["post_create_at"]);
            const post = new PostDto(result["post_id"], result["post_title"], result["post_content"], Number(result["commentCount"]), kst);
            posts.push(post);
        });
        return posts;
    }

    async getPostPhotoPath(id: number, order: number): Promise<string> {
        const filePath = join(process.cwd() + `/uploads/posts/${id}/${order}-photo.jpg`);

        try {
            await fs.access(filePath);
        } catch {
            throw new FileNotFound();
        }

        return filePath;
    }

    // id에 해당하는 게시물의 사진 이름들을 가져와서 앱에서 불러올 수 있는 url로 변환
    async getPostPhotoUrls(id: number): Promise<string[]> {
        const dirPath = join(process.cwd() + `/uploads/posts/${id}`);

        try {
            await fs.access(dirPath);
        } catch {
            throw new FileNotFound("Files not found");
        }

        const fileNames = await fs.readdir(dirPath);
        const result = fileNames.map(fileName => {
            const order = fileName.replace(/-photo\.jpg$/, "");
            const link = `/posts/${id}/photos/${order}`;
            return link;
        });
        return result;
    }

    // DB가 아닌 redis에 임시로 게시물 생성
    async createPost(userId: number, userName: string, post: CreatePostDto): Promise<void> {
        const postId = await this.redis.incr("post:id");
        const value = { post: post, user: { id: userId, name: userName } };

        await this.redis.zadd("post:temp", Date.now(), postId);
        await this.redis.hset(`post:pending:${postId}`, "json", JSON.stringify(value));
    }

    // 관리자의 요청이 있을 때 호출됨, redis에서 해당하는 id의 게시물을 가져온 후 DB로 이동
    async realCreatePost(id: number): Promise<void> {
        const value = await this.redis.hget(`post:pending:${id}`, "json");
        if(!value) {
            throw new EntityNotFound("Post not found");
        }

        const canProcess = await this.redis.setnx(`post:processing:${id}`, 1);
        if(!canProcess) {
            throw new ProcessFailed();
        }

        await this.redis.expire(`post:processing:${id}`, 10);
        await this.uploadPost(id);
    }

    async updatePost(id: number, userId: number, post: UpdatePostDto): Promise<void> {
        const exist = await this.repository.exists({
            where: { id: id, userId: userId }
        });
        if(!exist) {
            throw new EntityNotFound("Post not found");
        }

        await this.repository
            .createQueryBuilder()
            .update()
            .set({
                title: post.title,
                content: post.content
            })
            .where("id = :id", { id: id })
            .execute();
    }

    async deletePost(id: number, userId: number): Promise<void> {
        const exist = await this.repository.exists({
            where: { id: id, userId: userId }
        });
        if(!exist) {
            throw new EntityNotFound("Post not found");
        }

        await this.repository.delete({ id: id });
    }

    // 1분마다 redis를 확인 해 15분이 지난 게시물들을 자동으로 DB로 이동시킴
    private registerUploadPendingPosts() {
        setInterval(async () => {
            const fifteenMinutesAgo = Date.now() - 15 * 60 * 1000;

            const expiredIds = await this.redis.zrangebyscore("post:temp", 0, fifteenMinutesAgo);
            if(expiredIds.length === 0) {
                return;
            }

            for(const id of expiredIds) {
                const canProcess = await this.redis.setnx(`post:processing:${id}`, 1);
                if(!canProcess) {
                    continue;
                }

                await this.redis.expire(`post:processing:${id}`, 10);
                await this.uploadPost(Number(id));
            }
        }, 60000);
    }

    // redis에서 DB로 게시물을 이동시키는 실제 메서드. 이동이 끝난 게시물은 redis에서 삭제
    private async uploadPost(id: number): Promise<void> {
        const jsonData = await this.redis.hget(`post:pending:${ id }`, "json");
        if(jsonData) {
            const post: { post: CreatePostDto, user: { id: number, name: string } } = JSON.parse(jsonData);

            await this.repository
                .createQueryBuilder()
                .insert()
                .into(Post, ["title", "content", "userId"])
                .values({
                    title: post.post.title,
                    content: post.post.content,
                    userId: post.user.id
                })
                .execute();

            await this.redis.multi()
                .zrem("post:temp", id)
                .hdel(`post:pending:${ id }`, "json")
                .del(`post:processing:${ id }`)
                .exec();
        }
    }
}