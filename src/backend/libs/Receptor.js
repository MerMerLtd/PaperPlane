const path = require('path');

const pem = require('pem');
const http = require('http');
const spdy  = require('spdy');
const koa = require('koa');
const session = require('koa-session');
const Router = require('koa-router');
const bodyParser = require('koa-body');
const staticServe = require('koa-static');
const dvalue = require('dvalue');

const Bot = require(path.resolve(__dirname, 'Bot.js'));
const Utils = require(path.resolve(__dirname, 'Utils.js'));
const JWT = require(path.resolve(__dirname, 'JWT.js'));

const defaultHTTP = [5566, 80];
const defaultHTTPS = [7788, 443];

class Receptor extends Bot {
  constructor() {
  	super();
    this.router = new Router();
    this.name = 'Receptor';
  }

  init({ config, database, logger, i18n }) {
    return super.init({ config, database, logger, i18n })
    .then(() => this.registerAll())
    .then(() => this);
  }

  start() {
    return super.start()
    .then(() => this.createPem())
    .then((options) => {
      const app = new koa();
      const CONFIG = {
        key: 'PaperPlane:SID',
        maxAge: 86400000,
        overwrite: true,
        httpOnly: true,
        signed: true,
        rolling: false,
        renew: false
      };
      app.keys = ['PAPER PLANE SESSION SECRET'];
      app.use(session(CONFIG, app));
      app.use(staticServe(this.config.base.static))
         .use(bodyParser({ multipart: true, maxFileSize: 10 * 1024 * 1024 }))
         .use(this.router.routes())
         .use(this.router.allowedMethods());
      return this.listen({ options, callback: app.callback() });
    });
  }

  createPem() {
    return new Promise((resolve, reject) => {
      pem.createCertificate({days: 365, selfSigned: true}, (e, d) => {
        if(e) {
      	  reject(e);
        } else {
          const pem = {
            cert: d.certificate,
            key: d.serviceKey
          };
          resolve(pem);
        }
      });
    });
  }

  registerAll() {
    return Promise.all(this.config.api.pathname.map((v) => {
      const args = v.split('|').map((v) => v.trim());
      const pathname = args[1].split(',').map((v) => v.trim());
      const options = { method: args[0].toLowerCase() };
      const operationParams = args[2].split('.');
      let operation;
      args.slice(3).map((k) => options[k] = true);
      if(/Bot/i.test(operationParams[0])) {
        return this.getBot(operationParams[1])
        .then((bot) => {
          operation = (inputs) => {
          	return bot[operationParams[2]](inputs);
          };
          return this.register({ pathname, options, operation });
        })
      } else {
        const Library = require(path.resolve(__dirname, `${operationParams[1]}.js`));
        operation = (inputs) => {
          return Library[operationParams[2]](inputs);
        }
        return this.register({ pathname, options, operation });
      }
    }));
  }

  readSession(data) {
    return Object.keys(data).map((k) => {
      if(k.indexOf('_') != 0) {
        return data[k];
      }
    }).filter((v) => v !== undefined)
  }

  resultParse({ ctx, rs }) {
    // file output
    if(rs._contentType) {
      ctx.set('Content-Type', rs._contentType);
      return rs;
    }

    // copy result
    let result = {};
    Object.keys(rs).map((k) => {
      if(k.indexOf('_') != 0) {
        result[k] = rs[k];
      }
    });

    // session operation
    let sessionOperation = rs._session || {};
    Object.keys(sessionOperation).map((k) => {
      if(sessionOperation[k] === null) {
        delete ctx.session[k];
      } else {
        ctx.session[k] = sessionOperation[k];
      }
    });
    
    return result;
  }

  register({ pathname, options, operation }) {
  	const method = options.method.toLowerCase();
    this.router[method](pathname, (ctx, next) => {
      ctx.session = ctx.session || {};
      if(!ctx.session.id) {
        ctx.session.id = dvalue.randomID(16);
      }
      const inputs = {
        body: ctx.request.body,
        files: ctx.request.files,
        params: ctx.params,
        header: ctx.header,
        query: ctx.query,
        session: this.readSession(ctx.session)
      };
      const formatInput = {
        sessionID: inputs.session.id,
        files: ctx.request.files,
        method: ctx.method,
        url: ctx.request.url
      };
      Object.keys(inputs.body).map((k) => {
        formatInput[k] = inputs.body[k];
      });
      Object.keys(inputs.params).map((k) => {
        formatInput[k] = inputs.params[k];
      });
      Object.keys(inputs.header).map((k) => {
        formatInput[k] = inputs.header[k];
      });
      Object.keys(inputs.query).map((k) => {
        formatInput[k] = inputs.query[k];
      });

      return operation(formatInput)
      .then((rs) => {
      	ctx.body = this.resultParse({ rs, ctx });
      	next();
      })
      .catch((e) => {
        console.trace(e)
        ctx.body = { error: e.message, code: e.code };
        ctx.status = 403;
      });
    });
    return Promise.resolve(true);
  }

  listen({ options, callback }) {
  	return Promise.all([
      this.listenHttp({ port: defaultHTTP.pop(), options, callback }),
      this.listenHttps({ port: defaultHTTPS.pop(), options, callback })
    ]).then(() => this);
  }

  listenHttp({ port, options, callback }) {
  	return new Promise((resolve, reject) => {
      const serverHTTP = http.createServer(options, callback);
      serverHTTP.on('error', () => {
        const newPort = defaultHTTP.pop();
        if(defaultHTTP.length == 0) {
          defaultHTTP.push(newPort + 1);
        }
        this.listenHttp({ port: newPort, options, callback });
      });
      serverHTTP.listen(port, () => {
        this.logger.log('\x1b[1m\x1b[32mHTTP \x1b[0m\x1b[21m ', `http://127.0.0.1:${port}`);
      });
    });
  }

  listenHttps({ port, options, callback }) {
    const serverHTTPS = spdy.createServer(options, callback);
    serverHTTPS.on('error', () => {
      const newPort = defaultHTTPS.pop();
      if(defaultHTTPS.length == 0) {
      	defaultHTTPS.push(newPort + 1);
      }
      this.listenHttps({ port: newPort, options, callback });
    });
    serverHTTPS.listen(port, () => {
      this.logger.log('\x1b[1m\x1b[32mHTTPS\x1b[0m\x1b[21m ', `http://127.0.0.1:${port}`);
    });
  }
}

module.exports = Receptor;