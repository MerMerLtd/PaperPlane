const fs = require('fs');
const path = require('path');
const url = require('url');
const crypto = require('crypto');
const dvalue = require('dvalue');

const Bot = require(path.resolve(__dirname, 'Bot.js'));
const Utils = require(path.resolve(__dirname, 'Utils.js'));
const MerkleTree = require(path.resolve(__dirname, 'MerkleTree.js'));

/*
  fid
  rootHash
  totalSlice
  fileName
  fileSize
  contentType
  waiting
*/
class Job {
  constructor({ fid, rootHash, totalSlice, fileName, fileSize, contentType, slices }) {
    this._ = { fid, rootHash, fileName, fileSize, contentType, slices: [] };
    this.totalSlice = totalSlice;
    this.slices = slices;
  }

  set fid(value) {
    this._.fid = value;
  }
  get fid() {
    return this._.fid;
  }
  set rootHash(value) {
    this._.rootHash = value;
  }
  get rootHash() {
    return this._.rootHash;
  }
  set totalSlice(value) {
    if(value > this._.totalSlice || (!this._.totalSlice && value > 0)) {
      const currentTotal = this._.totalSlice > 0 ? this._.totalSlice : 0;
      if(currentTotal < value) {
        this._.totalSlice = value;
        this._.slices = this._.slices.concat(
          new Array(value - currentTotal).fill(false)
        );
      }
      this._.totalSlice = value;
    }
  }
  get totalSlice() {
    return this._.totalSlice || 0;
  }
  set fileName(value) {
    this._.fileName = value;
  }
  get fileName() {
    return this._.fileName || '';
  }
  set fileSize(value) {
    this._.fileSize = value > 0 ? value : 0;
  }
  get fileSize() {
    return this._.fileSize || 0;
  }
  set contentType(value) {
    this._.contentType = value;
  }
  get contentType() {
    return this._.contentType;
  }
  get waiting() {
    return this._.slices.map((v, i) => !v ? i : false).filter((v) => v)
  }
  get progress() {
    try {
      const completeCount = this._.slices.reduce((prev, curr) => {
        return curr ? prev + 1 : prev
      }, 0)
      return (completeCount / this.totalSlice);
    } catch(e) {
      return 0;
    }
  }
  set slices(value) {
    if(Array.isArray(value) && value.length == this.totalSlice) {
      this._.slices = value;
    }
  }
  get slices() {
    return this._.slices;
  }
  done({ sliceIndex, sliceHash }) {
    this._.slices[sliceIndex] = sliceHash;
  }
  toJSON() {
    const json = dvalue.clone(this._);
    json.progress = this.progress;
    json.waiting = this.waiting;
    return json;
  }
  toStaticString() {
    return Utils.jsonStableStringify(this._);
  }
}

class Letter {
  constructor({ lid }) {
    this._ = { lid };
  }

  set lid(value) {
    if(value != undefined) {
      this._.lid = value;
    }
  }
  get lid() {
    return this._.lid;
  }
}

class LFS extends Bot {
  constructor() {
    super();
    this.name = 'LFS';
  }

  static parseSlice({ slice }) {
    if(!Buffer.isBuffer(slice) || slice.length < 16) {
      return Promise.reject(new Error('Invalid Slice Format'));
    }
    const total = slice.slice(0, 8).readIntBE(2, 6);
    const index = slice.slice(8, 16).readIntBE(2, 6);
    const sha1 = crypto.createHash('sha1').update(slice).digest('hex');
    const result = { total, index, sha1 };
    return Promise.resolve(result);
  }

  init({ config, database, logger, i18n }) {
    return super.init({ config, database, logger, i18n });
  }

  start() {
    return super.start()
    .then(() => this.initialAll());
  }

  ready() {

  }

  initialAll() {
    return this.initialFileController()
    .then(() => this.initialFolder());
  }

