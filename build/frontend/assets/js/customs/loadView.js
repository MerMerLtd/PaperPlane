//check for Navigation Timing API support
if (window.performance) {
    console.info("window.performance works fine on this browser");
}
if (performance.navigation.type == 1) {
    console.info("This page is reloaded");

} else {
    console.info("This page is not reloaded");
}

// Check for the various File API support.
if (window.File && window.FileReader && window.FileList && window.Blob) {
    // Great success! All the File APIs are supported.
} else {
    alert('The File APIs are not fully supported in this browser.');
}

// polyfill for Element.closest from MDN
if (!Element.prototype.matches)
    Element.prototype.matches = Element.prototype.msMatchesSelector ||
    Element.prototype.webkitMatchesSelector;

if (!Element.prototype.closest)
    Element.prototype.closest = function (s) {
        var el = this;
        if (!document.documentElement.contains(el)) return null;
        do {
            if (el.matches(s)) return el;
            el = el.parentElement;
        } while (el !== null);
        return null;
    };

// 同一 element 監聽 || 不監聽多個event
const addMultiListener = (element, events, func) => {
    events.split(" ").forEach(event => element.addEventListener(event, func, false));
}

const removeMultiListener = (element, events, func) => {
    events.split(" ").forEach(event => element.removeEventListener(event, func, false));
}
// enableBtn || disableBtn
const disableBtn = btnEl => {
    if (btnEl.classList.contains("disable")) return;
    btnEl.classList.add("disable");
}
const enableBtn = btnEl => {
    if (!btnEl.classList.contains("disable")) return;
    btnEl.classList.remove("disable");
}

// hidden Child Elements
const hiddenChildEls = parentEl => {
    Array.from(parentEl.children).forEach(el => el.classList.add("u-hidden"));
}

const unHiddenChildEls = parentEl => {
    Array.from(parentEl.children).forEach(el => el.classList.remove("u-hidden"));
}

// hidden Element
const unhiddenElement = (element, delay) => {
    setTimeout(() => {
        element.classList.remove("u-hidden");
    }, delay);
}
const hiddenElement = (element, delay) => {
    setTimeout(() => {
        element.classList.add("u-hidden");
    }, delay);
}

// https://blog.grossman.io/how-to-write-async-await-without-try-catch-blocks-in-javascript/
const to = promise => {
    return promise.then(data => {
            return [null, data];
        })
        .catch(err => [err, null]);
}

// =============================================================
// base
// XHR
const maxConnection = Infinity;
const maxRetry = 3;
let connection = 0;
let queue = [];


const closeConnection = () => {
    connection--;

    if (queue.length > 0 && connection < maxConnection) {
        let next = queue.pop();
        if (typeof next === "function") {
            next();
        }
    }

    return true;
}

const makeRequest = opts => {
    // 工作排程 && 重傳
    if (connection >= maxConnection) {
        queue.push(opts); // ??
    } else {
        connection++;
        const xhr = new XMLHttpRequest();
        // xhr.responseType = "arraybuffer";
        if (opts.responseType === "arraybuffer") {
            xhr.responseType = "arraybuffer";
        }
        return new Promise((resolve, reject) => {
            xhr.onreadystatechange = () => {
                // only run if the request is complete
                if (xhr.readyState !== 4) return;
                if (xhr.status >= 200 && xhr.status < 300) {
                    // If successful
                    closeConnection();
                    opts.responseType === "arraybuffer" ?
                        resolve(new Uint8Array(xhr.response)) :
                        resolve(JSON.parse(xhr.responseText));
                } else {
                    // If false  
                    closeConnection();
                    reject(xhr.response);
                }
            }
            // Setup HTTP request
            xhr.open(opts.method || "GET", opts.url, true);
            if (opts.headers) {
                Object.keys(opts.headers).forEach(key => xhr.setRequestHeader(key, opts.headers[key]));
            }
            // Send the request
            if (opts.contentType == 'application/json') {
                xhr.setRequestHeader('content-type', 'application/json');
                xhr.send(JSON.stringify(opts.payload));
            } else {
                xhr.send(opts.payload);
            }
        });
    }
}

