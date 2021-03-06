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
    return this._.slices.map((v, i) => !v ? i : false).filter((v) => v === undefined)
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
  constructor({ lid, files, owner }) {
    this._ = { lid, owner };
    this._.files = Array.isArray(files) ? files : [];
  }

  set lid(value) {
    if(value != undefined) {
      this._.lid = value;
    }
  }
  get lid() {
    return this._.lid;
  }

  set owner(value) {
    if(value != undefined) {
      this._.owner = value;
    }
  }
  get owner() {
    return this._.owner;
  }

  addFile({ fid }) {
    if(typeof(fid) === 'string' && this._.files.indexOf(fid) === -1) {
      this._.files.push(fid);
      return true;
    }
  }
  deleteFile({ fid }) {
    const index = this._.files.indexOf(fid);
    if(index > -1) {
      this._.files.splice(index, 1);
      return true;
    }
  }
  toJSON({ link }) {
    const json = dvalue.clone(this._);
    const baseURL = link || '';
    json.files = json.files.map((v) => {
      return url.resolve(baseURL, v);
    });
    return json;
  }
  toStaticString() {
    return Utils.jsonStableStringify(this._);
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
    // const total = slice.slice(0, 8).readIntBE(2, 6);
    // const index = slice.slice(8, 16).readIntBE(2, 6);
    const sha1 = crypto.createHash('sha1').update(slice).digest('hex');
    const result = { sha1 };
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
    .then(() => this.loadLetters())
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
      findLetter
      letterAddFile
      letterDeleteFile
      deleteLetter
      sendLetter
  */
  initialLetter({ session, password }) {
    const lid = Utils.randomNumberString(6);
    const letter = new Letter({ lid });
    this.LETTERS.push(letter);
    return this.saveLetter({ letter })
    .then(() => this.outputLetter({ letter }));
  }
  outputLetter({ letter }) {
    const link = url.format({
      protocol: ':',
      slashes: true,
      host: this.config.api.url,
      pathname: `/letter/${letter.lid}/upload/`
    });
    return letter.toJSON({ link: `/letter/${letter.lid}/upload/` });
  }
  async getLetter({ lid }) {
    const letter = this.findLetter({ lid });
    return this.outputLetter({ letter });
  }
  async loadLetters() {
    const key = `LFS.LETTERS.`;
    const result = await this.find({ key });
    if(result.length > 0) {
      this.LETTERS = result.map((v) => {
        const json = JSON.parse(v.value);
        const letter = new Letter(json);
        return letter;
      });
    }
  }
  findLetter({ lid }) {
    return this.LETTERS.find((letter) => {
      return letter.lid == lid;
    })
  }
  async letterAddFile({ lid, fid }) {
    const letter = this.findLetter({ lid });
    if(letter != undefined) {
      letter.addFile({ fid });
      await this.saveLetter({ letter });
      return this.outputLetter({ letter });
    } else {
      throw new Error(`Letter Not Found: ${lid}`);
    }
  }
  async letterDeleteFile({ lid, fid }) {
    const letter = this.findLetter({ lid });
    if(letter != undefined) {
      letter.deleteFile({ fid });
      await this.saveLetter({ letter });
      return this.outputLetter({ letter });
    } else {
      throw new Error(`Letter Not Found: ${lid}`);
    }
  }
  saveLetter({ letter }) {
    const lid = letter.lid;
    const key = `LFS.LETTERS.${lid}`;
    const value = letter.toStaticString();
    return this.write({ key, value });
  }
  deleteLetter({ lid }) {
    this.LETTERS = this.LETTERS.filter((letter) => {
      return letter.lid != lid;
    });
    const key = `LFS.LETTERS.${lid}`;
    return this.delete({ key });
  }
  sendLetter({ lid, email, subject, content }) {
    const template = path.resolve(__dirname, '../../../templates/email_sendPaperPlane.html');
    return this.getBot("Mailer")
    .then((Mailer) => {
      return Mailer.sendWithTemplate({
        email: email,
        subject,
        template,
        data: {
          sender: 'someone',
          link: `https://${this.config.api.url}/?lid=${lid}`
        }
      });
    })
  }

  initialFileController() {
    const key = 'LFS.FILES.';
    this.JOBS = [];
    this.LETTERS = [];
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
      return Promise.reject(new Error('Invalid Job Format'));
    }
  }

  findJOB({ fid, rootHash }) {
    return this.JOBS.find((el) => {
      let result = true;
      if(fid !== undefined) {
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
    this.JOBS = this.JOBS.filter((el) => {
      return el.fid != job.fid;
    });
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
  newOperation({ job, save }) {
    const myJob = new Job(job);
    this.JOBS.push(myJob);
    if(save) {
      return this.saveJOB({ job: myJob })
      .then(() => {
        return Promise.resolve({ fid: job.fid });
      });
    }
    return Promise.resolve({ fid: job.fid });
  }

  updateOperation({ fid, totalSlice, sliceIndex, sliceHash }) {
    const job = this.findJOB({ fid });
    job.totalSlice = totalSlice;
    job.done({ sliceIndex, sliceHash });

    return job;
  }

  getMetadata({ lid, fid, rootHash }) {
    const job = this.findJOB({ fid, rootHash });
    let result = {};
    if(job) {
      const baseSlicePath = fid ?
        `/letter/${lid}/upload/${fid}/` :
        rootHash ? 
          `/file/${rootHash}/` :
          '';
      result = job.toJSON();
      result.slices = result.slices.map((v) => {
        return `${baseSlicePath}${v}`;
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
  async initialUpload({ lid, fileName, fileSize, contentType, totalSlice }) {
    try {
      const fid = `JOB${dvalue.randomID(13)}`;
      const folder = path.resolve(this.folder.file, fid);
      const checkEmpty = await Utils.exists({ target: folder });
      if(checkEmpty) {
        throw new Error(`Fid Exists: ${fid}`);
      } else {
        await Utils.initialFolder({ homeFolder: folder });
      }
      await this.letterAddFile( { lid, fid } );
      return this.newOperation({ job: { fid, folder, fileName, fileSize, contentType, totalSlice }, save: true })
    } catch(e) {
      console.trace(e)
//      return this.initialUpload({ lid, fileName, fileSize, contentType, totalSlice });
    }
  }
  async deleteFile({ fid }) {
    const folder = path.resolve(this.folder.file, fid);
    const deleteFolderRecursive = async (filePath) => {
      const exists = await Utils.fileExists({ filePath });
      if(exists) {
        fs.readdirSync(filePath).forEach((file, index) => {
          const curPath = filePath + "/" + file;
          if (fs.lstatSync(curPath).isDirectory()) {
            deleteFolderRecursive(curPath);
          } else {
            fs.unlinkSync(curPath);
          }
        });
        fs.rmdirSync(filePath);
      }
    };
    await deleteFolderRecursive(folder);
    return true;
  }
  async deleteUpload({ lid, fid }) {
    // delete folder
    await this.deleteFile({ fid });

    // delete db & memory
    const job = { fid };
    await this.deleteJOB({ job });

    // delete from letter
    await this.letterDeleteFile({ lid, fid });

    const letter = this.findLetter({ lid })

    return Promise.resolve(this.outputLetter({ letter }));
  }

  /*
    - parse slice
    - save slice file
    - update job status
  */
  uploadSlice({ fid, hash, files, totalSlice, sliceIndex }) {
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
                totalSlice,
                sliceIndex,
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