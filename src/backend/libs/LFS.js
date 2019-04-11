const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const dvalue = require('dvalue');

const Bot = require(path.resolve(__dirname, 'Bot.js'));
const Utils = require(path.resolve(__dirname, 'Utils.js'));

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
  constructor({ fid, rootHash, totalSlice, fileName, fileSize, contentType }) {
    this._ = { fid, rootHash, totalSlice, fileName, fileSize, contentType, waiting: [] };
    this.totalSlice = totalSlice;
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
        this._.waiting = this._.waiting.concat(
          new Array(value - currentTotal)
          .fill(0)
          .map((v, i) => i + currentTotal)
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
    return this._.waiting;
  }
  get progress() {
    try {
      return ((this.totalSlice - this.waiting.length) / this.totalSlice);
    } catch(e) {
      return 0;
    }
  }
  done(sliceIndex) {
    const i = this._.waiting.indexOf(sliceIndex);
    if(i > -1) {
      this._.waiting.splice(i, 1);
      return true;
    }
  }
  toJSON() {
    const json = dvalue.clone(this._);
    json.slice = new Array(json.totalSlice).fill(0).map((v, i) => {
      return json.waiting.indexOf(i) == -1;
    });
    json.progress = this.progress;
    return json;
  }
  toStaticString() {
    return Utils.jsonStableStringify(this._);
  }
}

/*
    post /file -> initial upload
    post /file/:fid -> save slice
    post /file/:fid -> save slice
    post /file/:fid -> save slice -> complete file
*/

/*
    LFS.META.
    LFS.JOBS.

    /meta/
    /tmpfiles/fID/sliceHash
    /files/fileHash/sliceHash

    [total][index][slice]

    JOB: { fid, rootHash, totalSlice, fileName, fileSize, contentType }
 */

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

  initialFileController() {
    const db = this.database.leveldb;
    const key = 'LFS.JOBS.';
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
      return this.newOperation({ job: operation, write: false });
    } catch(e) {
      return Promise.reject(new Error('Invalid Job Format'));
    }
  }

  findJOB({ fid }) {
    return this.JOBS.find((el) => {
      return el.fid == fid;
    });
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
  newOperation({ job, write }) {
    const key = `LFS.JOBS.${job.merkleRoot}`;
    const myJob = new Job(job);
    const stringifyJOB = myJob.toStaticString();
    this.JOBS.push(myJob);
    if(write) {
      return this.write({ key, value: stringifyJOB })
      .then(() => { return {fid: job.fid }; });
    } else {
      return Promise.resolve({ fid: job.fid });
    }
  }

  updateOperation({ fid, totalSlice, sliceIndex }) {
    const job = this.findJOB({ fid });
    job.totalSlice = totalSlice;
    job.done(sliceIndex);

    return job;
  }

  getUploadJob({ fid }) {
    const job = this.findJOB({ fid });
    return Promise.resolve(job ? job.toJSON() : {});
  }

  getMetadata({ hash }) {
    const job = this.findJOB({ fid });
    return Promise.resolve(job ? job.toJSON() : {});
  }

  getSlice({ fid, index }) {
    const slicePath = path.resolve(this);
  }

  /* 
    - generate file id
    - create tmp folder
    - create operation
  */
  initialUpload() {
    const fid = dvalue.randomID();
    const folder = path.resolve(this.folder.file, fid);
    return Utils.exists({ target: folder })
    .then((rs) => {
      if(rs) {
        return Promise.reject();
      } else {
        return Utils.initialFolder({ homeFolder: folder })
      }
    })
    .then(() => this.newOperation({ job: { fid, folder }, write: true }))
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
              const job = this.updateOperation({ fid, totalSlice: sliceData.total, sliceIndex: sliceData.index });
              return this.saveSlice({ fid, slice })
              .then(() => job.toJSON());
            } else {
              return Promise.reject(new Error('Broken Shard'));
            }
          })
          .then(resolve);
        });
      });
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

  checkFile({  }) {
    
  }

  completeFile({  }) {
    
  }

  testUpload({ files, session, sessionID }) {
    return Promise.resolve(files);
  }
}

module.exports = LFS;