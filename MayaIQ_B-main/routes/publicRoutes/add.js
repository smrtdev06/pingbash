/**
 * @Author           Dymtro
 * @Created          May 24, 2024
 * @Description     
 ** Public adding data for MayaIQ Backend
 */
 const router = require('express').Router();
 const authenticateUser = require('../verifyToken.js');
 const httpCode = require('../../libs/httpCode.js');
 const { PG_query } = require('../../db/index.js');

