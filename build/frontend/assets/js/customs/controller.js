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
            ?
            uploadQueue.pop() :
            deleteUploadFile(uploadQueue.pop().fid);
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
        if (data.progress < 1) uploadShard(target);
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
                resultArray.forEach(file => uploadQueue.push({
                    ...file
                }));
                uploadFiles();
            }

            // 7. 上傳失敗 3s 後 重新傳送
        });
}

// ======================================
// ============= download ===============
let isFetching = false;

const downloadQueue = []; // 以file為單位存儲用來取得碎片的地址
const downloadFiles = []; // 以file為單位存儲已獲取碎片

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
        let qIndex = downloadQueue.findIndex(file => file.fid === data.fid);
        // console.log(downloadQueue)
        if (qIndex === -1) {
            // console.log("439")
            downloadQueue.push({
                ...data,
                isPaused: true,
                // isSelected: true,
                pointer: 0,
                // waiting: [],
                // isCompleted: false
            });
            qIndex = downloadQueue.length - 1;
        }
        // console.log(downloadFiles)
        let fIndex = downloadFiles.findIndex(file => file.fid === data.fid);
        // console.log(downloadFiles)
        // let waitingLength = target.waiting;
        if (fIndex === -1) {
            // console.log("453")
            // delete target.waiting;
            downloadFiles.push({
                ...data,
                slices: [],
                progress: 0,
                downloaded: false,
            });
        }
        // console.log(downloadQueue[qIndex].waiting)

        if (downloadQueue[qIndex].pointer === -1) return data;

        const pointer = downloadQueue[qIndex].pointer;
        // if(pointer < downloadQueue[qIndex].waiting.length) pointer = downloadQueue[qIndex].waiting.length;
        // console.log(pointer);

        const list = data.slices.slice(pointer);
        // console.log(pointer, list)
        const newPointer = list.findIndex((shardPath, i) => {
            // if (downloadFiles[downloadFiles.findIndex(file => file.fid === data.fid)].progress === 1 || shardPath.includes("false")) return true;
            if (shardPath.includes("false")) return true;
            downloadQueue[qIndex].waiting.push({
                path: shardPath,
                index: pointer + i,
                fid: data.fid
            })
            // console.log(pointer, pointer + i, "0~644");
        });
        // console.log(downloadQueue)

        // if (newPointer === -1) downloadQueue[qIndex].isCompleted === true;
        // console.log(downloadQueue[qIndex].waiting)

        downloadQueue[qIndex].pointer = pointer + newPointer
        // console.log(`data.slices[${newPointer}]為下一次起點`);

        if (data.progress === 1 || newPointer === -1) {
            return data;
        }

        setTimeout(() => {
            fetchFile(filePath);
        }, delay); //setTimeout(fetchFile, delay, filePath, newPointer);
        // console.log("fetchFile", data)
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

const createDownloadFile = file => {
    // 合併檔案並賦予檔案型別
    const blob = new Blob(file.slices, {
        type: file.contentType
    });
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
}

const assembleShard = (target, shard, index) => {
    let fileIndex = downloadFiles.findIndex(file => file.fid === target.fid);
    // let waitingLength = target.waiting;
    // if (fileIndex === -1) {
    //     // delete target.waiting;
    //     downloadFiles.push({
    //         ...target,
    //         slices: [],
    //         progress: 0,
    //         downloaded: false,
    //     });
    //     fileIndex = downloadFiles.length - 1;
    // }
    downloadFiles[fileIndex].slices[index] = shard;
    // console.log(downloadFiles[fileIndex].slices.filter((v) => !!v).length )
    downloadFiles[fileIndex].progress = downloadFiles[fileIndex].slices.filter((v) => !!v).length / target.totalSlice;
    return downloadFiles[fileIndex];
}

