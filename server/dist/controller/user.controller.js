"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const db_1 = require("../db");
const jsonwebtoken_1 = require("jsonwebtoken");
const fs_1 = require("fs");
const secretKey = 'rip8';
class UserController {
    createPost(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let text = req.body.text;
            let date = req.body.date;
            let user = req.body.user;
            let content = [];
            let file = req.files ? req.files.file : [];
            let uploadpath = './media/';
            //@ts-ignore
            if (file.name !== undefined) {
                //@ts-ignore
                let newname = Date.now() + user.username + '.' + file.name.split('.')[file.name.split('.').length - 1];
                //@ts-ignore
                file.mv(uploadpath + newname);
                content.push(newname);
            }
            else {
                //@ts-ignore
                for (let i = 0; i < file.length; i++) {
                    //@ts-ignore
                    let newname = i + '_' + Date.now() + user.username + '.' + file[i].name.split('.')[file[i].name.split('.').length - 1];
                    //@ts-ignore
                    file[i].mv(uploadpath + newname);
                    content.push(newname);
                }
            }
            const newPost = yield db_1.pool.query(`INSERT INTO posts (text,date,user_id,username,content) values ($1,$2,$3,$4,$5) RETURNING *`, [text, date, user.id, user.username, content]);
            return res.json(newPost.rows[0]);
        });
    }
    deletePost(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const { user } = req.body;
            let posts = yield db_1.pool.query(`SELECT FROM posts where id = $1 and user_id = $2`, [id, user.id]);
            if (!posts.rows[0])
                return res.status(204).json({ message: 'not found' });
            posts = yield db_1.pool.query(`DELETE FROM posts where id = $1 and user_id = $2`, [id, user.id]);
            return res.json(posts.rows[0]);
        });
    }
    getPosts(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let offset = (parseInt(req.params.page) - 1) * 20;
            const posts = yield db_1.pool.query(`SELECT * FROM posts ORDER BY id DESC LIMIT 20 OFFSET $1`, [offset]);
            return res.json(posts.rows);
        });
    }
    editPost(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id, text, user, content } = req.body;
            let posts = yield db_1.pool.query(`SELECT FROM posts where id = $1 and user_id = $2`, [id, user.id]);
            if (!posts.rows[0])
                return res.status(204).json({ message: 'not found' });
            const post = yield db_1.pool.query(`UPDATE posts set text = $1, content = $2 where id = $3 and user_id = $4 RETURNING *`, [text, content, id, user.id]);
            return res.json(post.rows[0]);
        });
    }
    register(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { username, pswd } = req.body;
            const usr = yield db_1.pool.query('SELECT * FROM users where username = $1', [username]);
            if (usr.rows[0])
                return res.status(208).json({ message: 'already exists' });
            const user = yield db_1.pool.query('INSERT INTO users (username,pswd) VALUES ($1,$2) RETURNING *', [username, pswd]);
            return res.json({ message: 'user created' });
        });
    }
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { username, pswd } = req.body;
            const user = yield db_1.pool.query('SELECT * FROM users where username = $1', [username]);
            if (!user.rows[0])
                return res.status(203).json({ message: 'invalid user' });
            if (user.rows[0].pswd === pswd) {
                const token = (0, jsonwebtoken_1.sign)({ id: user.rows[0].id, username: user.rows[0].username }, secretKey);
                return res.json({
                    token,
                    user: {
                        id: user.rows[0].id,
                        username: user.rows[0].username
                    }
                });
            }
            else
                return res.status(203).json({ message: 'invalid password' });
        });
    }
    auth(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield db_1.pool.query('SELECT * FROM users where id = $1', [req.body.user.id]);
            if (!user.rows[0])
                return res.status(203).json({ message: 'invalid user' });
            const token = (0, jsonwebtoken_1.sign)({ id: user.rows[0].id, username: user.rows[0].username }, secretKey);
            return res.json({
                token,
                user: {
                    id: user.rows[0].id,
                    username: user.rows[0].username
                }
            });
        });
    }
    getImage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let name = req.params.name;
            if (name.split('.')[name.split('.').length - 1] == 'mp4')
                res.setHeader("Content-Type", "video/mp4");
            else
                res.setHeader("Content-Type", "image/jpeg");
            try {
                let data = (0, fs_1.readFileSync)(`./media/${name}`);
                res.end(data);
            }
            catch (e) {
                console.log(e);
            }
        });
    }
    postCount(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let count = yield db_1.pool.query('SELECT COUNT(*) FROM posts');
            res.end(count.rows[0].count);
        });
    }
}
exports.UserController = UserController;
