const cluster = require('cluster');
const numCPUs = 1; //require('os').cpus().length; 
const app = require('./server.js');

if (cluster.isMaster) {
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }
    cluster.on('exit', (worker, code, signal) => {
        cluster.fork();
    });
} else {
  app.startServer();
}