const fetchShard = async target => {
    if (target.isPaused) return false;
    if (!target.waiting.length) {
        const i = downloadFiles.findIndex(f => f.fid === target.fid);
        if(downloadFiles[i].progress === 1 ){
            createDownloadFile(downloadFiles[i]);
            return;
        }
        // else
        // : document.querySelector(`.download-card .file[data-fid=${target.fid}] .cover`).classList.value = "cover pause";
        return;
    }
    const shardInfo = target.waiting.pop();

    let err, data;
    [err, data] = await to(makeRequest({
        method: "GET",
        url: shardInfo.path,
        responseType: "arraybuffer",
    }));
    // console.log(err, data, "in fetchShard");
    if (err) {
        target.retry = target.retry ? (target.retry + 1) : 1;
        if (target.retry <= maxRetry) {
            target.waiting.reverse().push(shardInfo);
            target.waiting.reverse()
            fetchShard(target);
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
        renderProgress(file, "download");
        // console.log("call renderProgress")
        if (file.progress === 1) {
            // if (file.progress === 1 && !file.download) {
            createDownloadFile(file);
            return;
        }
        // 繼續下載下一個碎片
        // console.log(target)
        if (!!target.waiting.length) fetchShard(target);
    }
}

const downloadAll = () => {
    console.log(downloadQueue);
    if (!downloadQueue.length) return;
    downloadQueue.forEach(file => {
        if (file.isPaused) file.isPaused = false;
        if (connection >= maxConnection) {
            queue.push(fetchShard.bind(this, file));
            return false;
        }
        // console.log(file, "download all Files")
        fetchShard(file);
    });
}

const renderDownloadFiles = async filePaths => {
    console.log("clean all");
    
    // 2. render loader 
    renderLoader(elements.emptyFileHint);

    // 3. filePaths.length = 0 沒有路徑
    // if (!filePaths.length) {
    //     setTimeout(() => {
    //         removeLoader(elements.emptyFileHint);
    //     }, 500);
    //     return false;
    // }

    // 4. fetch files
    hiddenElement(elements.emptyFileHint);

    Promise.all(filePaths.map(async filePath => fetchFile(filePath)))
        .then(resArr => {
            console.log(downloadFiles, resArr)
            if (downloadFiles.length) {
                downloadFiles.forEach((f, i) => {
                    if(resArr.findIndex(file => file.fid === f.fid) === -1)
                        downloadFiles.splice(i,1);
                })
                console.log(downloadFiles, resArr);
            }
            // removeLoader
            setTimeout(removeLoader, 500, elements.emptyFileHint);
            // console.log(downloadFiles)
            elements.filesInfo.innerHTML = `Total ${downloadFiles.length} files &middot; ${formatFileSize(progressCalculator(downloadFiles).totalSize)}`;

            // 5. renderFiles
            Array.from(document.querySelectorAll(".download-list > .file")).forEach(el => el.remove());

            if(!downloadFiles.length) return false;

            console.trace(downloadFiles);
            downloadFiles.forEach(file => {
                renderFile(elements.downloadList, file)
            });
        });
}

const checkValidity = inputKey => {
    // 1. if elements.inputKey.value is numbers || 1.2.1 if elements.inputKey.value is string (can be link)
    if (dataType.isURL(inputKey)) {
        // 如果是URL
        // case1: 作為網址打開 www.drophere.io/#123456
        // return false;
    };
    // if not digit or digit.length !== 6
    if (!dataType.isDigit(inputKey) || inputKey.length !== 6) return false
    // else
    return inputKey;
}

const checkURL = async () => {
    // 1. if url not contain 6 digits 👉 return
    if (!window.location.hash.match(/\d{6}/)) {
        // return to downloadinputView
        renderDownloadInput();
        // add shake effect as a hint
        elements.inputCard.classList.add("shake");
        // remove class after animation end 👈 except using setTimeout, can also listen to animationend event
        setTimeout(() => elements.inputCard.classList.remove("shake"), 500);
        return false;
    }

    // 2. else get letter from url
    const letter = window.location.hash.match(/\d{6}/)[0]
    tabView2Location = `receive/${letter}`
    // console.log(letter)

    // 3 fetch data 👉 use letter 跟backend要資料
    const filePaths = await fetchFilePath(letter);
    // console.log(filePaths)
    // 3.1 如果沒有要到，重新輸入inputKey
    if (!filePaths) {
        // return to downloadinputView
        renderDownloadInput();
        // add shake effect as a hint
        elements.inputCard.classList.add("shake");
        // remove class after animation end 👈 except using setTimeout, can also listen to animationend event
        setTimeout(() => elements.inputCard.classList.remove("shake"), 500);
        return false;
    };

    renderDownloadView(filePaths);
    return false;
}

//  '/#receive/letter': downloadView,
const renderDownloadView = filePaths => {
    closeNavbar();
    hiddenElement(elements.signinPage);
    hiddenElement(elements.confirmPage);
    hiddenElement(elements.successPage);
    hiddenElement(elements.failedPage);

    unhiddenElement(elements.mainPage); // ++
    renderTabView2();
    elements.inputCard.classList.remove("active");
    elements.downloadCard.classList.add("active");
    renderDownloadFiles(filePaths);
}

const openDownloadView = async () => {
    const v = elements.inputKey.value.trim();
    // console.log(v);
    elements.inputKey.value = "";
    // 2. if url is inValid 👉 return
    if (!checkValidity(v)) {
        // console.log(v)
        // return to downloadinputView
        renderDownloadInput();
        // add shake effect as a hint
        elements.inputCard.classList.add("shake");
        // remove class after animation end 👈 except using setTimeout, can also listen to animationend event
        setTimeout(() => elements.inputCard.classList.remove("shake"), 500);
        return false;
    } else {
        // console.log(v)
        tabView2Location = `receive/${v}`;
        window.location.hash = `receive/${v}`;
        // checkURL()
    }
}

const Router = function () {};

Router.prototype.route = async hash => {
    console.trace(hash)
    switch (true) {
        case hash.startsWith("#drop"):
            renderDropView();
            break;
        case hash.startsWith("#receive"):
            console.log("render receive")
            if (window.location.hash.match(/\d{6}/)) {
                checkURL();
            } else {
                console.log("render renderDownloadInput")
                renderDownloadInput();
            }
            break;
        case hash.startsWith("#sign-in"):
            console.log("render signin")
            renderLoginView("sign-in");
            break;
        case hash.startsWith("#sign-up"):
            console.log("render signin")
            renderLoginView("sign-up");
            break;
        case hash.startsWith("#verification-success"):
            renderVerifyResultView(true);
            break;
        case hash.startsWith("#verification-fail"):
            renderVerifyResultView(false);
            break;
        case hash.startsWith("#confirm"):
            renderConfirmPage();
            break;
        case hash.startsWith("#deposit"):
            renderConfirmPage();
            break;
        default:
            // renderDropView();
            break;
    }
    // send
    // receive
    // receive/242231
    // sign-in
    // sign-up
    // verification
    // verification-success
    // verification-fail
}
const router = new Router();

window.addEventListener('popstate', (e) => {
        router.route(window.location.hash);
}, false);

//check for Navigation Timing API support
if (window.performance) {
    console.info("window.performance works fine on this browser");
    router.route(window.location.hash);
}
if (performance.navigation.type === 1) {
    console.info("This page is reloaded");
    router.route(window.location.hash);
} else {
    console.info("This page is not reloaded");
    router.route(window.location.hash);
}


elements.tabSend.addEventListener("click", renderTabView1, false);
elements.tabReceive.addEventListener("click", renderTabView2, false);

elements.navBarBrand.addEventListener("click", renderDropView, false);
elements.navLoginBtn.addEventListener("click", renderLoginView, false);
elements.btnSend.addEventListener("click", renderSendingView, false);

elements.btnRefresh.addEventListener("click", checkURL, false);
elements.btnBackToReceive.addEventListener("click", renderDownloadInput, false);
elements.btnDownload.addEventListener("click", openDownloadView, false);
elements.btnReceive.addEventListener("click", downloadAll, false);


elements.btnConfirmed.addEventListener("click", renderDropView, false);
elements.btnConfirmOK.addEventListener("click", checkEmailVerification, false);

// Router.prototype.route = hash => {
//     console.trace(hash)
//     if (hash.startsWith("#drop")) {
//         renderDropView();
//     } else if (hash.startsWith("#receive")) {
//         if (regExp.hasDigit.test(hash)) {
//             renderDownloadView();
//         } else {
//             renderDownloadInput();
//         }
//     } else if (hash.startsWith("#sign-in")) {
//         renderLoginView("sign-in");
//     } else if (hash.startsWith("#sign-up")) {
//         renderLoginView("sign-up");
//     } else if (hash.startsWith("#verification-success")) {
//         renderVerifyResultView(true);
//     } else if (hash.startsWith("#verification-fail")) {
//         renderVerifyResultView(false);
//     } else if (hash.startsWith("#verification")) {
//         renderConfirmPage();
//     } else if (hash.startsWith("#deposit")) {
//         // renderDropView();
//     } else {
//         renderDropView();
//     }
// }

// routes = {
//     '/': renderDropView,
//     '/#send': renderDropView,
//     '/#receive': renderDownloadInput,
//     // '/#receive/:letter': () => renderDownloadView(),
//     '/#sign-in': () => renderLoginView("sign-in"),
//     '/#sign-up': () => renderLoginView("sign-up"),
//     '/#verification': renderConfirmPage,
//     '/#verification-success': () => renderVerifyResultView(true),
//     '/#verification-fail': () => renderVerifyResultView(false),
//     // '/#deposit': depositView,
// };

// const inputHint
// window.onbeforeunload = evt => {
//     return "false";
// } //https://stackoverflow.com/questions/3527041/prevent-any-form-of-page-refresh-using-jquery-javascript

// https://stackoverflow.com/questions/6390341/how-to-detect-url-change-in-javascript
// Add a hash change event listener!
// window.addEventListener('hashchange', (e) => {
//     console.log(window.location.hash)
//     routes[window.location.hash]();
// }, false);
// Or, to listen to all URL changes:
// window.addEventListener('popstate', (e) => {
//     const route = `/${window.location.hash}`;
//     routes[route]();
// }, false);