let elements = {
    tabSend: document.querySelector(".main-page a[href$='send']"),
    tabReceive: document.querySelector(".main-page a[href$='receive']"),
    tabPane1: document.querySelector(".main-page #send"), // same div 👉 dropCard: document.querySelector(".drop-card"),
    tabPane2: document.querySelector(".main-page #receive"),
    dropCard: document.querySelector(".drop-card"),
    downloadCard: document.querySelector(".download-card"),
    signinCard: document.querySelector("#sign-in"),
    signupCard: document.querySelector("#sign-up"),
    switchSignin: document.querySelector(".switch-signin > a"),
    switchSignup: document.querySelector(".switch-signup > a"),
    navLoginBtn: document.querySelector("li[data-toggle='modal'] > .btn"),
    navbarToggle: document.querySelector(".navbar-toggler"),
    html: document.querySelector("html"),
    modal: document.querySelector(".modal"),
    container: document.querySelector(".page-header > .container"),
    signInEmail: document.querySelector("#sign-in input[type=email]"),
    signUpEmail: document.querySelector("#sign-up input[type=email]"),
    signInPassword: document.querySelector("#sign-in input[type=password]"),
    signUpPassword: document.querySelector("#sign-up input[type=password]"),
    passwordConfirm: document.querySelector("#sign-up input[name^=password2]"),
    signInCheck: document.querySelector("#sign-in input[type=checkbox]"),
    signUpCheck: document.querySelector("#sign-up input[type=checkbox]"),
    downloadCheck: document.querySelector(".download-card input[type=checkbox]"),
    agreeTerms: document.querySelector(".agree-terms"),
    pageHeader: document.querySelector(".page-header"),
    addIcon: document.querySelector(".add__icon"),
    addText: document.querySelector(".add__text"),
    dropndDropText: document.querySelector(".box__dragndrop"), //text
    placeholder: document.querySelector(".placeholder"),
    dropCardHeader: document.querySelector(".drop-card .card-header"),
    dropZone: document.querySelector(".box__dropzone"),
    fileList: document.querySelector(".file-list"),
    boxFile: document.querySelector(".box__file"),
    btnSend: document.querySelector(".btn-send"),
    sendingCard: document.querySelector(".sending-card"),
    sendingWays: document.querySelector(".sending-ways"),
    countdown: document.querySelector(".countdown > span"),
    displayDigit: document.querySelector(".display-digit"),
    displayLink: document.querySelector(".display-link"),
    displayQRCode1: document.querySelectorAll(".display-code").item(0),
    displayQRCode2: document.querySelector(".sending-ways>:nth-child(2) .display-code"),
    btnBack: document.querySelector(".btn-back"),
    btnCancel: document.querySelector(".btn-cancel"),
    btnOk: document.querySelector(".btn-ok"),
    diaplayProgress: document.querySelector(".display-progress"),
    progressNum: document.querySelector(".progress-num"),
    fileNums: document.querySelector(".file-nums"),
    fileSize: document.querySelector(".file-size"),
    totalProgressBar: document.querySelector(".total-progress-bar"),
    inputCard: document.querySelector(".input-card "),
    btnDownload: document.querySelector(".btn-download"),
    inputKey: document.querySelector(".input-key"),
    downloadCard: document.querySelector(".download-card "),
    btnReceive: document.querySelector(".btn-receive"),
    downloadList: document.querySelector(".download-card .file-list"),
    downloadBody: document.querySelector(".download-card > .card-body"),
    expDate: document.querySelector(".download-card .exp-date "),
    filesInfo: document.querySelector(".download-card .files-info "),
    body: document.querySelector(".login-page"),
    navBarBrand: document.querySelector(".navbar-brand"),
    btnConfirmed: document.querySelector(".btn-confirmed"),
    successPage: document.querySelector(".success-page"),
    failedPage: document.querySelector(".failed-page"),
    emptyFileHint: document.querySelector(".download-card .empty-file"),
    btnBackToReceive: document.querySelector(".download-card .btn-back"),
    btnRefresh: document.querySelector(".download-card .btn-refresh"),
}

let letter;
const initialLetter = async () => {
    let err, data;
    [err, data] = await to(makeRequest({
        method: "POST",
        url: "/letter",
    }));
    if (err) {
        console.trace(err)
    } else {
        letter = data.lid;

        console.log("letter", letter);

        displayDigit(elements.displayDigit, letter);
        displayLink(elements.displayLink, letter);
        genQRCode(elements.displayQRCode1, letter);
        genQRCode(elements.displayQRCode2, letter);
    }
}
initialLetter();

