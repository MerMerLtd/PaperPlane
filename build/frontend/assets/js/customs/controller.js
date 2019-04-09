// =============================================================
// base
// XHR
const maxConnection = 5; 
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

const elements = {
    boxFile: document.querySelector(".box__file"),
    alertSuccess: document.querySelector(".alert"),
    addIcon: document.querySelector(".add__icon"),
    addText: document.querySelector(".add__text"),
    dropndDrop: document.querySelector(".box__dragndrop"),
    body: document.querySelector("body"),
    hint: document.querySelector(".card-header > .hint"),
    cardHeader: document.querySelector(".card-header"),
    dropZone: document.querySelector(".box__dropzone"),
    page: document.querySelector(".login-page"),
    pageHeader: document.querySelector(".page-header"),
    fileList: document.querySelector(".file-list"),
    progressBars: [],
    files: [],
}
const renderFile = file =>{
    // console.log(file);
    const markup = `
        <div class="file" data-fid="${file.fid}">
            <div class="delete-button"></div>
            <div class="file-icon"></div>
            <div class="progress">
                <div data-progressId="${file.fid}" class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100" style="width: 75%"></div>
            </div>
            <div class="file-name">${file.name}</div>
            <div class="file-size">${file.size}</div>
        </div>  

        <!-- <p class="file-name">螢幕快照 2019-03-19 上午9.04.16.png</p> -->
        <!-- <p class="file-name">螢幕快照 ...04.16.png</p> -->
    `;
    elements.fileList.insertAdjacentHTML("beforeend", markup);
}
const renderFiles = files => {
    files.forEach(file => renderFile(file));
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
    removeHintLocation();
    elements.addIcon.classList.add("add__icon--small");
    elements.addText.classList.add("add__text--small");
    elements.fileList.classList.add("u-margin-top--sm");// 位置一時半會還沒調好
    elements.alertSuccess.style.setProperty("--opacity", 1);
}
const handleOutFileList = () => {
    hintLocation();
    elements.addIcon.classList.remove("add__icon--small");
    elements.addText.classList.remove("add__text--small");
    elements.fileList.classList.remove("u-margin-top--sm");// 位置一時半會還沒調好
    elements.alertSuccess.style.setProperty("--opacity", 0);
}
// drag file in the pageHeader
const handleDragInPageHeader = evt => {
    if(!isCurrentIn){
        isCurrentIn = true;
        hintLocation();
    }
    if(evt.target.matches(".box__dropzone, .box__dropzone * " || state.fileObj.files.length)){
        handleInFileList();
    }else{
        handleOutFileList();
    }
}
const handleDragoutPageHeader = evt => {
    if(isCurrentIn){
        isCurrentIn = false;
        removeHintLocation();
    }
}

const showFileProgress = (fid, progress) => {
    // console.log(file.fid)
    let index = elements.progressBars.findIndex(el => el.dataset.progressid === fid);
    // console.log(index);
    elements.progressBars[index].style.width = `${progress}%`;
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


// let size = 0;
// let sliceSize = 0;
// let sliceCount = 0;
// let uploads = [];
// let shardList = [];

// const init = () => {
//     size = 0;
//     sliceSize = 0;
//     sliceCount = 0;
//     uploads = [];
//     shardList = [];

//     return true;
// }


const addMultiListener = (element, events, func) => {
    events.split(" ").forEach(event => element.addEventListener(event, func, false));
}
const removeMultiListener = (element, events, func) => {
    events.split(" ").forEach(event => element.removeEventListener(event, func, false));
}

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
    };
};

// https://gist.github.com/shiawuen/1534477

// 佇列 [{file: f, from: 'byte', to: 'byte'}, {...}, ...]
// 產生佇列 👉[{fid: fid, fragment: blob}, {...}, ...]

// 需改良 類似maxConnection的做法
const maxWorker = 5;
const sha1Queue = [];
let workers = 0;

const closeWorker = worker => {
    worker.terminate();
    workers--;

    if(sha1Queue.length > 0 && worker < maxWorker){
        let next = sha1Queue.pop();
        console.log(next);
        if(typeof next === "function"){
            next(); 
        }
    }
    return true;
}

