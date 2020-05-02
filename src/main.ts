import dotenv from 'dotenv'
import RouteServiceProvider from '@/providers/RouteServiceProvider'
import http from 'http'
import { createTerminus } from '@godaddy/terminus'
import Logger from '@/modules/log/Logger'
import fs from 'fs'
import MySQLConnector from '@/modules/database/MySQLConnector'
import DBServiceProvider from '@/providers/DBServiceProvider'
import RedisConnector from '@/modules/database/RedisConnector'

/**
 * For kubernetes readiness / liveness checks.
 *
 * TODO: make your own health check function like checking the database connection
 */
async function onHealthCheck(): Promise<void> {
  try {
    await MySQLConnector.I.healthcheck()
  } catch (error) {
    return Promise.reject(error)
  }

  return Promise.resolve()
}

/**
 * This function is called when shutdown signal is received.
 * Clean up all of things for graceful shutdown.
 *
 * TODO: make your own clean up function like closing the database connection
 */
async function onSignal(): Promise<void> {
  RedisConnector.I.close()
  await MySQLConnector.I.close()
}

/**
 * Start this application.
 */
async function bootApp(): Promise<void> {
  // if directory for log is not exist, make it
  if (!fs.existsSync(process.env.APP_LOG_DIR)) {
    fs.mkdirSync(process.env.APP_LOG_DIR)
  }

  // boot the services
  let app
  try {
    await DBServiceProvider.boot()
    app = RouteServiceProvider.boot()
  } catch (error) {
    // log the booting error and exit this app
    Logger.I.log('debug', `App booting error: ${error}`)
    process.exit(1)
  }

  const server = http.createServer(app)

  // configure health checking and graceful shutdown
  createTerminus(server, {
    healthChecks: {
      '/healthcheck': onHealthCheck
    },
    timeout:
      process.env.APP_ENV === 'production'
        ? parseInt(process.env.APP_SHUTDOWN_TIMEOUT, 10)
        : 1, // shutdown right after receiving signal when app env is not production
    signals: ['SIGINT', 'SIGTERM'],
    onSignal
  })

  // open server
  server.listen(process.env.APP_PORT, () => {
    process.send('ready') // graceful booting the app
  })
}

dotenv.config() // load env values
bootApp().then()