// 判斷瀏覽器是否支持拖拉上傳
let isAdvancedUpload = function () {
    let div = document.createElement('div');
    return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div));
}();

if (isAdvancedUpload) {
    elements.dropCardHeader.classList.add("has-advanced-upload");
    addMultiListener(elements.pageHeader, "drag dragstart dragend dragover dragenter dragleave drop", evt => handleDefault(evt));
    addMultiListener(elements.pageHeader, "dragover dragenter", evt => handleDragInPageHeader(evt));
    addMultiListener(elements.pageHeader, "dragleave dragend drop", evt => handleDragoutPageHeader(evt));
    addMultiListener(elements.pageHeader, "drop", evt => handleFilesSelected(evt));
}

// render Loader && remove Loader
const renderLoader = parentEl => {
    // console.log(parentEl)  // elements.downloadCard
    hiddenChildEls(parentEl);
    const markup = `
        <div class="lds-spinner">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
        </div>
    `;
    parentEl.insertAdjacentHTML("afterbegin", markup);
    elements = {
        ...elements,
        loader: document.querySelector(".lds-spinner"),
    }
}

const removeLoader = parentEl => {
    elements.loader.remove();
    unHiddenChildEls(parentEl);
}

// after file in the fileList
const handleInFileList = () => {
    elements.placeholder.classList.add("u-margin-top--sm");
    elements.addIcon.classList.add("add__icon--small");
    elements.addText.classList.add("add__text--small");
    // elements.alertSuccess.style.setProperty("--opacity", 1); // 待修改
    elements.dropZone.classList.add("pointer");
    // dropZone pointer Event: none
}
const handleOutFileList = () => {
    elements.placeholder.classList.remove("u-margin-top--sm");
    elements.addIcon.classList.remove("add__icon--small");
    elements.addText.classList.remove("add__text--small");
    // elements.alertSuccess.style.setProperty("--opacity", 0);
    elements.dropZone.classList.remove("pointer");
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
    elements.dropCardHeader.classList.add("hint");
    elements.dropZone.classList.add("invisible");
    //elements.fileList.classList.add("invisible");
}
const removeHintLocation = () => {
    elements.dropCardHeader.classList.remove("hint");
    elements.dropZone.classList.remove("invisible");
    // elements.fileList.classList.remove("invisible");
}

let isCurrentIn = false;
// drag file in the pageHeader
const handleDragInPageHeader = evt => {
    if (!isCurrentIn) {
        isCurrentIn = true;
        hintLocation();
    }
    if (evt.target.matches(".box__dropzone, .box__dropzone * " || state.fileObj.files.length)) {
        removeHintLocation();
        handleInFileList();
    } else {
        hintLocation();
        handleOutFileList();
    }
}

const handleDragoutPageHeader = evt => {
    if (isCurrentIn) {
        isCurrentIn = false;
        removeHintLocation();
    }
}

//================================================
//=========== render File ===========