const SHA1 = target => {
    if(workers >= maxWorker){
        sha1Queue.push(SHA1.bind(this, target));
        // console.log(sha1Queue)
    }else{
        return new Promise((resolve, reject) => {
            const worker = new Worker("../assets/js/plugins/rusha.min.js"); 
            // console.log(workers)
            worker.onmessage = evt => {
                // console.log(evt)
                closeWorker(worker);
                resolve(evt.data);
            }
            worker.onerror = evt => {
                // console.log(evt)
                closeWorker(worker);
                reject(evt.message);
            }
            worker.postMessage({id: target.fid, data: target.blob});   
            workers++;
        })
    }
}

// 獲得某file的第 index 個加上 shardInfo 且 hash 的碎片，以及它要去的地方 👉 path
const getHashShard = parseFile => {
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
    const blob = slice(file, start, end); // 取得file第i個blob
    const shard = new Uint8Array(shardInfo.length + sliceSize); // 組合 shardInfo & blob 👉 shard
    shard.set(shardInfo, 0);
    shard.set(blob, shardInfo.length);

    const target = {fid, blob};
    return new Promise((resolve, reject) => {
        SHA1(target)
        .then(
            res => {
                parseFile.sliceIndex += 1 ; //紀錄進度
                return resolve({
                    index,
                    path: `/file/${fid}/${res.hash}`,
                    blob: new Blob([res.hash]),
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

const startUpload = async () => {
    if(!uploadQueue || uploadQueue.length === 0) return;
    if(connection >= maxConnection) {  
        queue.push(startUpload.bind(this));
        return false; 
    }
    const target = uploadQueue.pop();
	const hashShard =  await getHashShard(target); // 
	const path = hashShard.path;
	

}

//(path, n, callback)
const upload = (file, i, retry) => {
    let target = {
        path: `/file/${file.fid}/${file.sha1}`, // ?? didn't get sha1 yet;
        index: i,
        retry,
    }
    addUploadQueue(target);
    startUpload();

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
            // 成功：[{fid: "QaIkjVmW"},...]
            // return await makeRequest(opts)

            // 不要只是回傳 fid 回傳整個 file with id
            const res = await makeRequest(opts);
            file.fid = res.fid;
            return file;
            // console.log({...file, fid: res.fid}) 
            //！！！！object.create 的 object 不能直接用 ...operation
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
        const currentFileEl = resultArray.map(file => document.querySelector(`[data-fid='${file.fid}']`));
        const currentProgressBarEl = resultArray.map(file => document.querySelector(`[data-progressId='${file.fid}']`));
        // 加到 total els 裡面
        elements.files = elements.files.concat(currentFileEl); 
        elements.progressBars = elements.progressBars.concat(currentProgressBarEl); 

        // console.log(elements.files, elements.progressBars);
        // currentFileEl.forEach(el => el.addEventListener("click", (evt) => upload(evt), false));

        if (resultArray.length){

            // add ParsedFiles into the uploadQueue
            // resultArray.forEach(file => addUploadQueue(getMeta(file)));
            const parseFiles = resultArray.map(file => getMeta(file)); //test

            console.log("expect : 0", parseFiles[0].sliceIndex) // test
            const hashShard =  await getHashShard(parseFiles[0]); //test
            console.log("expect : 1", parseFiles[0].sliceIndex) // test
            console.log(hashShard); //test
        }
        
        // 7. 上傳失敗 3s 後 重新傳送
    });  
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

elements.boxFile.addEventListener("change",  evt => handleFilesSelected(evt))

if(isAdvancedUpload){
    elements.dropZone.classList.add("has-advanced-upload");
    addMultiListener(elements.pageHeader, "drag dragstart dragend dragover dragenter dragleave drop", evt => handleDefault(evt));
    addMultiListener(elements.pageHeader, "dragover dragenter", evt => handleDragInPageHeader(evt));
    addMultiListener(elements.pageHeader, "dragleave dragend drop",  evt => handleDragoutPageHeader(evt));
    addMultiListener(elements.pageHeader, "drop",  evt => handleFilesSelected(evt));
}