  initialFolder() {
    const base = path.resolve(this.config.homeFolder, 'LFS');
    this.folder = {
      file: path.resolve(base, 'FILE')
    };
    return Utils.initialFolder({ homeFolder: base })
    .then(() => Utils.initialFolder({ homeFolder: this.folder.file }));
  }

  /* for letter
      initialLetter
      updateLetter
      findLetter
      deleteLetter
      sendLetter
  */
  initialLetter({ session, password }) {
    const letterID = Utils.randomNumberString(6);
  }
  updateLetter({ session, lid, password }) {
    
  }
  saveLetter({ letter }) {

  }
  findLetter({ lid }) {

  }
  deleteLetter({ lid }) {

  }
  sendLetter({ lid, email, sender }) {
    const template = path.resolve(__dirname, '../../../templates/email_sendPaperPlane.html');
    this.getBot("Mailer")
    .then((Mailer) => {
      return Mailer.sendWithTemplate({
        email: email,
        subject: `A letter from ${sender} on DropHere.io`,
        template,
        data: {
          sender,
          link: `https://${this.config.api.url}/?lid=${lid}`
        }
      });
    })
  }

  initialFileController() {
    const db = this.database.leveldb;
    const key = 'LFS.FILES.';
    this.JOBS = [];
    return this.find({ key })
    .then((rs) => {
      return Promise.all(rs.map((job) => {
        return this.resumeOperation({ job });
      }));
    });
  }

  resumeOperation({ job }) {
    try {
      const operation = JSON.parse(job.value);
      return this.newOperation({ job: operation });
    } catch(e) {
      console.log(e)
      return Promise.reject(new Error('Invalid Job Format'));
    }
  }

  findJOB({ fid, rootHash }) {
    return this.JOBS.find((el) => {
      let result = true;
      if(fid !== undefined ) {
        result = result && el.fid == fid;
      }
      if(rootHash !== undefined) {
        result = result && el.rootHash == rootHash;
      }
      return result;
    });
  }
  saveJOB({ job }) {
    const key = `LFS.FILES.${job.fid}`;
    const value = job.toStaticString();
    return this.write({ key, value });
  }
  deleteJOB({ job }) {
    const key = `LFS.FILES.${job.fid}`;
    return this.delete({ key });
  }

  /*
    fid
    rootHash
    totalSlice
    fileName
    fileSize
    contentType
    waiting
  */
  newOperation({ job }) {
    const myJob = new Job(job);
    this.JOBS.push(myJob);
    return Promise.resolve({ fid: job.fid });
  }

  updateOperation({ fid, totalSlice, sliceIndex, sliceHash }) {
    const job = this.findJOB({ fid });
    job.totalSlice = totalSlice;
    job.done({ sliceIndex, sliceHash });

    return job;
  }

  getMetadata({ fid, rootHash }) {
    const job = this.findJOB({ fid, rootHash });
    let result = {};
    if(job) {
      const baseSlicePath = fid ?
        `/upload/${fid}/` :
        rootHash ? 
          `/file/${rootHash}/` :
          '';
      result = job.toJSON();
      result.slices = result.slices.map((v) => {
        return url.format({
          protocol: ':',
          slashes: true,
          host: this.config.api.url,
          pathname: `${baseSlicePath}${v}`
        });
      })
    }
    return Promise.resolve(result);
  }

  getSlice({ fid, rootHash, hash }) {
    const job = this.findJOB({ fid, rootHash });
    const sliceFolder = path.resolve(this.folder.file, job.fid);
    const slicePath = path.resolve(sliceFolder, hash);
    return new Promise((resolve, reject) => {
      fs.readFile(slicePath, (e, d) => {
        if(e) {
          reject(e);
        } else {
          d._contentType = 'application/octet-stream';
          resolve(d);
        }
      })
    });
  }