const formatFileSize = size => {
    let formatted, power;

    if (typeof size !== "number") return false;
    const unit = ["byte", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

    const check = (size, power = 0) => {
        if (Math.ceil(size).toString().length > 3) {
            return check(size /= 1024, ++power);
        }
        return [Number.isInteger(size) ? size : size.toFixed(2), power || 1];
    }

    [formatted, power] = check(size);
    return `${formatted}${unit[power]}`
}

const renderFile = (parentEl, file) => {
    // console.log(parentEl, file);
    const isDownload = parentEl.classList.contains("download-list");
    const markup = `
    <div class="file" data-fid="${file.fid}" data-type="${isDownload?"download":"upload"}">
        <div class="delete-button" style="display:${isDownload?"none":"block"}"></div>    
        <div class="file-icon">
            <div class="cover select">
                <div class="cover__border"></div>
                <div class="cover__continue" data-coverId="${file.fid}">
                    <div class="cover__sector--before"></div>
                    <div class="cover__sector">
                        <!-- <div class="cover__sector--before"></div>
                        <div class="cover__sector--after"></div> -->
                    </div>
                    <div class="cover__sector--after"></div>
                </div>
                <div class="cover__pause">
                    <div class="cover__pause--p1"></div>
                    <div class="cover__pause--p2"></div>
                </div>  
                <div class="cover__select "> <!-- selected -->
                    <div class="cover__select--s1"></div>
                    <div class="cover__select--s2"></div>
                </div>     
            </div>
        </div>
    
        <div class="file-name">${file.fileName}</div>
        <div class="file-size">${formatFileSize(file.fileSize)}</div>
    </div>

    <!-- <p class="file-name">螢幕快照 2019-03-19 上午9.04.16.png</p> -->
    <!-- <p class="file-name">螢幕快照 ...04.16.png</p> -->
    `;

    parentEl.insertAdjacentHTML("beforeend", markup)
}

// deg: 0 ~ 360;
// progress: 0 ~ 1;
const renderProgress = (file, type) => { //?
    let progress = file.progress;
    let fid = file.fid;
    let deg = progress * 360;

    const el = document.querySelector(`${type ==="download"? ".download-card": ".drop-card"} [data-coverId=${fid}]`);
    if(!file.isPaused){
        console.log(file.isPaused)
        el.parentElement.classList.add("continue");
        el.parentElement.classList.remove("select");
        el.parentElement.classList.remove("pause");
    }

    if (deg >= 180) {
        // console.log(progress)
        el.children.item(2).style.zIndex = 1;
        el.children.item(0).style.transform = `rotate(90deg)`;
        el.children.item(2).style.transform = `rotate(${deg + 90}deg)`;
    } else {
        // console.log(progress)
        el.children.item(0).style.transform = `rotate(${deg - 90}deg)`;
        el.children.item(2).style.transform = `rotate(${deg + 90}deg)`;
    }
    // el.children.item(0).style.transform = `rotate(${deg-90}deg)`;

    // if(deg >= 180){
    //     el.children.item(2).style.opacity = 1;
    //     el.children.item(1).style.overflow = "visible";
    // }
    if (deg === 360) {
        el.parentNode.remove();
        return;
    }
}

//================================================
//================== UI Control ==================
// UI Control v1
const uploadFileControl = async evt => {
    const element = evt.target.closest(".file");
    const fid = element.dataset.fid; // UI onClickedFid
    const type = element.dataset.type;
    const index = uploadQueue.findIndex(file => file.fid === fid);
    const file = uploadQueue[index];

    if (evt.target.matches(".delete-button, .delete-button *")) {
        isSend = false;
        element.parentElement.removeChild(element);
        uploadQueue.splice(index, 1);
        updateTotalProgress();
        if (!elements.fileList.childElementCount) handleOutFileList();
        const res = await makeRequest({
            method: "DELETE",
            url: `/letter/${letter}/upload/${fid}`
        })
        console.log(res);
    } else if (evt.target.closest(".file")) {
        // if (type === "upload") {
        // isSend = false;
        if (file.sliceIndex === file.sliceCount) return;
        file.isPaused = !file.isPaused;
        console.log("uploadFileControl/ isPaused: ", file.fid, file.isPaused);
        if (!file.isPaused) {
            uploadShard(file);
        }
        // }
        // if(type === "download"){
        //     if(file.progress === 1 || file.isDownloaded) return;
        //     file.isPaused = !file.isPaused;
        //     if(!file.isPasused){
        //         downloadShard(file);
        //     }
        // }
    }
}

// UI Control v2
const uiControlFile = evt => {
    const element = evt.target.closest(".file");
    const elementCover = evt.target.closest(".cover");
    const fid = element.dataset.fid;
    // console.log("fileControl", evt.target.closest(".file"), evt.target.matches(`.cover, .cover > *`))
    const type = element.dataset.type;
    const file = type === "upload" ?
        uploadQueue[uploadQueue.findIndex(file => file.fid === fid)] :
        downloadQueue[downloadQueue.findIndex(file => file.fid === fid)];

    if (evt.target.matches(".delete-button, .delete-button *")) {
        isSend = false;
        element.parentElement.removeChild(element);
        uploadQueue.splice(index, 1);
        if (!elements.fileList.childElementCount) handleOutFileList();
        return makeRequest({
            method: "DELETE",
            url: `/letter/${letter}/upload/${fid}`
        })
    }

    if (evt.target.closest(".file")) {
        // console.log("match!", file);
        // console.log(file.progress)
        if (file.progress === 1 || file.isDownloaded) return;
        file.isPaused = !file.isPaused;
        if (file.isPaused) {
            elementCover.classList.remove("continue");
            elementCover.classList.remove("select");
            elementCover.classList.add("pause");
            console.log("uiControlFile/ isPaused: ", file.fid, file.isPaused);

        } else {
            elementCover.classList.add("continue");
            elementCover.classList.remove("select");
            elementCover.classList.remove("pause");
            console.log("uiControlFile/ isPaused: ", file.fid, file.isPaused);
            type === "upload" ? uploadShard(file) : downloadShard(file);
        }
    }
    return;
}


//================================================
//================== Login View ==================

// elements.downloadCheck.addEventListener("change", evt => document.querySelectorAll(".cover__select").toggle("selected"), false)
const checkEmail = email => {
    const regExp = new RegExp(/^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/);
    return regExp.test(email);
}

const checkPassword = password => {
    const regExp = new RegExp(/[\x21-\x7e]{8,}$/);
    return regExp.test(password);
}

const inputValidation = type => {
    console.log(evt)
    const checkedEmail = checkEmail(elements.signInEmail.value);
    if (checkedEmail) {
        elements.signInEmail.classList.add("has-success")
        elements.signInEmail.classList.remove("has-danger");
    }
    const checkedPassword = checkPassword(elements.signInPassword.value);
    if (checkedPassword) {
        elements.signInpassword.classList.add("has-success")
        elements.signInpassword.classList.remove("has-danger");
    }

    if (type === "signup") {
        // const checkedPassword2 = checkPassword(elements.passwordConfirm.value);
        // if(checkedPassword2) {
        //     elements.passwordConfirm.classList.add("has-success")
        //     elements.passwordConfirm.classList.remove("has-danger");
        // }
        // if(checkedEmail && checkedPassword && checkedPassword2 && elements.signUpCheck.checked){
        if (checkedEmail && checkedPassword && elements.signUpCheck.checked) {
            // enable 
        }
    }
    if (type === "signin") {
        if (checkedEmail && checkedPassword) {

        }
    }

}

elements.signInEmail.addEventListener("change", () => inputValidation("signin"), false)
elements.signInPassword.addEventListener("change", () => inputValidation("signin"), false)

//================================================
//================= Sending View =================

let intervalId;

const formatTime = time => {
    const min = Math.trunc(time / 1000 / 60).toString().length === 2 ?
        `${Math.trunc(time / 1000 / 60)}` :
        `0${Math.trunc(time / 1000 / 60)}`;
    const sec = ((time / 1000) % 60).toString().length === 2 ?
        `${(time / 1000) % 60}` :
        `0${(time / 1000) % 60}`;
    return [min, sec];
}

const countdown = time => {
    let timerTime = time * 60 * 1000;
    const interval = () => {
        let min, sec;
        timerTime -= 1000;
        [min, sec] = formatTime(timerTime);
        elements.countdown.innerText = `${min}:${sec}`;
        return timerTime;
    }

    if (!timerTime) {
        clearInterval(intervalId);
        elements.countdown.innerText = `10:00`;
        return timerTime;
    }

    intervalId = setInterval(interval, 1000, timerTime);
}


const genQRCode = (el, letter) => {
    let qrcode = new QRCode(el, {
        text: ``,
        width: 100,
        height: 100,
        colorDark: "#ff2d55",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
    qrcode.makeCode(`http://localhost/letter/${letter}`);
}

const displayDigit = (el, letter) => {
    Array.from(el.children).forEach((span, i) => span.innerText = letter[i])
}

const displayLink = (el, letter) => {
    el.firstElementChild.href += `#download/${letter}`;
    el.firstElementChild.lastElementChild.innerText += `${letter}`;
}

const progressCalculator = files => {
    // ?? Or setInterval check
    let completeCount = 0,
        totalCount = 0,
        totalSize = 0,
        completeSize = 0,
        fileCount = 0,
        totalProgress = 0;
    // marginLeft = 0;

    if (!files.length) return {
        totalProgress,
        totalSize,
        completeSize,
        fileCount,
        // marginLeft,
    }

    files.forEach(file => {
        completeCount += file.sliceIndex;
        totalCount += file.sliceCount;
        totalSize += file.fileSize;
    })

    totalProgress = (completeCount / totalCount).toFixed(2); // 0.??;
    completeSize = Math.round(totalProgress * totalSize);
    totalProgress *= 100; // ??
    // marginLeft = Math.round(totalProgress * 0.85);
    fileCount = files.length;


    if (totalProgress === 100) {
        isDone = true;
        enableBtn(elements.btnOk); // ?? 不應該放這裡不過就先這樣吧
    }
    return {
        totalProgress,
        totalSize,
        completeSize,
        fileCount,
        // marginLeft,
    };
}

// ?? if Choose EMAIL disable btnBack but can cancel uploading 問題在於什麼時候寄email
const updateTotalProgress = () => {
    const data = progressCalculator(uploadQueue);
    elements.totalProgressBar.style.width = `${data.totalProgress}%`;
    elements.progressNum.style.marginLeft = `${5 + data.totalProgress *.8}%`;
    elements.progressNum.innerText = `${(data.totalProgress || 0 )}%`;
    elements.fileNums.innerText = `Total ${data.fileCount || 0} files`;
    elements.fileSize.innerText = `${formatFileSize(data.completeSize || 0)}/${formatFileSize(data.totalSize)}`;
}

// btn-cancel || btn-ok 
const doneWithSending = deleteFile => {
    // 將uploadQueue裡面的files移除並 && 根據deleteFile判斷是否刪除在後段的資料
    emptyUploadQueue(deleteFile);
    // 刪除計時器並將ui歸零
    !!deleteFile ? isSend = false : null;
    countdown(0);
    //恢復初始畫面
    elements.fileList.innerHTML = ""; //!elements.fileList.childElementCount? === true
    handleOutFileList();
    updateTotalProgress();
    return false;
}

//================================================
//================ UI renderView =================
// routes = {
//     '/': dropView,
//     '/#send': dropView,
//     '/#receive/letter': downloadView,
//     '/#sign-in': signInView,
//     '/#sign-up': signUpView,
//     '/#validation': validationView,
//   };

const renderSendingView = () => {
    // 1. according to "#send .active" to render differ sendingWays
    const type = document.querySelector("#send .active").innerText || "LINK";

    // css
    switch (type) {
        case "EMAIL":
            elements.sendingCard.classList.add("email");
            elements.sendingCard.classList.remove("link");
            elements.sendingCard.classList.remove("direct");
            console.log(type);

            break;
        case "LINK":
            elements.sendingCard.classList.remove("email");
            elements.sendingCard.classList.add("link");
            elements.sendingCard.classList.remove("direct");
            console.log(type);

            break;
        case "DIRECT":
            elements.sendingCard.classList.remove("email");
            elements.sendingCard.classList.remove("link");
            elements.sendingCard.classList.add("direct");
            console.log(type);
            console.log(isSend);
            if (!isSend) { // && !!uploadQueue.length
                countdown(10);
            }
            isSend = true;
            break;
        default:
            throw new Error(`${type}`);
    }
    // 2. hidden drop-card
    elements.dropCard.classList.add("u-hidden");
    // 3. show sending-card
    elements.sendingCard.classList.remove("u-hidden");
}

const sendingViewControl = evt => {
    if (!evt.target.matches(".btn-back, .btn-back *, .btn-cancel,.btn-ok")) return;
    if (evt.target.matches(".btn-back, .btn-back *")) {
        console.log(evt.target)
    } else if (evt.target.matches(".btn-cancel")) {
        // ++ alert ?? 自己寫一個library;
        countdown(0);
        doneWithSending(true);

    } else if (evt.target.matches(".btn-ok")) {
        if (!isDone) return;
        doneWithSending(); //將uploadQueue裡面的files移除
    }
    elements.sendingCard.classList.add("u-hidden");
    elements.dropCard.classList.remove("u-hidden");
}

const renderTabView1 = () => {
    elements.tabSend.classList.add("active");
    elements.tabSend.classList.add("show");
    elements.tabPane1.classList.add("active");
    elements.tabPane1.classList.add("show");
    elements.tabReceive.classList.remove("active");
    elements.tabReceive.classList.remove("show");
    elements.tabPane2.classList.remove("active");
    elements.tabPane2.classList.remove("show");
}
const renderTabView2 = () => {
    elements.tabSend.classList.remove("active");
    elements.tabSend.classList.remove("show");
    elements.tabPane1.classList.remove("active");
    elements.tabPane1.classList.remove("show");
    elements.tabReceive.classList.add("active");
    elements.tabReceive.classList.add("show");
    elements.tabPane2.classList.add("active");
    elements.tabPane2.classList.add("show");
}

const closeLoginView = () => {
    elements.html.classList.remove("nav-open");
    elements.navbarToggle.classList.remove("toggled");
    elements.modal.classList.remove("show");
    setTimeout(() => {
        elements.body.classList.remove("modal-open");
        elements.modal.setAttribute("aria-hidden", false);
        elements.modal.style.display = "none";
        elements.modal.style.pointerEvents = "auto";
        elements.modal.style.zIndex = "1050";
    }, 300);
}

//     '/#sign-in': signInView,
//     '/#sign-up': signUpView,
const renderLoginView = () => {
    hiddenElement(elements.successPage, 0);
    hiddenElement(elements.failedPage, 0);
    elements.html.classList.remove("nav-open");
    elements.navbarToggle.classList.remove("toggled");
    elements.container.classList.add("u-hidden");

    elements.body.classList.add("modal-open");
    elements.modal.removeAttribute("aria-hidden");
    elements.modal.style.display = "block";
    elements.modal.style.pointerEvents = "none";
    elements.modal.style.zIndex = "2";
    setTimeout(() => elements.modal.classList.add("show"), 100);
}

//     '/': dropView,
//     '/#send': dropView,
const renderDropView = () => {
    hiddenElement(elements.successPage, 0);
    hiddenElement(elements.failedPage, 0);
    closeLoginView();

    renderTabView1();
    unhiddenElement(elements.container, 300);
}

//  '/#receive/letter': downloadView,
const renderDownloadView = () => {
    hiddenElement(elements.successPage, 0);
    hiddenElement(elements.failedPage, 0);
    closeLoginView();

    renderTabView2();
    unhiddenElement(elements.container, 300);
    elements.inputCard.classList.remove("active");
    elements.downloadCard.classList.add("active");
}

// '/#receive': downloadInput,
const renderDownloadInput = () => {
    hiddenElement(elements.successPage, 0);
    hiddenElement(elements.failedPage, 0);
    closeLoginView();

    renderTabView2();
    unhiddenElement(elements.container, 300);
    elements.inputCard.classList.add("active");
    elements.downloadCard.classList.remove("active");
}

//     '/#varification': varificationView,
const renderVarificationView = result => {
    closeLoginView();
    hiddenElement(elements.container, 0);
    if (result) {
        // result === true 👉 驗證成功
        hiddenElement(elements.failedPage, 0);
        unhiddenElement(elements.successPage, 0);
    } else {
        // result === false 👉 驗證失敗
        hiddenElement(elements.successPage, 0);
        unhiddenElement(elements.failedPage, 0);
    }
}

// renderValidationView();

// open && close by modal
const openLoginPage = evt => {
    // close Nav && change url
    elements.html.classList.remove("nav-open");
    elements.navbarToggle.classList.remove("toggled");
    elements.container.classList.add("u-hidden");

    // add 
}
const closeLoginPage = evt => {
    if (evt.target.matches(".modal")) {
        elements.container.classList.remove("u-hidden");
        window.location.hash = "";
    }
}

elements.btnSend.addEventListener("click", renderSendingView, false);
elements.sendingCard.addEventListener("click", evt => sendingViewControl(evt));
elements.navLoginBtn.addEventListener("click", openLoginPage, false);
elements.modal.addEventListener("click", closeLoginPage, false);
elements.btnConfirmed.addEventListener("click", renderDropView, false);
elements.btnBackToReceive.addEventListener("click", renderDownloadInput);
// elements.btnRefresh.addEventListener("click", checkUrl, false);

elements.downloadList.addEventListener("click", evt => uiControlFile(evt), false);
// elements.downloadList.addEventListener("click", evt => uploadFileControl(evt), false);
// elements.fileList.addEventListener("click", evt => uploadFileControl(evt), false);
elements.fileList.addEventListener("click", evt => uiControlFile(evt), false);