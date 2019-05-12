const path = require('path');

const Bot = require(path.resolve(__dirname, 'Bot.js'));
const Utils = require(path.resolve(__dirname, 'Utils.js'));


class WebSocket extends Bot {
  constructor() {
    super();
    this.name = 'WebSocket';
  }
}

module.exports = WebSocket;