  /* 
    - generate file id
    - create tmp folder
    - create operation
  */
  initialUpload({ fileName, fileSize, contentType, totalSlice }) {
    const fid = `JOB${dvalue.randomID(13)}`;
    const folder = path.resolve(this.folder.file, fid);
    return Utils.exists({ target: folder })
    .then((rs) => {
      if(rs) {
        return Promise.reject();
      } else {
        return Utils.initialFolder({ homeFolder: folder })
      }
    })
    .then(() => this.newOperation({ job: { fid, folder, fileName, fileSize, contentType, totalSlice } }))
    .catch((e) => {
      return this.initialUpload();
    })
  }

  /*
    - parse slice
    - save slice file
    - update job status
  */
  uploadSlice({ fid, hash, files }) {
    try {
      const job = this.findJOB({ fid });
      if(job.progress === 1) {
        return job.toJSON();
      }
      const sliceMeta = Object.values(files)[0];
      return new Promise((resolve, reject) => {
        fs.readFile(sliceMeta.path, (e, slice) => {
          slice.fid = fid;
          slice.checkHash = hash;
          slice.temp = sliceMeta.path;
          if(e) {
            return reject(e);
          }
          return this.constructor.parseSlice({ slice })
          .then((sliceData) => {
            sliceData.match = (sliceData.sha1 == hash);
            if(sliceData.match) {
              const job = this.updateOperation({
                fid,
                totalSlice: sliceData.total,
                sliceIndex: sliceData.index,
                sliceHash: sliceData.sha1
              });
              return this.saveSlice({ fid, slice })
              .then(() => {
                return this.checkFile({ fid }) ?
                  this.completeFile({ fid }) : 
                  Promise.resolve(true);
              })
              .then(() => this.saveJOB({ job }))
              .then(() => job.toJSON())
            } else {
              return Promise.reject(new Error(`Broken Shard: ${sliceData.sha1}`));
            }
          })
          .then(resolve, reject);
        });
      })
    } catch(e) {
      return Promise.reject(e);
    }
  }

  saveSlice({ fid, slice }) {
    const sliceFolder = path.resolve(this.folder.file, fid);
    const slicePath = path.resolve(sliceFolder, slice.checkHash);
    return new Promise((resolve, reject) => {
      fs.writeFile(slicePath, slice, (e, d) => {
        if(e) {
          reject(e);
        } else {
          resolve(true);
        }
      });
    })
    .then(() => {
      return new Promise((resolve, reject) => {
        fs.unlink(slice.temp, (e, d) => {
          if(e) {
            reject(e);
          } else {
            resolve(true);
          }
        });
      });
    })
  }

  deleteFile({ fid, rootHash }) {
    // delete folder

    // delete memory

    // delete db
  }

  checkFile({ fid }) {
    const job = this.findJOB({ fid }) || {};
    return job.progress == 1 && job.rootHash != undefined;
  }

  completeFile({ fid }) {
    try {
      const job = this.findJOB({ fid });
      const merkleRoot = MerkleTree.caculateMerkleRoot(job.slices);
      job.rootHash = merkleRoot;
      return Promise.resolve(true);
    } catch(e) {
      return Promise.reject(e);
    }
  }

  testUpload({ files, session, sessionID }) {
    return Promise.resolve(files);
  }

  testSession1({}) {
    return Promise.resolve({ _session: { a: 111, b: 222, c: 333 } });
  }
  testSession2({}) {
    return Promise.resolve({ _session: { a: null } });
  }

  testNotice({ fid }) {
    const template = path.resolve(__dirname, '../../../templates/email_sendPaperPlane.html');
    this.getBot("Mailer")
    .then((Mailer) => {
      return Mailer.sendWithTemplate({
        email: "ccw1984@hotmail.com",
        subject: "A GIFT FROM SOMEBODY",
        template,
        data: {
          sender: "路人甲",
          link: `https://www.google.com/?DropHere=${fid}`
        }
      });
    })
  }
}

module.exports = LFS;