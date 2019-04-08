const path = require('path');
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
    this._ = { fid, rootHash, totalSlice, fileName, fileSize, contentType };
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
  done(sliceIndex) {
    const i = this._.waiting.indexOf(sliceIndex);
    if(i > -1) {
      this._.waiting.splice(i, 1);
      return true;
    }
  }
  toJSON() {
    return dvalue.clone(this._);
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
    const total = slice.split(0, 8).readUIntBE(0, 8);
    const index = slice.split(8, 16).readUIntBE(0, 8);
    const buffer = slice.split(16);
    const result = { total, index, buffer };
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
      temp: path.resolve(base, 'TEMP'),
      file: path.resolve(base, 'FILE')
    };
    return Utils.initialFolder({ homeFolder: base })
    .then(() => Utils.initialFolder({ homeFolder: this.folder.temp }))
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
    const folder = path.resolve(this.folder.temp, fid);
    return Utils.exists({ target: folder })
    .then((rs) => {
      if(rs) {
        return Promise.reject();
      } else {
        return Utils.initialFolder({ homeFolder: folder })
      }
    })
    .then(() => this.newOperation({ job: { fid }, write: true }))
    .catch((e) => {
      return this.initialUpload();
    })
  }

  /*
    - parse slice
    - save slice file
    - update job status
  */
  saveSlice({ fid, slice }) {
    const sliceData = this.constructor.parseSlice(slice);
  }

  saveSliceFile({  }) {

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