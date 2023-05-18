import {Router} from "express";
import {UserController} from "../controller/user.controller";
const userController = new UserController();
const authMiddleware = require("../middleware/auth.middleware");

const router:Router = Router();

router.post('/post',authMiddleware, function(req, res){
    userController.createPost(req,res)
});
router.get('/post/:page',authMiddleware, function(req, res){
    userController.getPosts(req,res)
});
router.put('/post',authMiddleware, function(req, res){
    userController.editPost(req,res)
});
router.delete('/post/:id',authMiddleware, function(req, res){
    userController.deletePost(req,res)
});
router.post('/register',function (req,res) {
    userController.register(req,res)
});
router.post('/login',function (req,res) {
    userController.login(req,res)
});
router.get('/auth',authMiddleware,function (req,res) {
    userController.auth(req,res)
});
router.get('/image/:name',function (req,res) {
    userController.getImage(req,res);
});
router.get('/postcount',function (req,res) {
    userController.postCount(req,res);
})

export {router}