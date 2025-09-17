/**
 * @author     Dmytro
 * @published  June 9 2024
 * @decription Global variables for chat socket
 */

let users = []; // Array of user objects with properties { id, socketId }
let groups =[];
let sockets = {}; // Object mapping socket IDs to socket instances

module.exports = {
  users, groups, sockets
}