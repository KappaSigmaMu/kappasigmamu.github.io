'use strict'

const fs = require('fs')
const errorOverlayMiddleware = require('react-dev-utils/errorOverlayMiddleware')
const evalSourceMapMiddleware = require('react-dev-utils/evalSourceMapMiddleware')
const noopServiceWorkerMiddleware = require('react-dev-utils/noopServiceWorkerMiddleware')
const ignoredFiles = require('react-dev-utils/ignoredFiles')
const redirectServedPath = require('react-dev-utils/redirectServedPathMiddleware')
const paths = require('./paths')
const getHttpsConfig = require('./getHttpsConfig')

const host = process.env.HOST || '0.0.0.0'
const sockHost = process.env.WDS_SOCKET_HOST
const sockPath = process.env.WDS_SOCKET_PATH // default: '/ws'
const sockPort = process.env.WDS_SOCKET_PORT

module.exports = function (proxy, allowedHost) {
  return {
    compress: true,
    hot: true,
    static: {
      directory: paths.appPublic,
      publicPath: paths.publicUrlOrPath.slice(0, -1),
      watch: {
        ignored: ignoredFiles(paths.appSrc)
      }
    },
    https: getHttpsConfig(),
    host,
    allowedHosts: !proxy || process.env.DANGEROUSLY_DISABLE_HOST_CHECK === 'true' ? 'all' : [allowedHost],
    client: {
      logging: 'none',
      overlay: {
        errors: true,
        warnings: false
      },
      webSocketURL: {
        hostname: sockHost,
        pathname: sockPath,
        port: sockPort
      }
    },
    historyApiFallback: {
      disableDotRule: true,
      index: paths.publicUrlOrPath
    },
    proxy,
    setupMiddlewares: (middlewares, devServer) => {
      if (!devServer) {
        throw new Error('webpack-dev-server is not defined')
      }

      middlewares.unshift({
        name: 'eval-source-map',
        middleware: evalSourceMapMiddleware(devServer)
      })
      middlewares.unshift({
        name: 'error-overlay',
        middleware: errorOverlayMiddleware()
      })

      if (fs.existsSync(paths.proxySetup)) {
        require(paths.proxySetup)(devServer.app)
      }

      middlewares.push({
        name: 'redirect-served-path',
        middleware: redirectServedPath(paths.publicUrlOrPath)
      })
      middlewares.push({
        name: 'noop-service-worker',
        middleware: noopServiceWorkerMiddleware(paths.publicUrlOrPath)
      })

      return middlewares
    }
  }
}
