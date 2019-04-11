
// https://blog.grossman.io/how-to-write-async-await-without-try-catch-blocks-in-javascript/
const to = promise => {
    return promise.then(data => {
       return [null, data];
    })
    .catch(err => [err]);
 }

 // polyfill for Element.closest from MDN
if (!Element.prototype.matches)
Element.prototype.matches = Element.prototype.msMatchesSelector ||
                            Element.prototype.webkitMatchesSelector;

if (!Element.prototype.closest)
Element.prototype.closest = function(s) {
    var el = this;
    if (!document.documentElement.contains(el)) return null;
    do {
        if (el.matches(s)) return el;
        el = el.parentElement;
    } while (el !== null);
    return null;
};

// =============================================================
// base
// XHR
const maxConnection = Infinity; 
const maxRetry = 3;
let connection = 0;
let queue = [];


const closeConnection = ()  => {
    connection--;

    if(queue.length > 0 && connection < maxConnection){
        let next = queue.pop();
        if(typeof next === "function"){
            next();
        }
    }

    return true;
}

const makeRequest = opts => {
    // 工作排程 && 重傳
    if(connection >= maxConnection){
        queue.push(opts); // ??
    }else{
        connection++;
        const xhr = new XMLHttpRequest();
        return new Promise((resolve, reject) => {
            xhr.onreadystatechange = () => {
                // only run if the request is complete
                if(xhr.readyState !== 4) return;
                if(xhr.status >=200 && xhr.status < 300){
                    // If successful
                    closeConnection();
                    resolve(JSON.parse(xhr.responseText));
                }else{
                    // If false                    
                    closeConnection();
                    reject({
                        error: JSON.parse(xhr.response).error.message,
                    });
                }
            }
            // Setup HTTP request
            xhr.open(opts.method || "GET", opts.url, true);
            if(opts.header){
                Object.keys(opts.headers).forEach(key => xhr.setRequestHeader(key, opts.headers[key]));
            }
            // Send the request
            xhr.send(opts.payload);
        });
    }
}

// =============================================================
// Views
let isCurrentIn = false;

