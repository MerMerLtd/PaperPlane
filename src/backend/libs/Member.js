const path = require('path');
const crypto = require('crypto');
const assert = require('assert');
const dvalue = require('dvalue');

const Bot = require(path.resolve(__dirname, 'Bot.js'));
const Utils = require(path.resolve(__dirname, 'Utils.js'));
const JWT = require(path.resolve(__dirname, 'JWT.js'));

class User {
  constructor({ account, password, verification, config }) {
    this._ = { account };
    this.__ = config;
    this.email = account;
    this.password = password;
    this.verification = verification;
  }

  static getID(email) {
    return crypto.createHash('sha1').update(email).digest('hex');
  }

  get id() {
    return crypto.createHash('sha1').update(this._.account).digest('hex');
  }

  set account(value) {
    this._.account = value;
  }
  get account() {
    return this._.account;
  }

  set email(value) {
    this._.email = value;
  }
  get email() {
    return this._.email;
  }

  set password(value) {
    if(value == undefined) {
      return;
    } else if(value.salt != undefined && value.hash != undefined) {
      const { hash, salt } = value;
      this._.password = { hash, salt };
    } else if(typeof(value) == 'string') {
      const salt = crypto.randomBytes(24).toString('hex');
      const hash = crypto.createHmac('sha256', salt)
        .update(value)
        .digest('hex');
      this._.password = { hash, salt };
    }
  }

  set verification(value) {
    if(this._.verification == undefined) {
      const now = new Date().getTime();
      this._.verification = dvalue.default(value, {
        email: {
          checked: false
        },
        mobile: {
          checked: false
        },
        id: {
          checked: false,
        }
      });
    }
  }
  get salt() {
    return this._.password.salt;
  }
  get code() {
    const code = {
      email: this._.verification.email.code,
      mobile: this._.verification.mobile.code
    };
    return code;
  }

  get verified() {
    const result = {
      email: !!this._.verification.email.checked,
      mobile: !!this._.verification.mobile.checked,
      id: !!this._.verification.id.checked
    }
    return result;
  }

  verifyEmail(code) {
    const now = new Date().getTime();
    assert(this._.verification.email.expire > now, 'Verify Failed: Expired');
    assert(code == this._.verification.email.code, 'Verify Failed: Wrong Code');
    this._.verification.email.checked = now;
    return true;
  }

  verifyPassword({ password, hash, salt }) {
    assert(password == this._.password.hash, 'Username And Password Not Accepted');
    if(typeof(hash) == 'string' && typeop(salt) == 'string') {
      this.password = { hash, salt };
    }
    return true;
  }

  verifyMobile(code) {
    const now = new Date().getTime();
    assert(this._.verification.mobile.expire > now, 'Verify Failed: Expired');
    assert(code == this._.verification.mobile.code, 'Verify Failed: Wrong Code');
    this._.verification.mobile.checked = now;
  }

  resetEmailVerification() {
    const now = new Date().getTime();
    this._.verification.email = {
      checked: false,
      code: crypto.randomBytes(24).toString('hex'),
      expire: now + this.__.verification.emailTimeout
    };
  }

  toJSON(privateData) {
    const json = dvalue.clone(this._);
    json.id = this.id;
    json.salt = this.salt;
    json.verified = this.verified;
    delete json.password;
    delete json.verification;
    // remove private data
    if(!privateData) {
      delete json.email;
      delete json.verified;
    }
    return json;
  }
  toStaticString() {
    return Utils.jsonStableStringify(this._);
  }
}

class Member extends Bot {
  constructor() {
    super();
    this.name = 'Member';
  }

