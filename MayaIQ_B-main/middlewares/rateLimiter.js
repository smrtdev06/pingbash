/**
 * @Author           Dymtro
 * @Created          May 23, 2024
 * @Description     
 ** PRate Limitter for MayaIQ Backend
 */

const rateLimit = require("express-rate-limit");

const rateLimitMiddleware = rateLimit({
  windowMs: 5 * 60 * 1000, // 15 minutes
  max: 1000, // 100 requests per windowMs
  message: "Too many requests from this IP, please try again later",
});

module.exports = rateLimitMiddleware;
