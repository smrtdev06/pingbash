/**
 * @Author           Dymtro
 * @Created          May 23, 2024
 * @Description     
 ** Token Verify for MayaIQ Backend
 */

const jwt = require('jsonwebtoken');

const authenticateUser = async(req, res, next) => {
    const token = req.header('Authorization'); // For any authenticated request, need to pass auth-token header
    if(!token) return res.status(401).send('Access denied')

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET)
        req.user = verified;
        next();
        
    } catch (error) {
        console.log("Token Error")
        res.status(401).send()
    }
    
    
}

module.exports= authenticateUser;