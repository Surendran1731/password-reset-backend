import express from "express";
import { addString, addUser, checkUser, deletingString, findingUser, getAllData, loginUser, resettingPassword } from "../Controllers/index.js";
import { transporter } from "../Mail/mailer.js";
import { generateToken, isAuthorized } from "../Auth/auth.js";

//using express.Router as common
const router=express.Router();

//to get all the data's of the user
router.get("/",async(req,res)=>{
    try {
        const allData=await getAllData();
        res.status(200).json({Users:allData})
    } catch (error) {
        console.log("error");
        res.status(500).send("Error in getting all the data")
    }
})

//to add a user
router.post("/signup",async(req,res)=>{
    try {
        if(Object.keys(req.body).length<=0){
            return res.status(400).send("Enter email and password")
        }else{
            //check user that if the email is already registered or not
            const emailCheck=await checkUser(req.body.email);
            if(!emailCheck){
                const data={...req.body,string:"empty"};
                const user=await addUser(data);
                return res.status(200).json({message:"Register Successfully"})
            }else{
                return res.status(400).json({message:"Email Address already registered"});
            }      
        }    
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Error sign up"})
    }
})

//login user
router.post("/login",async(req,res)=>{
    try {
        if(Object.keys(req.body).length<=0){
            return res.status(400).send("Enter email and password")
        }else{
            const CheckLoginUser=await loginUser(req.body.email,req.body.password);
            if(CheckLoginUser){ 
                const token=generateToken(CheckLoginUser._id);
                return res.status(200).json({message:"login succesfull"});
            }else{
                return res.status(400).json({message:"Invalid Email or Password"});
            }  
        }    
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Error fetching login"})
    }
})

//reset password
router.post("/reset",async(req,res)=>{
    try {
         //if user doesn't enter email id it will return error
        if(!req.body.email){
            return res.status(400).json({message:"Enter email and and click reset password"})
        }else{
             const checkingUser=await checkUser(req.body.email);
             if(!checkingUser){
                res.status(400).json({message:"Reset link is already Sent or email is invalid"})
             }else{
                //creating a random string
                const generateString=Math.random().toString(36).slice(2);
                //adding generated string to the database
                const addStringToDb=await addString(checkingUser._id,generateString);
               
                //composing mail
                const link=`https://password-resetfrontend.netlify.app/reset/${generateString}`;
                const composingMail={
                    from:"surendran1848@gmail.com",
                    to:checkingUser.email,
                    subject:"Password Reset Link",
                    html:`<a href=${link}><button>Reset</button></a>`
                }
                //sendingMail
                transporter.sendMail(composingMail,(error,info)=>{
                    if(error){
                        console.log(error);
                    }else{
                        console.log("mail sent")
                    }
                })
                return res.status(200).json({message:"reset link has been sent to your mail id"});
             }       
        }    
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Error while reset password"})
    }
})

//restting password
router.post("/reset/link/:string",async(req,res)=>{
    try {
        if(Object.keys(req.body).length<1){
            return res.status(400).json({message:"Enter new password"})
        }else{
            //finding user with the random string and changing the password and then deleting the random string in the db
           const findingUserWithString=await findingUser(req.params.string);
           if(findingUserWithString){
           const changingPassword=await resettingPassword(findingUserWithString._id,req.body.password);
           const deleteString=await deletingString(findingUserWithString._id);
           return res.status(200).json({message:"password changed successfully"}); 
           }else{
            return res.status(500).json({message:"link expired try again"})
           }    
    }   
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"error while resetting password"})
    }
})

export const Router=router;