/**
 * @author      Dmytro C.
 * @published   May 24, 2024
 * @modified    May 24, 2024
 * @description Model between backend & database
 * @methods
 ** init: Function to connect to PostgresQL & init its handle
 */

//Loading necessary dependencies
const pg = require('pg');
const { errorHandler } = require('../libs/handlers');


var DB_HANDLE = null //handler interacting with PostgresQL database

/**
 * Function to create Promise connecting to database & return
 * @returns Promise connecting to database
 */
const DB_connect = () => new Promise((res, rej) => {
  if (!DB_HANDLE) rej('Handle not created')
  DB_HANDLE.connect(err => (err ? rej(err) : res(true)))
})

/**
 * Function to connect to database & init its handle
 * @returns true:success / false:failed
 */
const init = async () => {
  const dbConfig = {
    user: 'postgres',        // Your PostgreSQL username
    host: '23.27.164.88',                             // Use 'localhost' for local connections
    database: 'chatdb', // Your PostgreSQL database name
    password: 'newPostgres', // Your PostgreSQL password
    port: 5432,            // Default PostgreSQL port
  };

  try {
    //Connecting to database
    DB_HANDLE = new pg.Client(dbConfig)
    return await DB_connect()  //Connecting to Database
  } catch (err) {
    console.log(`in connecting with Database. ${err}`)
    return false
  }
}

const DB_query = (query) => new Promise((res, rej) => {
  if (!query || !DB_HANDLE) rej("Not connected to DB yet")

  DB_HANDLE.query(query, (err, result) => {
    if (err) rej(err)

    console.log(`(${query}) implemented on DB`)
    res(result)
  })
})

/**
 * Function to run query
 * @param {STRING} query 
 * @returns result
 */
const PG_query = async (query) => await DB_query(query)

module.exports = {
  init,
  PG_query
}