// =============================================================
// Models
const File = {
    files: [],
}
// =============================================================
// Controller

const state = {};

const minSliceCount = 4;
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
        if (i < s.length) {
            a.push(parseInt(s.slice(i, i + 2), 16));
            i += 2;
            return genArray(s, i, a);
        } else {
            return a;
        }
    }
    // return genArray(s);

    const arr = genArray(s);

    if (arr.length <= 8) {
        let ui8a = new Uint8Array(8);
        ui8a.set(arr, 8 - arr.length); //  ui8a.set(new Uint8Array(arr), 8 - arr.length)
        return ui8a;
    } else {
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
    // console.log(file)
    let fid = file.fid;
    let fileName = file.name;
    let contentType = file.type;
    let fileSize = file.size;
    let sliceCount, sliceSize;

    if (fileSize > defaultSize * minSliceCount) {
        sliceCount = Math.ceil(fileSize / defaultSize);
        sliceSize = defaultSize;
    } else if (fileSize > minSize * minSliceCount) {
        sliceCount = minSliceCount;
        sliceSize = Math.ceil(fileSize / sliceCount);
    } else {
        sliceCount = 1;
        sliceSize = fileSize;
    }

    return {
        file,
        fid,
        fileName,
        contentType,
        fileSize,
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

    if (slave.workload.length > 0 && slave.slaves < slave.maxSlave) {
        let next = slave.workload.pop();

        if (typeof next === "function") {
            next();
        }
    }
    return true;
}

const maxWorker = Infinity;
const sha1Queue = [];
let workers = 0;

const SHA1 = target => {

    if (workers >= maxWorker) {
        sha1Queue.push(SHA1.bind(this, target)); // 其實沒有用到多個worker 因為 await 每個hashshard？
    } else {
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
            worker.postMessage({
                id: target.fid,
                data: target.blob
            });
        })
    }
}

const maxFileReader = Infinity;
const blobQueue = [];
let fileReaders = 0;

