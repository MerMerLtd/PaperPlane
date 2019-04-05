// =============================================================
// Views
const elements = {
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
}
const renderFile = file =>{
    const markup = `
        <div class="file">
            <div class="delete-button"></div>
            <div class="file-icon"></div>
            <div class="progress">
                <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100" style="width: 75%"></div>
            </div>
            <div class="file-name">${file.name}</div>
            <div class="file-size">${file.size}</div>
        </div>  

        <!-- <p class="file-name">螢幕快照 2019-03-19 上午9.04.16.png</p> -->
        <!-- <p class="file-name">螢幕快照 ...04.16.png</p> -->
    `;
    elements.fileContainer.insertAdjacentHTML("beforeend", markup);
}
const renderFiles = files => {
    files.forEach(file => renderFile(file));
}

// // over file-container 的提示
// const hintAction = () => {
//     const markup = `
//         <div class="alert alert-success" role="alert">
//             You're on the right track! Just put it down.
//         </div>
//     `;
//     elements.page.insertAdjacentHTML("afterbegin", markup);
// }
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
//    elements.fileList.classList.add("invisible");

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

const handleDrop = evt => {
    elements.alertSuccess.style.setProperty("--opacity", 0);
}

// Check for the various File API support.
if (window.File && window.FileReader && window.FileList && window.Blob) {
    // Great success! All the File APIs are supported.
} else {
    alert('The File APIs are not fully supported in this browser.');
}

// 判斷瀏覽器是否支持拖拉上傳
var isAdvancedUpload = function() {
    var div = document.createElement('div');
    return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && 'FormData' in window;
}();

if(isAdvancedUpload){

    elements.dropZone.classList.add("has-advanced-upload");
    addMultiListener(elements.pageHeader, "drag dragstart dragend dragover dragenter dragleave drop", evt => handleDefault(evt));
    addMultiListener(elements.pageHeader, "dragover dragenter", evt => handleDragInPageHeader(evt));
    addMultiListener(elements.pageHeader, "dragleave dragend drop",  evt => handleDragoutPageHeader(evt));
    addMultiListener(elements.pageHeader, "drop",  evt => handleDragoutPageHeader(evt));

}

let isCurrentIn = false;







// 偵測到檔案進入
// 1. create file-container on the fly
// 2. 內部顯示 “”