const formatFileSize = size => {
    let formatted, power;

    if(typeof size !== "number") return false;
    const unit = ["byte", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

    const check = (size, power = 0) => {
        if(Math.ceil(size).toString().length > 3){
            return check(size /= 1024, ++power);
        }
        return [Number.isInteger(size) ? size : size.toFixed(2), power || 1];
    }

    [formatted, power] = check(size);
    return `${formatted}${unit[power]}`
}

const elements = {
    boxFile: document.querySelector(".box__file"),
    alertSuccess: document.querySelector(".alert"),
    addIcon: document.querySelector(".add__icon"),
    addText: document.querySelector(".add__text"),
    placeholder: document.querySelector(".placeholder"),
    dropndDrop: document.querySelector(".box__dragndrop"),
    dropZone: document.querySelector(".box__dropzone"),
    body: document.querySelector("body"),
    hint: document.querySelector(".card-header > .hint"),
    cardHeader: document.querySelector(".card-header"),
    dropZone: document.querySelector(".box__dropzone"),
    page: document.querySelector(".login-page"),
    pageHeader: document.querySelector(".page-header"),
    fileList: document.querySelector(".file-list"),
    btnSend: document.querySelector(".btn-send"),
    btnDownload: document.querySelector(".btn-download"),
    dropCard: document.querySelector(".dropOrdownload .card"),
    display: document.querySelector(".display"),
}

// // 放進 file-container 的 提示
// const hintReward = () => {
//     const markup = `
//         <div class="alert alert-success" role="alert">
//             Well done!
//         </div>
//     `;
//     elements.page.insertAdjacentHTML("afterbegin", markup);
// }

// 放進 “哪裡” 的 提示
const hintLocation = () => {
    elements.cardHeader.classList.add("hint");
    elements.dropZone.classList.add("invisible");
    //elements.fileList.classList.add("invisible");
}
const removeHintLocation = () => {
    elements.cardHeader.classList.remove("hint");
    elements.dropZone.classList.remove("invisible");
    // elements.fileList.classList.remove("invisible");
}
// drag file over the fileList 之後
const handleInFileList = () => {
    
    elements.placeholder.classList.add("u-margin-top--sm");
    elements.addIcon.classList.add("add__icon--small");
    elements.addText.classList.add("add__text--small");
    elements.alertSuccess.style.setProperty("--opacity", 1); // 待修改
    elements.dropZone.classList.add("pointer");
    // fileList.addEventListener 可以考慮加在這裡， 然後在下面可以remove
    // dropZone pointer Event: none
}
const handleOutFileList = () => {
    
    elements.placeholder.classList.remove("u-margin-top--sm");
    elements.addIcon.classList.remove("add__icon--small");
    elements.addText.classList.remove("add__text--small");
    elements.alertSuccess.style.setProperty("--opacity", 0);
    elements.dropZone.classList.remove("pointer");
}
// drag file in the pageHeader
const handleDragInPageHeader = evt => {
    if(!isCurrentIn){
        isCurrentIn = true;
        hintLocation();
    }
    if(evt.target.matches(".box__dropzone, .box__dropzone * " || state.fileObj.files.length)){
        removeHintLocation();
        handleInFileList();
    }else{
        hintLocation();
        handleOutFileList();
    }
}
const handleDragoutPageHeader = evt => {
    if(isCurrentIn){
        isCurrentIn = false;
        removeHintLocation();
    }
}

const showFileProgress = file => {
    const progress = (file.sliceIndex/file.sliceCount).toFixed(2)*100;
    document.querySelector(`[data-progressid='${file.fid}']`).style.width = `${progress}%`;
    // ??之後我想要改這裡的樣式
}

// =============================================================
// Models

const File = {
    files: [],
}
// =============================================================
// Controller
const state = {};

const minSliceCount = 25;
const minSize = 512;
const defaultSize = 4 * 1024 * 1024 // 4MB;

const handleDefault = evt => {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
}

// Formalize file.slice 切割檔案
const noop = () => {}

const slice = (file, start, end) => {
    let slice = file.mozSlice ? file.mozSlice :
                file.webkitSlice ? file.webkitSlice :
                file.slice ? file.slice : noop;

    return slice.bind(file)(start, end);
}

const genUi8A = num => {
    let s = (num).toString(16) // 轉成16進位
    s = s.length % 2 === 1 ? "0".concat(s) : s; // 變成偶數長度

    const genArray = (s, i = 0, a = []) => {
        if(i < s.length){
            a.push(parseInt(s.slice(i, i+2), 16));
            i += 2;
            return genArray(s, i, a);
        }else{
            return a;
        }
    }
    // return genArray(s);

    const arr = genArray(s);

    if(arr.length <= 8){
        let ui8a = new Uint8Array(8);
        ui8a.set(arr, 8 - arr.length); //  ui8a.set(new Uint8Array(arr), 8 - arr.length)
        return ui8a; 
    }else{
        return false;
    }
}

const genMergeUi8A = (ui8a1, ui8a2) => {
    const mergeUi8A = new Uint8Array(ui8a1.length + ui8a2.length) // 16
    mergeUi8A.set(ui8a1, 0);
    mergeUi8A.set(ui8a2, mergeUi8A.length - ui8a2.length);
    return mergeUi8A;
}

const genShardInfo = (sliceCount, sliceIndex) => {
    return genMergeUi8A(genUi8A(sliceCount), genUi8A(sliceIndex));
}

// const info = genShardInfo(parseInt("ffffffff", 16), 234);

const getMeta = file => {
    let fid = file.fid;
    let name = file.name;
    let type = file.type;
    let size = file.size;
    let sliceCount, sliceSize;

    if(size > defaultSize * minSliceCount){
        sliceCount = Math.ceil(size/defaultSize);
        sliceSize = defaultSize;
    }else if (size > minSize * minSliceCount){
        sliceCount = minSliceCount;
        sliceSize = Math.ceil(size/sliceCount);
    }else{
        sliceCount = 1;
        sliceSize = size;
    }

    return {
        file,
        fid,
        name,
        type,
        size,
        sliceCount,
        sliceSize,
        sliceIndex: 0,
        retryCount: 0,
        isPaused: false,
    };
};

// https://gist.github.com/shiawuen/1534477

// 佇列 [{file: f, from: 'byte', to: 'byte'}, {...}, ...]
// 產生佇列 👉[{fid: fid, fragment: blob}, {...}, ...]

// 需改良 類似maxConnection的做法

const releaseSlave = slave => {
    slave.type === "Worker" ? slave.theSlave.terminate() : slave.theSlave.abort();
    slave.slaves--;

    if(slave.workload.length > 0 && slave.slaves < slave.maxSlave){
        let next = slave.workload.pop();

        if(typeof next === "function"){
            next(); 
        }
    }
    return true;
}

const maxWorker = Infinity;
const sha1Queue = [];
let workers = 0;

const SHA1 = target => {
    
    if(workers >= maxWorker){
        sha1Queue.push(SHA1.bind(this, target)); // 其實沒有用到多個worker 因為 await 每個hashshard？
    }else{
        const worker = new Worker("../assets/js/plugins/rusha.min.js"); 
        workers++;
        return new Promise((resolve, reject) => {
            worker.onmessage = evt => {
                releaseSlave({
                    type: "Worker", 
                    theSlave: worker, 
                    slaves: workers, 
                    maxSlave: maxWorker, 
                    workload: sha1Queue
                });
                resolve(evt.data);
            }
            worker.onerror = evt => {
                // console.log(evt)
                releaseSlave({
                    type: "Worker", 
                    theSlave: worker, 
                    slaves: workers, 
                    maxSlave: maxWorker, 
                    workload: sha1Queue
                });
                reject(evt.message);
            }
            worker.postMessage({id: target.fid, data: target.blob});   
        })
    }
}

const maxFileReader = Infinity;
const blobQueue = [];
let fileReaders = 0;

const readBlob = blob => {
    if(fileReaders >= maxFileReader){
        blobQueue.push(readBlob.bind(this, blob)); 
    }else{
        const fileReader = new FileReader();
        fileReaders++;
        return new Promise((resolve, reject) => {
            fileReader.onload = evt =>  {
                releaseSlave({
                    type: "FileReader", 
                    theSlave: fileReader, 
                    slaves: fileReaders, 
                    maxSlave: maxFileReader, 
                    workload: blobQueue,
                });
                resolve(evt.target.result);
            };
            fileReader.onerror = err => {
                releaseSlave({
                    type: "FileReader", 
                    theSlave: fileReader, 
                    slaves: fileReaders, 
                    maxSlave: maxFileReader, 
                    workload: blobQueue,
                });
                reject({err});
            }
            fileReader.readAsArrayBuffer(blob);
        });
    }
}

// 獲得某file的第 index 個加上 shardInfo 且 hash 的碎片，以及它要去的地方 👉 path
const getHashShard = async parseFile => {
    const file = parseFile.file;
    const fid = parseFile.fid;
    const index = parseFile.sliceIndex;
    const count = parseFile.sliceCount;
    const size = parseFile.size;
    const sliceSize = parseFile.sliceSize;
    const start = index * sliceSize;

    let end;
    if((index + 1) * sliceSize > size){
        end = size;
    }else{
        end = (index + 1) * sliceSize;
    }

    const shardInfo = genShardInfo(count, index);  // get shardInfo
    let blob = slice(file, start, end); // 取得file第i個blob
    const blobBuffer = await readBlob(blob);
    blob = new Uint8Array(blobBuffer);
    const shard = genMergeUi8A(shardInfo, blob);
    const target = {fid, blob: new Blob([shard])};

    return new Promise((resolve, reject) => {
        SHA1(target)
        .then(
            res => {
                console.log(shardInfo, fid);
                parseFile.sliceIndex += 1 ; //紀錄進度
                return resolve({
                    path: `/file/${fid}/${res.hash}`,
                    blob: new Blob([shard]),
                })
            }
        )
        .catch(
            err => reject({err})
        )
    });
}

const uploadQueue = [];

const addUploadQueue = target => {
    uploadQueue.push(target);
    return uploadQueue;
}

const popUploadQueue = target => {
    const index = uploadQueue.findIndex(file => file.fid === target.fid);
    uploadQueue.splice(index, 1);
    return uploadQueue;
}

const uploadShard = async target => {
    console.log("uploadShard/ isPaused",target.fid ,target.isPaused)
    if(target.isPaused || target.sliceIndex === target.sliceCount ) return;

    let err, data, hashShard;

    // 1. to slice a blob add info then hash it;
    [err, hashShard] = await to(getHashShard(target)); // target.sliceIndex will plus 1 
    //hashShard = {path: String, blob: Blob}

    if(!hashShard){
        throw err;  // ?? 寫個方法呈現 err 到畫面上
    }

    // 2. send it to backend
    const formData = new FormData();
    formData.append("file", hashShard.blob);
    [err, data] = await to(makeRequest({
        method: "POST",
        // url: "/test/upload",
        url: hashShard.path,
        payload: formData,
    }));
   

    if(err){
        target.retry = target.retry ? (target.retry + 1) : 1
        if(target.retry <= maxRetry) { 
            uploadShard(target);
            return false;
        }
        else { 
            throw new Error(`can not upload shard: ${({
                file: target.file,
                index: target.sliceIndex,
            })}`);
        }
    }else{
        target.sliceIndex < target.sliceCount ? uploadShard(target) : null; // ?? popUploadQueue(target); 需要嗎？
        showFileProgress(target);
    }
}

const uploadFiles = () => {
    if(!uploadQueue || uploadQueue.length === 0) return;

    uploadQueue.forEach(target =>{
        if(connection >= maxConnection) {  
            queue.push(uploadShard.bind(this, target));
            return false; 
        }
        uploadShard(target)
    });
}

// UI Control
const uploadFileControl = evt => {
    const element = evt.target.closest(".file");
    const fid = element.dataset.fid; // UI onClickedFid
    const index = uploadQueue.findIndex(file => file.fid === fid); 
    const file = uploadQueue[index];

    if(evt.target.matches(".delete-button, .delete-button *")){
        element.parentElement.removeChild(element);
        uploadQueue.splice(index, 1);
        if(!elements.fileList.childElementCount) handleOutFileList();

    }else if(evt.target.closest(".file")){
        if(file.sliceIndex === file.sliceCount) return;
        file.isPaused = !file.isPaused; 
        console.log("uploadFileControl/ isPaused: ", file.fid, file.isPaused);
        if(!file.isPaused){
            uploadShard(file);
        }
    }
}


const handleFilesSelected = evt => {
    // （view: 提示訊息們）
    handleInFileList();
    elements.alertSuccess.style.setProperty("--opacity", 0);

    // 1. 解析檔案
    // create file object
    if(!state.fileObj) state.fileObj = Object.create(File);
    // files is a FileList of File objects change it to Array.
    let files = Array.from(evt.target.files || evt.dataTransfer.files);

    // 2. 提供 (fileName && contenType && fileSize ) => fid
    Promise.all(files.map(async file => {
        const opts = {
            method: "POST",
            url: "/file",
            payload: {
                fileName: file.name,
                fileSize: file.send,
                contenType: file.type,
            },
        }
        // return each result make of new Array
        try {
            const res = await makeRequest(opts);
            file.fid = res.fid; //！！！！object.create 的 object 不能直接用 ...operation
            return file;
            
        }
        catch (error) {
            // 失敗： 錯誤訊息 及 file obj
            return Promise.resolve({ errorMessage: "API BAD GATEWAY", error, file });
        } 
    }))
    .then(async resultArray => {// resultArray is array of files with fid provided by backend

        // 3. 把資料存到 state 裡 =>state.fileObj.files
        state.fileObj.files = state.fileObj.files.concat(files); // FileList object.
        // 4. render 畫面
        renderFiles(resultArray);
        // 選目前的 files && progress bars
        // const currentFileEl = resultArray.map(file => document.querySelector(`[data-fid='${file.fid}']`));
        const currentProgressBarEl = resultArray.map(file => document.querySelector(`[data-progressId='${file.fid}']`));
        // 加到 total els 裡面
        // elements.files = elements.files.concat(currentFileEl); 
        // elements.progressBars = elements.progressBars.concat(currentProgressBarEl); 

        // console.log(elements.files, elements.progressBars);
        // currentFileEl.forEach(el => el.addEventListener("click", (evt) => upload(evt), false));

        if (resultArray.length){
            // add ParsedFiles into the uploadQueue
            resultArray.forEach(file => addUploadQueue(getMeta(file)));
            uploadFiles();
          
        }
        
        // 7. 上傳失敗 3s 後 重新傳送
    });  
}

const send = evt => {
    const type = document.querySelector("#tab1 .active").innerText || "EMAIL";
    renderSendingPage(type);
    console.log(uploadQueue);
}

const downloadFiles = evt => {
    // ??
}

// Check for the various File API support.
if (window.File && window.FileReader && window.FileList && window.Blob) {
    // Great success! All the File APIs are supported.
} else {
    alert('The File APIs are not fully supported in this browser.');
}

// 判斷瀏覽器是否支持拖拉上傳
let isAdvancedUpload = function() {
    let div = document.createElement('div');
    return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div));
}();


const addMultiListener = (element, events, func) => {
    events.split(" ").forEach(event => element.addEventListener(event, func, false));
}
const removeMultiListener = (element, events, func) => {
    events.split(" ").forEach(event => element.removeEventListener(event, func, false));
}

elements.boxFile.addEventListener("change",  evt => handleFilesSelected(evt));  
elements.fileList.addEventListener("click", evt => uploadFileControl(evt));
elements.btnDownload.addEventListener("click", evt => downloadFiles(evt));
elements.btnSend.addEventListener("click", evt => send(evt));

if(isAdvancedUpload){
    elements.cardHeader.classList.add("has-advanced-upload");
    addMultiListener(elements.pageHeader, "drag dragstart dragend dragover dragenter dragleave drop", evt => handleDefault(evt));
    addMultiListener(elements.pageHeader, "dragover dragenter", evt => handleDragInPageHeader(evt));
    addMultiListener(elements.pageHeader, "dragleave dragend drop",  evt => handleDragoutPageHeader(evt));
    addMultiListener(elements.pageHeader, "drop",  evt => handleFilesSelected(evt));
}