const readBlob = blob => {
    if (fileReaders >= maxFileReader) {
        blobQueue.push(readBlob.bind(this, blob));
    } else {
        const fileReader = new FileReader();
        fileReaders++;
        return new Promise((resolve, reject) => {
            fileReader.onload = evt => {
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
                reject({
                    err
                });
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
    if ((index + 1) * sliceSize > size) {
        end = size;
    } else {
        end = (index + 1) * sliceSize;
    }

    const shardInfo = genShardInfo(count, index); // get shardInfo
    let blob = slice(file, start, end); // 取得file第i個blob
    const blobBuffer = await readBlob(blob);
    modifiedBlob = new Uint8Array(blobBuffer);
    const shard = genMergeUi8A(shardInfo, modifiedBlob);
    const target = {
        fid,
        blob,
        // blob: new Blob([shard])
    };
    // console.log(blob, target.blob);
    return new Promise((resolve, reject) => {
        SHA1(target)
            .then(
                res => {
                    // console.log(shardInfo, fid);
                    parseFile.sliceIndex += 1; //紀錄進度
                    return resolve({
                        path: `/letter/${letter}/upload/${fid}/${res.hash}?totalSlice=${count}&sliceIndex=${index}`,
                        blob, // blob: new Blob([shard]),
                    })
                }
            )
            .catch(
                err => reject({
                    err
                })
            )
    });
}

const uploadQueue = [];
let isDone = false;
let isSend = false; // 用來判斷現在是顯示 dropZone Or Sending View


const deleteUploadFile = fid => ({
    method: "DELETE",
    url: `/letter/${letter}/upload/${fid}`
});

const emptyUploadQueue = deleteFile => {
    if (uploadQueue.length) {
        !deleteFile 
        ? uploadQueue.pop()
        : deleteUploadFile(uploadQueue.pop().fid);
        return emptyUploadQueue(deleteFile);
    }
    return uploadQueue;
}

const uploadShard = async target => {
    // console.log("uploadShard/ isPaused", target.fid, target.isPaused)
    if (target.isPaused || target.sliceIndex === target.sliceCount) return;

    let err, data, hashShard;

    // 1. to slice a blob add info then hash it;
    [err, hashShard] = await to(getHashShard(target)); // target.sliceIndex will plus 1 
    //hashShard = {path: String, blob: Blob}

    if (!hashShard) {
        throw err; // ?? 寫個方法呈現 err 到畫面上
    }

    // 2. send it to backend
    const formData = new FormData();
    formData.append("file", hashShard.blob);
    [err, data] = await to(makeRequest({
        method: "POST",
        url: hashShard.path,
        payload: formData,
    }));


    if (err) {
        target.retry = target.retry ? (target.retry + 1) : 1
        if (target.retry <= maxRetry) {
            uploadShard(target);
            return false;
        } else {
            throw new Error(`can not upload shard: ${({
                file: target.file,
                index: target.sliceIndex,
            })}`);
        }
    } else {
        // console.log(data);
        target.progress = data.progress
        if(data.progress < 1 ) uploadShard(target);
        // target.sliceIndex < target.sliceCount ? uploadShard(target) : null; // ?? popUploadQueue(target); 需要嗎？
        // console.log("call renderProgress")
        renderProgress(target, "upload");
        updateTotalProgress();
    }
}

const uploadFiles = () => {
    if (!uploadQueue || uploadQueue.length === 0) return;

    uploadQueue.forEach(target => {
        if (connection >= maxConnection) {
            queue.push(uploadShard.bind(this, target));
            return false;
        }
        uploadShard(target);
    });
}

const handleFilesSelected = evt => {
    // （view: 提示訊息們）
    handleInFileList();
    // elements.alertSuccess.style.setProperty("--opacity", 0);

    // 1. 解析檔案
    // create file object
    if (!state.fileObj) state.fileObj = Object.create(File);
    // files is a FileList of File objects change it to Array.
    let files = Array.from(evt.target.files || evt.dataTransfer.files);

    // 2. 提供 (fileName && contentType && fileSize ) => fid
    Promise.all(files.map(async file => {
            // console.log(file)
            const f = getMeta(file);
            const opts = {
                contentType: 'application/json',
                method: "POST",
                url: `/letter/${letter}/upload`,
                payload: {
                    fileName: f.fileName,
                    fileSize: f.fileSize,
                    totalSlice: f.sliceCount,
                    contentType: f.contentType,
                },
            }
            // console.log(file);
            // return each result make of new Array
            try {
                const res = await makeRequest(opts);
                f.fid = res.fid; //！！！！object.create 的 object 不能直接用 ...operation
                return f;

            } catch (error) {
                // 失敗： 錯誤訊息 及 file obj
                return Promise.resolve({
                    errorMessage: "API BAD GATEWAY",
                    error,
                    f
                });
            }
        }))
        .then(async resultArray => { // resultArray is array of files with fid provided by backend

            // 3. 把資料存到 state 裡 =>state.fileObj.files
            state.fileObj.files = state.fileObj.files.concat(files); // FileList object.
            // 4. render 畫面
            resultArray.forEach(file => renderFile(elements.fileList, file));

            if (resultArray.length) {
                // add ParsedFiles into the uploadQueue
                resultArray.forEach(file => uploadQueue.push({...file}));
                uploadFiles();
            }

            // 7. 上傳失敗 3s 後 重新傳送
        });
}

// ======================================
// ============= download ===============
let isFetching = false;

const downloadQueue = [];
const downloadFiles = [];

const fetchFilePath = async letter => {
    let err, data;
    [err, data] = await to(makeRequest({
        method: "GET",
        url: `/letter/${letter}/`, // 絕對正確的 url: `/letter/${letter}/`
    }));

    if (err) {
        //1.1.3 if letter is invalid, 要重新顯示input 👈 不是寫在這裡
        console.log(err, letter);
        // renderInputCard();
        return false;
    }
    if (data) {
        // console.log(data) 
        // {lid: "859070", files: Array(1)}
        // files: ["/letter/859070/upload/JOB0R2BJ3ggcRpRG"]
        // lid: "859070"
        return data.files;
    }
}

// let i = 1;// ?? test
let delay = 10000;

const fetchFile = async (filePath) => {
    const opts = {
        method: "GET",
        url: `${filePath}`,
    };
    let err, data;
    [err, data] = await to(makeRequest(opts));
    if (err) throw {
        err,
        filePath
    }; //http://www.javascriptkit.com/javatutors/trycatch2.shtml 還沒細看
    if (data) {
        // console.log(data);
        // console.log("fetchFile called: "+ i++ + " time", "data.progress: ",data.progress);
        let fileIndex = downloadQueue.findIndex(file => file.fid === data.fid); 
        if (fileIndex === -1) {
            downloadQueue.push({
                ...data,
                isPaused: true,
                isSelected: true,
                pointer: 0,
                // waiting: [],
                // isCompleted: false
            });
            fileIndex = downloadQueue.length - 1;
        }
        // console.log(downloadQueue[fileIndex].waiting)

        if(downloadQueue[fileIndex].pointer === -1) return data;

        const pointer = downloadQueue[fileIndex].pointer;
        // if(pointer < downloadQueue[fileIndex].waiting.length) pointer = downloadQueue[fileIndex].waiting.length;
        // console.log(pointer);

        const list = data.slices.slice(pointer);
        // console.log(pointer, list)
        const newPointer = list.findIndex((shardPath, i) => {
        // if (downloadFiles[downloadFiles.findIndex(file => file.fid === data.fid)].progress === 1 || shardPath.includes("false")) return true;
            if (shardPath.includes("false")) return true;
            downloadQueue[fileIndex].waiting.push({
                path: shardPath,
                index: pointer + i,
                fid: data.fid
            })
            // console.log(pointer, pointer + i, "0~644");
        });
        // console.log(downloadQueue)
        
        // if (newPointer === -1) downloadQueue[fileIndex].isCompleted === true;
        // console.log(downloadQueue[fileIndex].waiting)

        downloadQueue[fileIndex].pointer = pointer +  newPointer
        // console.log(`data.slices[${newPointer}]為下一次起點`);

        if (data.progress === 1 || newPointer === -1){
            return data;
        }

        setTimeout(() => {
            fetchFile(filePath);
        }, delay); //setTimeout(fetchFile, delay, filePath, newPointer);
        console.log("fetchFile", data)
        return data;
        // console.log(data) {
        // contentType: "video/quicktime"
        // fid: "JOBSZn7dzir21Iys"
        // fileName: "test_lg.mov"
        // fileSize: 2704039688
        // progress: 0.262015503875969
        // slices: (645) ["/letter/628379/upload/JOBSZn7dzir21Iys/b00557b19172b883ca2a85470d88744543a011d3", "/letter/628379/upload/JOBSZn7dzir21Iys/04f6ee6e6bab53d775f804093bfd264a72781d0c", ...]
        // totalSlice: 645
        // waiting: []
        // }
    }
}

const assembleShard = (target, shard, index) => {
    let fileIndex = downloadFiles.findIndex(file => file.fid === target.fid);
    // let waitingLength = target.waiting;
    if(fileIndex === -1){
        // delete target.waiting;
        downloadFiles.push({...target,
            slices: [],
            progress: 0,
            downloaded: false,
        });
        fileIndex = downloadFiles.length - 1;
    }
    downloadFiles[fileIndex].slices[index] = shard;
    // console.log(downloadFiles[fileIndex].slices.filter((v) => !!v).length )
    downloadFiles[fileIndex].progress = downloadFiles[fileIndex].slices.filter((v) => !!v).length/ target.totalSlice;
    return downloadFiles[fileIndex];
}

const downloadShard = async target => {
    console.trace(target);
    if (target.isPaused || !target.waiting.length) return;
    const shardInfo = target.waiting.pop();

    let err, data;
    [err, data] = await to(makeRequest({
        method: "GET",
        url: shardInfo.path,
        responseType: "arraybuffer",
    }));
    // console.log(err, data, "in downloadShard");
    if (err) {
        target.retry = target.retry ? (target.retry + 1) : 1;
        if (target.retry <= maxRetry) {
            target.waiting.reverse().push(shardInfo);
            target.waiting.reverse()
            downloadShard(target);
            return false;
        } else {
            throw new Error(`can not download shard: ${ ({
                file: target.fileName,
                fid: shardInfo.fid,
                index: shardInfo.index,
            })}`);
        }
    }
    if (data) {
        // 組裝
        const file = assembleShard(target, data, shardInfo.index);
        // render progress
        // console.log("call renderProgress")
        if(file.progress === 1 && !file.download){
            // 合併檔案並賦予檔案型別
            const blob = new Blob(file.slices, {type: file.contentType});
            // 建立檔案物件
            const url = window.URL.createObjectURL(blob);
            // 建立下載 a Tag 以觸發下載事件
            const a = document.createElement("a");
            document.body.appendChild(a);
            //a.style = "display: none";
            a.href = url;
            a.download = file.fileName;
            // 觸發下載
            a.click();
             // 移除物件與 a Tag ??
            window.URL.revokeObjectURL(url);
             // 標注檔案已下載
            file.downloaded = true;

            return;
        }
        renderProgress(file, "download");
        // 繼續下載下一個碎片
        // console.log(target)
        if(!!target.waiting.length) downloadShard(target);
    }
}

const downloadAll = () => {
    console.log(downloadQueue);
    if (!downloadQueue.length) return;
    downloadQueue.forEach(file => {
        if(file.isPaused) file.isPaused = false;
        if (connection >= maxConnection) {
            queue.push(downloadShard.bind(this, file));
            return false;
        }
        console.log(file, "download all Files")
        downloadShard(file);
    });
}

const renderDownloadZone = async letter => {

    renderDownloadView();
    // 2.2 render loader 
    renderLoader(elements.emptyFileHint);

    // 2.3 fetch data 👉 use elements.inputKey.value 跟backend要資料
    const filePaths = await fetchFilePath(letter);

    // 2.3.1 如果沒有要到，重新輸入inputKey
    if (!filePaths) {
        // ?? render custom alert downloadKey || inputKey is invalid
        removeLoader(elements.emptyFileHint);
        window.location.hash = ""; //// window.location = window.location.origin;
        renderDownloadInput();
        return false;
    };
    // 2.3.2 如果有要到filePaths，cleanLoader 
    // console.log(filePaths); //["/letter/505404/upload/JOB75mvKpyhcTerX", ...]
    setTimeout(removeLoader, 500, elements.emptyFileHint);
    // 3. change url
    window.location.hash = letter;
    elements.downloadList.innerText = "";

    // 4 filePaths.length = 0 沒有路徑
    if (!filePaths.length) return false;

    // 4. fetch files
    hiddenElement(elements.emptyFileHint, 0);
    Promise.all(filePaths.map(async filePath => fetchFile(filePath)))
        .then(files => {
            // console.log("renderDownloadZone",files);
            // console.log(downloadQueue);
            elements.filesInfo.innerHTML = `Total ${files.length} files &middot; ${formatFileSize(progressCalculator(files).totalSize)}`
            // 5. renderFiles
            files.forEach(file => renderFile(elements.downloadList, file));
        })
}

// disable btnReceive if 
// 6. 開始下載


const checkValidity = inputKey => {
    // 1. if elements.inputKey.value is numbers || 1.2.1 if elements.inputKey.value is string (can be link)
    elements.inputKey.value = "";

    const regExp = new RegExp(/^\d+$/);

    if (!regExp.test(inputKey)) {
        // 如果不是數字
        // case1: 作為網址打開 www.drophere.io/#123456
        // case2: 直接返回
        // return false;
    };
    if (!regExp.test(inputKey) || inputKey.length !== 6) {
        elements.inputCard.classList.add("shake");
        setTimeout(() => elements.inputCard.classList.remove("shake"), 1000);
        return false;
    };

    renderDownloadZone(inputKey);
    return inputKey;
}

const checkUrl = () => {
    if (checkValidity(window.location.hash.substr(1)))
        renderTabView2();
    return false;
}

checkUrl();

elements.boxFile.addEventListener("change", evt => handleFilesSelected(evt), false);
elements.btnRefresh.addEventListener("click", checkUrl, false);
elements.btnDownload.addEventListener("click", () => checkValidity(elements.inputKey.value), false);
elements.btnReceive.addEventListener("click", downloadAll, false);

// const inputHint
// window.onbeforeunload = evt => {
//     return "false";
// } //https://stackoverflow.com/questions/3527041/prevent-any-form-of-page-refresh-using-jquery-javascript

// https://stackoverflow.com/questions/6390341/how-to-detect-url-change-in-javascript
// Add a hash change event listener!
// window.addEventListener('hashchange', function(e){console.log('hash changed')});
// Or, to listen to all URL changes:
// window.addEventListener('popstate', function(e){console.log('url changed')});

// elements.downloadList.addEventListener("click", evt => {
//     console.log(evt.target.closest(".cover"));
//     if(evt.target.matches("[data-coverId=JOBmd21NuEUGoOIk]")){
//         console.log("match!")
//         return;
//     }
//     return;
// },false)