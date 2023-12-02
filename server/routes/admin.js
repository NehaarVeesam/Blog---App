const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const adminLayout='../views/layouts/admin'
const jwtSecret = process.env.JWT_Secret;



const authMiddleware = (req,res,next) => {
    const token = req.cookies.token;
    if(!token)
    {
        return res.status(401).json({message:'Unauthorized'});
    }
    try{
        const decoded = jwt.verify(token , jwtSecret);
        req.userId = decoded.userId;
        next();
    }
    catch(error){
        res.status(401).json({message:'Unauthorized'});
    }
}
/**
 *  Get /
 * Home
 */

router.get('/admin',async (req , res)=>{
    try {
      const locals = {
        title:"Admin",
        description :"Simple Blog created using NodeJs , Express & MongoDb."
      }
      res.render('admin/index',{locals ,layout:adminLayout});
    } catch(error) {
      console.log(error);
    }
  })

  /**
 *  Get /
 * Admin - check login
 */
  router.post('/admin',async (req , res)=>{
    try {
      const {username,password} = req.body;
      const user = await User.findOne({username});
      if(!user){
        return res.status(401).json({message:'Invalid Credentials'});
      }

      const isPasswordValid = await bcrypt.compare(password,user.password);
      if(!isPasswordValid)
      {
        return res.status(401).json({message:'Invalid Credentials'});
      }

      const token = jwt.sign({userId:user._id},jwtSecret);
      res.cookie('token',token ,{httpOnly:true});

      res.redirect('/dashboard');
    } catch(error) {
      console.log(error);
    }
  });


  /**
   * *  Get /
  * Admin - Dashboard
  */
   router.get('/dashboard',authMiddleware, async (req , res)=>{
    try {
        const locals = {
            title:"Admin",
            description :"Simple Blog created using NodeJs , Express & MongoDb."
          }

        const data = await Post.find();
        res.render('admin/dashboard',{
            locals,data,layout:adminLayout
        });
    } catch (error) {
        console.log(error);
    }
   });



   //CREATE NEW POST
   router.get('/add-post',authMiddleware, async (req , res)=>{
    try {
        const locals = {
            title:"Add Post",
            description :"Simple Blog created using NodeJs , Express & MongoDb."
          }

        const data = await Post.find();
        res.render('admin/add-post',{
            locals,layout:adminLayout
        });
    } catch (error) {
        console.log(error);
    }
   });

   router.post('/add-post',authMiddleware, async (req , res)=>{
    try {

        try {
            const newPost = new Post({
                title:req.body.title,
                body:req.body.body
            });
            await Post.create(newPost);
            res.redirect('/dashboard');
        } catch (error) {
            console.log(error);
            
        }
        

    } catch (error) {
        console.log(error);
    }
   });
   router.get('/edit-post/:id',authMiddleware, async (req , res)=>{
    try {
        const locals = {
            title:"Add Post",
            description :"Simple Blog created using NodeJs , Express & MongoDb."
          }
        const data = await Post.findOne({_id:req.params.id});
        res.render('admin/edit-post',
        {
            data,layout:adminLayout,locals
        });

    } catch (error) {
        console.log(error);
    }
   });

   router.put('/edit-post/:id',authMiddleware, async (req , res)=>{
    try {

        await Post.findByIdAndUpdate(req.params.id,{
            title:req.body.title,
            body:req.body.body,
            updatedAt:Date.now(),
        });
        res.redirect(`/edit-post/${req.params.id}`);

    } catch (error) {
        console.log(error);
    }
   });


//   /**
//  *  Get /
//  * Admin - check login
//  */
//   router.post('/admin',async (req , res)=>{
//     try {
//       const {username,password} = req.body;
//       if(req.body.username === 'admin' && req.body.password === 'password')
//       {

//       }
//       else
//       {

//       }
//     } catch(error) {
//       console.log(error);
//     }
//   });

//    /**
//  *  Get /
//  * Admin - check register
//  */
//    router.post('/register',async (req , res)=>{
//     try {
//       const {username,password} = req.body;
//       const hashedPassword = await bcrypt.hash(password,10);

//       try {
//         const user = await User.create({username,password:hashedPassword});
//         res.status(201).json({message:'User Created',user});
//       } catch (error) {
//         if(error.code == 11000)
//         {
//             res.status(409).json({message:'User already in use'});
//         }
//         res.status(500).json({message:'Internal Server Error'})
//       }
//     } catch(error) {
//       console.log(error);
//     }
//   });


router.delete('/delete-post/:id',authMiddleware, async (req , res)=>{

    try {
        await Post.deleteOne({_id:req.params.id});
        res.redirect('/dashboard');
    } catch (error) {
        console.log('error');
    }
    
   });

   router.get('/logout', (req,res)=>{
    res.clearCookie('token');
    // res.json({message:'Logged OUT Successfully'});
    res.redirect('/');
   })
module.exports = router;