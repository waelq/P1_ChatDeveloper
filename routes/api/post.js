const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const {check , validationResult, body} = require('express-validator/check');
const Post = require('../../models/Post');
const Profile = require('../../models/Profile')
const Users = require('../../models/Users');

// Must put 3 things
// @route    POST api/post
// @desc     Create Post
// @access   Private
router.post('/',[auth,[
    check('text',"Text is required").not().isEmpty(),
]],
async(req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    try {
        const user = await Users.findById(req.user.id).select('-password');
        const newPost = new Post({
        text :req.body.text,
        name :user.name,
        user :req.user.id,
        avatar :user.avatar,

    })
    const post = await newPost.save();
    res.json(post)
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error Posts')
    }
    
});
// @route    GET api/post
// @desc     GET all posts
// @access   Private
router.get('/',auth,async(req,res)=>{
    try {
        // most recent first  (-1)
        const posts = await Post.find().sort({date:-1});
        res.json(posts);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error get Posts')
    }
})
// @route    GET api/post/:id
// @desc     GET one posts
// @access   Private
router.get('/:id',auth,async(req,res)=>{
    try {
        const post = await Post.findById(req.params.id);
        if(!post){
            return res.status(404).send("Post not found")
        }
        res.json(post);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error get Posts')
    }
})
// @route    GET api/post/:id
// @desc     GET one posts
// @access   Private
router.delete('/:id',auth,async(req,res)=>{
    try {
        const post = await Post.findById(req.params.id);
        // check user is logged

        if(post.user.toString() !== req.user.id){
            return res.status(404).send("User not auth")
        }
        await post.remove();
        res.send('Post removed');
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Post not found')
    }
})
// ************ likes **************
// @route    PUT api/post/like/:id
// @desc     Like a post
// @access   Private
router.put('/like/:id' ,auth, async(req,res)=> {
try {
    const post = await Post.findById(req.params.id);
    // check if the user has already liked
    if(post.likes.filter(like =>like.user.toString() === req.user.id).length > 0){
        return res.status(400).json({msg:"already Liked"})
    }
    post.likes.unshift({user:req.user.id});
    await post.save();
    res.json(post.likes);
} catch (error) {
    console.error(error.message);
        res.status(500).send('Like error')
}
})
// ************UN-likes **************
// @route    PUT api/post/unlike/:id
// @desc     Unlike a post
// @access   Private
router.put('/unlike/:id' ,auth, async(req,res)=> {
    try {
        console.log(req.params.id);
        const post = await Post.findById(req.params.id);
        // check if the user has not yet been liked 
        if(post.likes.filter(like =>like.user.toString() === req.user.id).length === 0){
            return res.status(400).json({msg:"user has not yet been liked "})
        }
        // Get remove index
        const removeIndex = post.likes.map(like =>like.user.toString()).indexOf(req.user.id);

        post.likes.splice(removeIndex,1);
        await post.save();
        res.json(post.likes);
    } catch (error) {
        console.error(error.message);
            res.status(500).send('Like error')
    }
    })
 // @route    POST api/post/comment/:id
// @desc     comment on Post
// @access   Private
router.post('/comment/:id',[auth,[
    check('text',"Text is required").not().isEmpty(),
]],
async(req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    try {
        const user = await Users.findById(req.user.id).select('-password');
        const post = await Post.findById(req.params.id);

        const newComment = new Post({
            text :req.body.text,
            name :user.name,
            user :req.user.id,
            avatar :user.avatar,

    })
        post.comments.unshift(newComment)
        await post.save();
        res.json(post.comments)
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error add Comment')
    }
    
});
 // @route    Delete api/post/comment/:id/:comment_id
// @desc      Delete comment 
// @access   Private
router.delete('/comment/:id/:comment_id' ,auth ,async(req,res)=>{
    try {
        const post = await Post.findById(req.params.id);
        // Pull out comment
        const comment = post.comments.find(comment =>comment.id === req.params.comment_id);
        if(!comment){
            return res.status(404).send("comment does not found")
        }
        // check user 
        if(comment.user.toString() !== req.user.id){
            return res.status(401).json({msg:"User not auth"})
        }
        const removeIndex = post.comments.map(comment=>comment.user.toString()).indexOf(req.user.id);
        post.comments.splice(removeIndex , 1);
        // to save deleted
        await post.save();
        res.json(post.comments)

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error delete Comment')
    }
})
module.exports =router ;