const path = require('path');
const crypto = require('crypto');
const assert = require('assert');

const Bot = require(path.resolve(__dirname, 'Bot.js'));
const Utils = require(path.resolve(__dirname, 'Utils.js'));

class JWT extends Bot {
  static jwtFormater({ header, body, secret }) {
    const JWTHeader = Utils.stringToBase64(Utils.jsonStableStringify(header));
    const JWTBody = Utils.stringToBase64(Utils.jsonStableStringify(body));
    const signature = crypto.createHmac('sha256', secret)
        .update(`${JWTHeader}.${JWTBody}`)
        .digest('base64');
    const result = `${JWTHeader}.${JWTBody}.${signature.substr(0, signature.length - 1)}`;
    return result;
  }

  static jwtParser({ token, secret }) {
    assert(typeof(token) == 'string', 'Invalid Token Format');
    const elements = token.split('.');
    assert(elements.length == 3, 'Invalid Token Format');
    const JWTHeader = JSON.parse(Utils.base64ToString(elements[0]));
    const JWTBody = JSON.parse(Utils.base64ToString(elements[1]));
    const secretTxt = typeof(secret) == 'string' ? secret : '';
    const signature = crypto.createHmac('sha256', secretTxt)
        .update(`${elements[0]}.${elements[1]}`)
        .digest('base64').replace(/=$/, '');
    assert(secret == undefined || elements[2] == signature, 'Invalid Token Signature');
    const result = {
        header: JWTHeader,
        body: JWTBody
    };
    return result;
  }
}

module.exports = JWT;