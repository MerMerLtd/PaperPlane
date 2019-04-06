// =============================================================
// base
// XHR
const makeRequest = opts => {
    // 工作排程 && 重傳
    const xhr = new XMLHttpRequest();
    return new Promise((resolve, reject) => {
        xhr.onreadystatechange = () => {
            // only run if the request is complete
            if(xhr.readyState !== 4) return;
            if(xhr.status >=200 && xhr.status < 300){
                // If successful
                resolve(JSON.parse(xhr.responseText));
            }else{
                // If false 3s後重傳， 試三次
                // 檢查重試次數
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

// =============================================================
// Views
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
// =============================================================
// Models

const File = {
    files: [],
}
// =============================================================
// Controller

const state = {};

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
    if(evt.target.matches(".box__dropzone, .box__dropzone * " || "fileList.length")){
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
            return await Promise.resolve({ errorMessage: "API BAD GATEWAY", error, file });
        } 
    }))
    .then((resultArray) => {
        // 3. 把資料存到 state 裡 =>state.fileObj.files
        state.fileObj.files = state.fileObj.files.concat(files); // FileList object.
        // 4. render 畫面
        renderFiles(resultArray);
        elements.progressBars = elements.progressBars.concat(resultArray.map(file => document.querySelector(`[data-progressId='${file.fid}']`))); // 選所有的progress bar
        console.log(elements.progressBars);
        // 5. 切割檔案並上傳

        // const readBlob = file => {
        //     const reader = new FileReader();
        //     let blob;

        //     if (file.webkitSlice) {
        //         blob = file.webkitSlice(0, file.size); //file.webkitSlice(startingByte, endindByte);
        //     } else if (file.mozSlice) {
        //         blob = file.mozSlice(0, file.size);
        //     }

        //     reader.readAsBinaryString(blob);
        // }

        // resultArray.map(file => readBlob(file)) 
        
        // 6. 上傳失敗 3s 後 重新傳送
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

let isCurrentIn = false;







// 偵測到檔案進入
// 1. create file-container on the fly
// 2. 內部顯示 “”

