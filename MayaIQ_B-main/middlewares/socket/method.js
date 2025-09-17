/**
 * @author            Dmytro
 * @published         June 10, 2024
 * @description
 ** General methods for connection using socket.io
 */

const jwt = require("jsonwebtoken")
const { error } = require("../../libs/history")
const chatCode = require("../../libs/chatCode");

/**
 * The funtion to check token if the token is expired
 * @param {*} socket the socket whenever socket is connected
 * @param {*} data contains data including token
 * @param {*} event emit type
 * @returns true/false
 */
const isExpired = (socket, data, event) => {
  try {
    let token = data.token;
    if (token.includes("anonuser")) {
      // For anonymous users, create a minimal user object
      const user = { 
        id: 0, 
        username: "anonymous",
        isAnonymous: true 
      };
      return { user, expired: false }
    }
    let user = jwt.verify(token, process.env.JWT_SECRET);
    return { user, expired: false }
  } catch (err) {
    console.error("Token validation error:", err.message);
    socket.emit(chatCode.EXPIRED);
    return { expired: true }
  }
};

module.exports = { isExpired }