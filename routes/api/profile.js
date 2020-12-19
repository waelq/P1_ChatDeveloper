const express = require('express');
const router = express.Router();
const request = require('request');
const config = require('config');
const auth = require('../../middleware/auth');
const {check , validationResult} = require('express-validator/check');

const Profile = require("../../models/Profile");
const { response } = require('express');
// Must put 3 things
// @route    GET api/profile/me
// @desc     Get current users profile 
// @access   Private
router.get('/me',auth,async (req,res)=>{
    try {
        // Get profile for user
        const profile = await Profile.findOne({user:req.user.id}).populate('user',['name','avatar']);
        if(!profile){
            return res.status(400).send("There is no profile for this user")
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server Profile Error")
    }
});
// @route    POST api/profile/me
// @desc     creat or update profil
// @access   Private
router.post('/',[auth,[
    check('status',"status is required").not().isEmpty(),
    check('skills',"Skills is required").not().isEmpty()

]],async (req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    const {
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,
        youtube,
        facebook,
        twitter,
        whatsapp,
        linkedin,
        instagram
    }=req.body;
    // Bulid profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    if(company) profileFields.company = company;
    if(website) profileFields.website = website;
    if(location) profileFields.location = location;
    if(bio) profileFields.bio = bio;
    if(status) profileFields.status = status;
    if(githubusername) profileFields.githubusername = githubusername;
    if(skills) { 
        profileFields.skills = skills.split(',').map(skill=>skill.trim())
    }
    console.log(profileFields.skills);
       // Bulid social object
       profileFields.social = {};
       if(youtube) profileFields.social.youtube = youtube;
       if(twitter) profileFields.social.twitter = twitter;
       if(facebook) profileFields.social.facebook = facebook;
       if(linkedin) profileFields.social.linkedin = linkedin;
       if(whatsapp) profileFields.social.whatsapp = whatsapp;
       if(instagram) profileFields.social.instagram = instagram;

        try {
            let profile = await Profile.findOne({user:req.user.id});
        //    if Profile is there
            if(profile){
                profile = await Profile.findOneAndUpdate({user:req.user.id} ,{$set:profileFields},{new:true});
                return res.json(profile)
            }
        // creat profile
        profile = new Profile(profileFields);
        await profile.save();
        res.json(profile);
        
        } catch (error) {
            console.error(error.message);
            res.status(500).send("profile Error")
        }
})
// @route    GET api/profile
// @desc     Get all profile 
// @access   Private
router.get('/',async(req,res)=>{
    try {
        const profiles = await Profile.find().populate('user',['name' ,'avatar']);
        res.json(profiles);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error get profile')
    }
})
// @route    GET api/profile/user/:user_id
// @desc     Get all profile 
// @access   Private
router.get('/user/:user_id',async(req,res)=>{
    try {
        const profile = await Profile.findOne({user:req.params.user_id}).populate('user',['name' ,'avatar']);
        if(!profile){
            return res.status(400).json({msg:"There is no profile for this user"})
        }
        res.json(profile);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error to  get  user profile')
    }
})
// @route    Delete api/profile
// @desc     Delete  profile ,user & post
// @access   Private
router.delete('/',auth,async(req,res)=>{
    try {
        // remove profile
       await Profile.findOneAndRemove({user:req.user.id});
    //    remove user
       await User.findOneAndRemove({_id:req.user.id});

        res.json({msg:"User deleted"});
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error to remove profile')
    }
})
// @route    PUT api/profile/experience
// @desc     Add profile experience
// @access   Private
router.put('/experience',[auth,[
    check('title',"Title is required").not().isEmpty(),
    check('company',"company is required").not().isEmpty(),
    check('from',"from is required").not().isEmpty(),

]],async(req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    const {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    } = req.body;

    const newExp = {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    }
    try {
        const profile = await Profile.findOne({user:req.user.id});
        profile.experience.unshift(newExp);
        await profile.save();
        res.json(profile)
    } catch (error) {
        console.error(error.message);
        res.status(400).json({msg:"Exp errors"})
    }
})
// @route    Delete api/profile/experience/:exp_id
// @desc     Delete experience from profile 
// @access   Private
router.delete('/experience/:exp_id',auth,async(req,res)=>{
    try {
         const profile = await Profile.findOne({user:req.user.id});
    // get to remove index
        const removeIndex = profile.experience
        .map(item=>item.id)
        .indexOf(req.params.exp_id);

        profile.experience.splice(removeIndex,1);
        await profile.save();
        res.json(profile.experience)

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error to remove experience from profile')
    }
})
//////// ************** Education *********
router.delete('/',auth,async(req,res)=>{
    try {
        // remove profile
       await Profile.findOneAndRemove({user:req.user.id});
    //    remove user
       await User.findOneAndRemove({_id:req.user.id});

        res.json({msg:"User deleted"});
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error to remove profile')
    }
})
// @route    PUT api/profile/education
// @desc     Add profile education
// @access   Private
router.put('/education',[auth,[
    check('school',"school is required").not().isEmpty(),
    check('degree',"degree is required").not().isEmpty(),
    check('fieldofstudy',"fieldofstudy is required").not().isEmpty(),
    check('from',"from is required").not().isEmpty(),

]],async(req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    const {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    } = req.body;

    const newEdu = {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    }
    try {
        const profile = await Profile.findOne({user:req.user.id});
        profile.education.unshift(newEdu);
        await profile.save();
        res.json(profile)
    } catch (error) {
        console.error(error.message);
        res.status(400).json({msg:"Exp errors"})
    }
})
// @route    Delete api/profile/education/:edu_id
// @desc     Delete education from profile 
// @access   Private
router.delete('/education/:edu_id',auth,async(req,res)=>{
    try {
         const profile = await Profile.findOne({user:req.user.id});
    // get to remove index
        const removeIndex = profile.education
        .map(item=>item.id)
        .indexOf(req.params.edu_id);

        profile.education.splice(removeIndex,1);
        await profile.save();
        res.json(profile.education)

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error to remove education from profile')
    }
})
// @route    GET api/profile/github/:username
// @desc     GET user repos from Github 
// @access   Public
router.get('/github/:username',(req,res)=>{
    // const username = req.body;
    console.log(req.body);
    console.log(req.params);
    try {
       const option={ 
        uri:`https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${config.get('githubClientId')}&client_secret=${config.get('githubSecret')}`,
        method:'GET',
        headers:{'user-agent':'node.js'}
    }
    request(option,(err,response,body)=>{
        if(err){
            console.error(err);
        }
        if(response.statusCode !==200){
            res.status(404).json({msg:"No Github profile Found"});
        }
        res.json(JSON.parse(body));
    })
    } catch (error) {
        console.error(error.message);
    }
})

module.exports =router ;