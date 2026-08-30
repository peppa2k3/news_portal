import app from './app.js';
import pool,{checkDatabaseConnection} from './config/database.js';
import {closeRedis,connectRedis} from './config/redis.js';
import {env} from './config/env.js';
import {logger} from './config/logger.js';
import {startWorker,stopWorker} from './jobs/worker.js';

let server;let shuttingDown=false;
const shutdown=async(signal)=>{if(shuttingDown)return;shuttingDown=true;logger.info({signal},'Graceful shutdown started');stopWorker();const force=setTimeout(()=>process.exit(1),15_000);force.unref();if(server)await new Promise(resolve=>server.close(resolve));await Promise.allSettled([pool.end(),closeRedis()]);clearTimeout(force);process.exit(0);};
try{await checkDatabaseConnection();await connectRedis();server=app.listen(env.API_PORT,()=>{logger.info({port:env.API_PORT,version:env.APP_VERSION},'News Portal API listening');startWorker();});server.requestTimeout=30_000;server.headersTimeout=35_000;server.keepAliveTimeout=5_000;}
catch(error){logger.fatal({err:error},'Unable to start API');await Promise.allSettled([pool.end(),closeRedis()]);process.exit(1);}
process.on('SIGTERM',()=>void shutdown('SIGTERM'));process.on('SIGINT',()=>void shutdown('SIGINT'));process.on('unhandledRejection',(error)=>logger.error({err:error},'Unhandled rejection'));process.on('uncaughtException',(error)=>{logger.fatal({err:error},'Uncaught exception');void shutdown('uncaughtException');});
