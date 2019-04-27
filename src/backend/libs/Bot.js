const Bots = [];

class Bot {
  constructor() {
    Bots.push(this);
  }
  init({ config, database, logger, i18n }) {
    this.config = config;
    this.database = database;
    this.logger = logger;
    this.i18n = i18n;
    return Promise.resolve(this);
  }
  start() {
    return Promise.resolve(this);
  }
  ready() {
    return Promise.resolve(this);
  }
  getBot(name) {
    const condition = new RegExp('^' + name + '$', 'i');
    const bot = Bots.find((b) => {
      return condition.test(b.name);
    });
    return Promise.resolve(bot);
  }
  
  write({ key, value }) {
    const db = this.database.leveldb;
    return new Promise((resolve, reject) => {
      db.put(key, value, (e) => {
        if(e) {
          reject(e);
        } else {
          resolve(true);
        }
      });
    });
  }
  delete({ key }) {
    const db = this.database.leveldb;
    return new Promise((resolve, reject) => {
      db.del(key, (e) => {
        if(e) {
          reject(e);
        } else {
          resolve(true);
        }
      });
    });
  }
  findOne({ key }) {
    const db = this.database.leveldb;
    return new Promise((resolve) => {
      db.get('key', (err, value) => {
        if(err) {
          reject(err);
        } else {
          resolve(value);
        }
      });
    });
  }
  find({ key }) {
    const db = this.database.leveldb;
    return new Promise((resolve) => {
      const rs = [];
      db.createReadStream({
        gte: key,
        lte: `${key}${String.fromCharCode(key.charCodeAt(0) + 1)}`
      }).on('data', ({ key, value }) => {
        rs.push({ key, value });
      }).on('end', () => {
        resolve(rs);
      });
    });
  }

  static get isBot() {
    return true;
  }
};

module.exports = Bot;