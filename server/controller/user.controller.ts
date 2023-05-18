import {Request,Response} from 'express';
import {pool} from "../db";
import {sign} from "jsonwebtoken";
import { readFileSync } from 'fs';
import { UploadedFile } from 'express-fileupload';


const secretKey = 'rip8';

class UserController {

    public async createPost(req:Request,res:Response){
        let text = req.body.text;
        let date = req.body.date;
        let user = req.body.user;
        let content = [];
        let file = req.files?req.files.file:[];
        let uploadpath = './media/';
        //@ts-ignore
        if(file.name !== undefined){
            //@ts-ignore
            let newname = Date.now()+user.username+'.'+file.name.split('.')[file.name.split('.').length-1];
            //@ts-ignore
            file.mv(uploadpath+newname);
            content.push(newname);
        }
        else{
            //@ts-ignore
            for(let i=0;i<file.length;i++){
                //@ts-ignore
                let newname = i+'_'+Date.now()+user.username+'.'+file[i].name.split('.')[file[i].name.split('.').length-1];
                //@ts-ignore
                file[i].mv(uploadpath+newname);
                content.push(newname);
            }
        }
        const newPost = await pool.query(`INSERT INTO posts (text,date,user_id,username,content) values ($1,$2,$3,$4,$5) RETURNING *`, [text,date,user.id,user.username,content]);
        return res.json(newPost.rows[0]);
    }
    public async deletePost(req:Request,res:Response){
        const id = req.params.id;
        const {user} = req.body;
        let posts = await pool.query(`SELECT FROM posts where id = $1 and user_id = $2`,[id,user.id]);
        if(!posts.rows[0]) return res.status(204).json({message:'not found'});
        posts = await pool.query(`DELETE FROM posts where id = $1 and user_id = $2`,[id,user.id]);
        return res.json(posts.rows[0]);
    }
    async getPosts(req:Request,res:Response){
        let offset = (parseInt(req.params.page)-1)*20;
        const posts = await pool.query(`SELECT * FROM posts ORDER BY id DESC LIMIT 20 OFFSET $1`,[offset]);
        return res.json(posts.rows);
    }
    public async editPost(req:Request,res:Response){
        const {id,text,user,content} = req.body;
        let posts = await pool.query(`SELECT FROM posts where id = $1 and user_id = $2`,[id,user.id]);
        if(!posts.rows[0]) return res.status(204).json({message:'not found'});
        const post = await pool.query(`UPDATE posts set text = $1, content = $2 where id = $3 and user_id = $4 RETURNING *`,[text,content,id,user.id]);
        return res.json(post.rows[0]);
    }
    public async register(req:Request,res:Response){
        const {username,pswd} = req.body;
        const usr = await pool.query('SELECT * FROM users where username = $1',[username]);
        if(usr.rows[0]) return res.status(208).json({message:'already exists'});
        const user = await pool.query('INSERT INTO users (username,pswd) VALUES ($1,$2) RETURNING *',[username,pswd]);
        return res.json({message:'user created'});
    }
    public async login(req:Request,res:Response){
        const {username,pswd} = req.body;
        const user = await pool.query('SELECT * FROM users where username = $1',[username]);
        if(!user.rows[0]) return res.status(203).json({message:'invalid user'});
        if(user.rows[0].pswd===pswd){
            const token = sign({id: user.rows[0].id, username: user.rows[0].username},secretKey);
            return res.json({
                token,
                user:{
                    id: user.rows[0].id,
                    username: user.rows[0].username
                }
            });
        }
        else return res.status(203).json({message:'invalid password'});
    }
    public async auth(req:Request,res:Response){
        const user = await pool.query('SELECT * FROM users where id = $1',[req.body.user.id]);
        if(!user.rows[0]) return res.status(203).json({message:'invalid user'});
        const token = sign({id: user.rows[0].id, username: user.rows[0].username},secretKey);
        return res.json({
            token,
            user:{
                id: user.rows[0].id,
                username: user.rows[0].username
            }
        });
    }
    public async getImage(req:Request,res:Response){
        let name = req.params.name;
        if(name.split('.')[name.split('.').length-1] == 'mp4') res.setHeader("Content-Type", "video/mp4")
        else res.setHeader("Content-Type", "image/jpeg");
        try{
            let data = readFileSync(`./media/${name}`);
            res.end(data);
        }
        catch(e){
            console.log(e);
        }
    }
    public async postCount(req:Request,res:Response){
        let count = await pool.query('SELECT COUNT(*) FROM posts');
        res.end(count.rows[0].count);
    }
}

export {UserController}