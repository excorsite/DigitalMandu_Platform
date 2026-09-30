const restrict = (...roles)=>{
    return (req,res,next)=>{
        const roleOfUser = req.user.role;
        console.log(roleOfUser)
        // return
        if(!roles.includes(roleOfUser)){
            return res.status(403).send({message:"Access denied"});
        }else{
            next();
        }
    }
}
module.exports = restrict;