  start() {
    const secret = this.config.jwt.secret;
    const token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjoia3duQWgyb3pXTlZHM0hOTFIzVE1VeVpsckFpK3JocU5wWldFZDdpeWYyN2Z1WnlVN1Z6TDVVN1BYcjZDZWVIL3llb3laUk5sUUh6RkRjTTFDbEdxZnVubUEraDcrUE0xNy9iSlFySHk4NE9YVHdqL0QxbzB2V1lRdnhkc1owQW9kRVg5SHByNWJ2QWFvMTg0NUJGLy9yMWpUQnlQQUFWKzJVbTU0aHI2T0szOG1NM08zbTJYN2d2ZU1xamFNN05mcytuSnJjQjIxNE1MK1hnemVPemw4dXo0ZitWYlVsUGxDeWlnTWdvWFdpM3dzR0FGQTVxZDBuVmViR0l5UkVscithWkdkZVlWbzlBclQ4SGJIc096dE9lWnJRU1BLUFNmR1FLaTk5Tm1pMFZWMFYzNnZTL3ZpZnU4alExSXBuM1MrcTkrVTlyMVpGV29iTitySTFPSmhnPT0iLCJleHAiOjE1NTQ5OTc3MzgsImlhdCI6MTU1NDk1NDUzOH0.QAWDOIv3He9TjifQ14VprCk1oF5icWLWStV_AIuXI6IVxAYepT6A7RHTiXsZ8WFt-1xNlM8FLeQhRNLkd52GTpcElGkTia0ZJF8HZLsa2QN76WLW1rI_FDgx0cUnnMgUY52ohEXFBtNd3NoV7uVB2OFAgzvItYfuxq39K-71Bctd6Bq0T9zOYzYlSX6PHC2Vc3H3JzX7y8DhU3k_edR0pqUF7pK7znZRpN1dBzECxAJLZYYtez7519HUTA8TegonzjlHOm7PYB2q9BHPfKtKmBwkeFTCiabkJQR_s2cQD2q4D2fNS1ByF5jXwwtrleFBt6_P0Ulbb03TWSk8oKiOiQ";
    console.log(JWT.jwtParser({ token }));
    return super.start();
  }

  saveUser({ user }) {
    const key = `LFS.USERS.${user.id}`;
    const value = user.toStaticString();
    return this.write({ key, value })
    .then(() => user.toJSON())
  }

  findUser({ user }) {
    const key = `LFS.USERS.${user.id}`;
    return this.findOne({ key })
    .then((data) => {
      if(data != undefined) {
        const userData = JSON.parse(data);
        userData.config = this.config;
        const result = new User(userData);
        return Promise.resolve(result);
      } else {
        return Promise.reject(new Error(`User not found: ${user.id}}`));
      }
    });
  }

  async checkAccount({ account }) {
    const tmpUser = new User({ account });
    const user = await this.findUser({ user: tmpUser });
    return Promise.resolve(user.toJSON());
  }

  checkUserNotExists({ user }) {
    const key = `LFS.USERS.${user.id}`;
    return this.find({ key })
    .then((data) => {
      return data.length > 0 ?
        Promise.reject(new Error(`User Exists: ${user.account}`)) :
        Promise.resolve(true);
    });
  }

  allowRegister({ account }) {
    const user = new User({ account });
    return this.checkUserNotExists({ user })
    .then(() => {
      const result = { allow: true };
      return Promise.resolve(result);
    }, () => {
      const result = { allow: false };
      return Promise.resolve(result);
    });
  }

  register({ account, password }) {
    const user = new User({ account, password, config: this.config });
    return this.checkUserNotExists({ user })
    .then(() => this.saveUser({ user }))
    .then(() => {
      this.emailVerification({ user })
      return Promise.resolve(true);
    })
    .then(() => user.toJSON());
  }

  emailVerification({ user }) {
    const template = path.resolve(__dirname, '../../../templates/email_confirm.html');
    user.resetEmailVerification();
    this.saveUser({ user });
    return this.getBot("Mailer")
    .then((Mailer) => {
      return Mailer.sendWithTemplate({
        email: user.account,
        subject: "Email Verification with DropHere.io",
        template,
        data: {
          link: `https://${this.config.api.url}/verify?account=${user.account}&code=${user.code.email}`
        }
      });
    })
  }

  async resendEmailVerification({ email }) {
    const userData = await this.searchUser({ email });
    userData.config = this.config;
    const user = new User(userData);
    this.emailVerification({ user })
    return Promise.resolve(user.toJSON());
  }

  emailConfirm({ email, code }) {
    const tmpUser = new User({ account: email, config: this.config });
    return this.findUser({ user: tmpUser })
    .then((user) => {
      user.verifyEmail(code);
      return Promise.resolve(user);
    })
    .then((user) => {
      return this.saveUser({ user });
    });
  }

  async login({ account, password }) {
    const userData = await this.searchUser({ email: account });
    userData.config = this.config;
    const user = new User(userData);
  }

  createToken({  }) {
    
  }

  renew({ token, secret }) {
    
  }

  searchUser({ email }) {
    const id = User.getID(email);
    const key = `LFS.USERS.${id}`;
    return this.findOne({ key })
    .then((data) => {
      return Promise.resolve(JSON.parse(data));
    });
  }
}

module.exports = Member;