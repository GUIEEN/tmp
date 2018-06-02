import 'reflect-metadata'
import app from './app'
import configuration from './configuration'
import { createTypeormConn } from './lib/database/createTypeormConn'

const runServer = async () => {
  await createTypeormConn()
  app.listen(configuration.port, () => console.log(`Express application is up and running on port ${configuration.port}`))
}

runServer()
  .catch(e => console.log(e))
