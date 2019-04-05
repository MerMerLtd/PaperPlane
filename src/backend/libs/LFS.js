const path = require('path');

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
  }

  set fid(value) {
    this._.fid = value;
  }
  set rootHash(value) {
    this._.rootHash = value;
  }
  set totalSlice(value) {
    if(value > this._.totalSlice || (!this._.totalSlice && value > 0)) {
      this._.totalSlice = value;
    }
  }
  set fileName(value) {
    this._.fileName = value;
  }
  set fileSize(value) {
    this._.fileSize = value > 0 ? value : 0;
  }
  set contentType(value) {
    this._.contentType = value;
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
    const stringifyJOB = Utils.jsonStableStringify(job);
    this.JOBS.push(job);
    if(write) {
      return db.write({ key, value });
    } else {
      return Promise.resolve(true);
    }
  }
  updateOperation({ fid, totalSlice, sliceIndex }) {
    const job = this.JOBS.find((el) => el.fid == fid);
    if(job.totalSlice < totalSlice) {
      
    }
  }

  getMetadata({  }) {

  }

  createMetadata({  }) {

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
    .then(() => this.newOperation({ job: { fid } }))
    .catch(() => {
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
}

module.exports = LFS;