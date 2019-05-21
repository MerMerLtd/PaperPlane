//check for Navigation Timing API support
if (window.performance) {
    console.info("window.performance works fine on this browser");
    if (!!window.location.search) {
        token = window.location.search; // ??
        window.location = window.location.origin; // ??
    }
}
if (performance.navigation.type === 1) {
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
    element.classList.remove("u-hidden");
    // setTimeout(() => {
    // }, delay);
}
const hiddenElement = (element, delay) => {
    // console.log(element);
    element.classList.add("u-hidden");
    // setTimeout(() => {
    // }, delay);
}

const onNavItemClick = (hash) => {
    window.history.pushState(
        hash,
        window.location.href,
    );
    window.location.hash = hash;
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
            if (opts.contentType === 'application/json') {
                xhr.setRequestHeader('content-type', 'application/json');
                xhr.send(JSON.stringify(opts.payload));
            } else {
                xhr.send(opts.payload);
            }
        });
    }
}

// https://github.com/Luphia/TexType/blob/master/index.js
const DataType = function () {}

const regExp = {
    email: /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/,
    password8: /[\x21-\x7e]{8,}$/,
    digit: /^-?\d+\.?\d*$/, //  /^\d+$/;
    hasDigit: /\d{6}/,
    internalIP: /(^127\.)|(^10\.)|(^172\.1[6-9]\.)|(^172\.2[0-9]\.)|(^172\.3[0-1]\.)|(^192\.168\.)/,
    URL: /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- ./?%&=]*)?/,
    // URL: new RegExp('http(s)?://([\\w-]+\\.)+[\\w-]+(/[\\w- ./?%&=]*)?'),
}

DataType.prototype = {
    is: (data, type) => {
        if (regExp[type] && typeof (regExp[type].test) === "function") {
            return regExp[type].test(data);
        }
    },
    isEmail: data => regExp.email.test(data),
    isPassword8: data => regExp.password8.test(data),
    isURL: data => regExp.URL.test(data),
    isDigit: data => regExp.digit.test(data),
}

const dataType = new DataType();

let elements = {
    mainPage: document.querySelector(".main-page"),
    successPage: document.querySelector(".success-page"),
    failedPage: document.querySelector(".failed-page"),
    confirmPage: document.querySelector(".confirm-page"),
    signinPage: document.querySelector(".signin-page"),
    purchasePage: document.querySelector(".purchase-page"),
    terms: document.querySelector("#terms"),
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
    loginAccount: document.querySelector(".login-account"),
    navLoginBtn: document.querySelector("li[data-toggle='modal'].nav-login"),
    navLogoutBtn: document.querySelector("li[data-toggle='modal'].nav-logout"),
    navbarToggle: document.querySelector(".navbar-toggler"),
    navPrice: document.querySelector(".nav-item.nav-price"),
    html: document.querySelector("html"),
    // modal: document.querySelector(".modal"),
    container: document.querySelector(".main-page > .page-header > .container"),
    signInEmail: document.querySelector("#sign-in input[type=email]"),
    signUpEmail: document.querySelector("#sign-up input[type=email]"),
    signInPassword: document.querySelector("#sign-in input[type=password]"),
    signUpPassword: document.querySelector("#sign-up input[type=password]"),
    btnSignUp: document.querySelector("#sign-up .card-footer .btn:last-child"),
    btnSignIn: document.querySelector("#sign-in .card-footer .btn:last-child"),
    passwordConfirm: document.querySelector("#sign-up input[name^=password2]"),
    signInCheck: document.querySelector("#sign-in input[type=checkbox]"),
    signUpCheck: document.querySelector("#sign-up input[type=checkbox]"),
    downloadCheck: document.querySelector(".download-card input[type=checkbox]"),
    agreeTerms: document.querySelector(".agree-terms"),
    useTab: document.querySelector("#terms .nav-pills>:first-child .nav-link"),
    privacyTab: document.querySelector("#terms .nav-pills>:last-child .nav-link"),
    usePane: document.querySelector("#terms .tab-content>:first-child#term-of-use"),
    privacyPane: document.querySelector("#terms .tab-content>:last-child#privacy-policy"),
    pageHeader: document.querySelector(".main-page > .page-header"),
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
    sendingEmailAddr: document.querySelector(".drop-card input[type=email]"),
    sendingSubject: document.querySelector(".drop-card input[type=text]"),
    sendingMessage: document.querySelector(".drop-card #message"),
    navSendpills: document.querySelector(".drop-card .nav-pills"),
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
    emptyFileHint: document.querySelector(".download-card .empty-file"),
    btnBackToReceive: document.querySelector(".download-card .btn-back"),
    btnRefresh: document.querySelector(".download-card .btn-refresh"),
    btnConfirmOK: document.querySelector(".confirm-page .btn-ok"),
    navPurchase: document.querySelector(".navbar-nav .dropdown-menu a[href='#purchase'].dropdown-item"),
    dropdownUser: document.querySelector(".dropdown.nav-item.user-info"),
}
let token;
// if(token){ // ?? token
//     elements.navLogoutBtn.classList.remove("u-hidden");
//     elements.dropdownUser.classList.remove("u-hidden");
// }
//test
elements.navLoginBtn.classList.add("u-hidden");

let letter;

const initialLetter = async () => {
    let err, data;
    [err, data] = await to(makeRequest({
        method: "POST",
        url: "/letter",
    }));
    if (err) {
        console.trace(err)
    }
    if (data) return data.lid;
}

initialLetter()
    .then(lid => {
        letter = lid;
        displayDigit(elements.displayDigit, letter);
        displayLink(elements.displayLink, letter);
        genQRCode(elements.displayQRCode1, letter);
        genQRCode(elements.displayQRCode2, letter);
    });


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
}

const removeLoader = parentEl => {
    elements = {
        ...elements,
        loader: document.querySelector(".lds-spinner"),
    }
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
            <div class="cover ${isDownload?"select":"continue"}" style="opacity:${file.progress === 1?"0":"1"}">
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
    if (type === "download") {
        console.log(file)
    }

    const el = document.querySelector(`${type ==="download"? ".download-card": ".drop-card"} [data-coverId=${fid}]`);
    if (!el) return;
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
const uiFileControl = evt => {
    const element = evt.target.closest(".file");
    const elementCover = evt.target.closest(".cover");
    const fid = element.dataset.fid;
    const type = element.dataset.type;
    const index = uploadQueue.findIndex(file => file.fid === fid);
    const file = type === "upload" ?
        uploadQueue[uploadQueue.findIndex(file => file.fid === fid)] :
        downloadQueue[downloadQueue.findIndex(file => file.fid === fid)];
    if (evt.target.matches(".delete-button, .delete-button *")) {
        isSend = false;
        element.parentElement.removeChild(element);
        uploadQueue.splice(index, 1);
        if (!elements.fileList.childElementCount) handleOutFileList();
        return makeRequest({
            headers: {
                token: `${token}`
            }, // ?? token
            method: "DELETE",
            url: `/letter/${letter}/upload/${fid}`
        })
    }
    // console.log(evt.target,evt.target.matches(".file"), evt.target.closest(".cover"))
    if (evt.target.closest(".cover")) {
        file.isPaused = !file.isPaused;
        if (file.isPaused) {
            elementCover.classList.remove("continue");
            elementCover.classList.remove("select");
            elementCover.classList.add("pause");
            console.log("uiFileControl/ isPaused: ", file.fid, file.isPaused);

        } else {
            elementCover.classList.add("continue");
            elementCover.classList.remove("select");
            elementCover.classList.remove("pause");
            console.log("uiFileControl/ isPaused: ", file, type);
            type === "upload" ? uploadShard(file) : fetchShard(file);
            // if(type === "upload"){
            //     uploadShard(file)
            // }else{
            //     if(downloadFiles.length){
            //         const index = downloadFiles.findIndex(f => f.fid === file.fid);
            //         if(index !== -1 && downloadFiles[index].progress === 1){
            //             // ?? trigger download the file
            //             createDownloadFile(downloadFiles[index]);
            //             return;
            //         }
            //         // else
            //         fetchShard(file);
            //         return;
            //     }
            // }
        }
    } else if (type === "download" && evt.target.closest(".file")) {
        createDownloadFile(downloadFiles[downloadFiles.findIndex(f => f.fid === fid)]);
    }
    return;
}


//================================================
//================== Login View ==================

// listen to change focus & ...
const checkAvailability = async (el, isRequire) => {
    if (!el.value || !dataType.isEmail(el.value) || el.parentNode.classList.contains("has-success")) return;
    
    el.parentNode.classList.value = "input-group loading";
    let err, data;
    const opts = {
        method: "GET",
        url: `/member/${el.value}/exists`,
        // url: `/member/luphia@mermer.cc/exists`,
    };
    [err, data] = await to(makeRequest(opts));
    console.log(err, data)
    if (err) throw new Error(err);
    if (data.exists === isRequire) {
        el.parentNode.classList.value = "input-group has-success";
        console.log(data.exists, isRequire);
        // el.parentNode.classList.add("has-success")
        // el.parentNode.classList.remove("loading");        
        // el.parentNode.classList.remove("has-danger");
        // el.parentNode.classList.remove("not-allow");
        // signUpValidation();
        return true;
    } else {
        // ?? 
        console.log(data.exists, isRequire)
        el.parentNode.classList.value = "input-group has-danger not-allow";
        // el.parentNode.classList.remove("loading");
        // el.parentNode.classList.remove("has-success")
        // el.parentNode.classList.add("has-danger");
        // el.parentNode.classList.add("not-allow");

        // css && html && isRequire? html.inner = "..." : html.inner = "...";
        return false;
    }

}

// elements.downloadCheck.addEventListener("change", evt => document.querySelectorAll(".cover__select").toggle("selected"), false)
const varifyEmail = el => {
    // console.log(el);
    if (!el.value) return;
    // const regExp = new RegExp(/^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/);
    if (dataType.isEmail(el.value)) {
        // el.parentNode.classList.value = "input-group loading";
        // if (regExp.test(el.value)) {
        // el.parentNode.classList.remove("has-danger");
        // el.parentNode.classList.remove("has-success");
        // // render loader
        // el.parentNode.classList.add("loading");
        return true;
    } else {
        // el.parentNode.classList.value = "input-group has-danger";
        // el.parentNode.classList.add("has-danger");
        // el.parentNode.classList.remove("loading");
        return false;
    }
}

const varifyPassword = el => {
    if (!el.value) return;
    // const regExp = new RegExp(/[\x21-\x7e]{8,}$/);
    if (dataType.isPassword8(el.value)) {
        // if (regExp.test(el.value)) {
        el.parentNode.classList.remove("has-danger");
        el.parentNode.classList.add("has-success");
        return true;
    } else {
        el.parentNode.classList.add("has-danger");
        el.parentNode.classList.remove("has-success");
        return false;
    }
}

const confirmPassword = el => {
    if (!el.value) return;
    if (elements.signUpPassword.value === el.value) {
        el.parentNode.classList.remove("has-danger");
        el.parentNode.classList.add("has-success");
        return true;
    } else {
        el.parentNode.classList.add("has-danger");
        el.parentNode.classList.remove("has-success");
        return false;
    }
}

const signInValidation = async () => {
    if (dataType.isEmail(elements.signInEmail.value) && !!elements.signInPassword.value) {
        enableBtn(elements.btnSignIn);
    } else {
        disableBtn(elements.btnSignIn);
    }
}

const signUpValidation = async () => {
    if(!dataType.isEmail(elements.signUpEmail.value)){
        elements.signUpEmail.parentNode.classList.value = "input-group has-danger";
    }else{
        elements.signUpEmail.parentNode.classList.value = "input-group";
    }

    const e = await checkAvailability(elements.signUpEmail, false);
    // if (e) {
    //     const ec = await checkAvailability(elements.signUpEmail, false);
    // }
    const pc = varifyPassword(elements.signUpPassword);
    const pc2 = confirmPassword(elements.passwordConfirm);
    // if(ec && pc && pc2 && elements.signUpCheck.checked){
    //     enableBtn(elements.btnSignUp);
    // }
    //test 👇 formal 👆
    console.log(e, pc, pc2, elements.signUpCheck.checked)
    if (e && pc && pc2 && elements.signUpCheck.checked) {
        enableBtn(elements.btnSignUp);
    } else {
        disableBtn(elements.btnSignUp);
    }
}

const signUp = async evt => {
    console.log("called")
    evt.preventDefault();
    if (elements.btnSignUp.classList.contains("disable")) return;
    const salt = new Date().getTime.toString(16);
    const email = elements.signUpEmail.value;
    const hash = CryptoJS.enc.Hex.stringify(CryptoJS.HmacSHA256(elements.signUpPassword.value, salt));
    let err, data;
    [err, data] = await to(makeRequest({
        contentType: 'application/json',
        method: "POST",
        url: "/member",
        payload: {
            "account": email,
            "password": {
                hash,
                salt,
            }
        },
    }))
    if (err) {
        throw new Error(err);
    }
    if (data) {
        // 跳轉提示到email驗證email
        onNavItemClick("confirm");
    }
}

const signIn = async evt => {
    evt.preventDefault();
    if (elements.btnSignIn.classList.contains("disable")) return;
    const salt = new Date().getTime().toString(16);
    const account = elements.signInEmail.value;
    const password = elements.signInPassword.value;
    const hash = CryptoJS.enc.Hex.stringify(CryptoJS.HmacSHA256(password, salt));
    let err, data;
    const opts = {
        contentType: 'application/json',
        method: "POST",
        url: "/member/login",
        payload: {
            account,
            password,
            hash,
            salt,
        },
    };

    [err, data] = await to(makeRequest(opts));
    if (err) {
        console.log(JSON.parse(err));
        elements.signinCard.classList.add("shake");
        setTimeout(() => elements.signinCard.classList.remove("shake"), 500);
        elements.signInEmail.value = "";
        elements.signInPassword.value = "";
        // throw new Error(err);
    }
    if (data) {
        if (data.token) token = data.token;

    
        if (data.error) { // ??
            // switch (data.error.code) {
            //     case 123:
            //         驗證未通過寄新的link給他 跳轉提示到email驗證email
            //         onNavItemClick("confirm")
            //         break;
            //     case 122:
            //         帳號密碼錯誤
            //         elements.signinCard.classList.remove("shake");
            //         elements.signinCard.classList.add("shake");
            //         break;
            //     default:
            //         break;
            // }
            console.log(data.error)
        }
    }
}

// 按 OK btn後 render Sign in UI
// Sign in btn 按下後會先 問後端是否有驗證 

// 有驗證的話 renderDropView && render 登入的樣式
// 沒有驗證的話 shake 登入畫面的form， // 跟出現提示帶入輸入email的input
// elements.signinCard.classList.add("shake");
// () => renderLoginView("sign-in")


elements.btnSignUp.addEventListener("click", evt => signUp(evt), false);
elements.btnSignIn.addEventListener("click", evt => signIn(evt), false);
elements.signInEmail.addEventListener("input", () => signInValidation(), false);
elements.signInPassword.addEventListener("input", () => signInValidation(), false);
elements.signUpEmail.addEventListener("input", () => signUpValidation(), false);
elements.signUpPassword.addEventListener("input", () => signUpValidation(), false);
elements.passwordConfirm.addEventListener("input", () => signUpValidation(), false);


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
    el.firstElementChild.href += `#receive/${letter}`;
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
const renderSendingView = async () => {
    // 1. according to "#send .active" to render differ sendingWays
    const type = document.querySelector("#send .active").innerText || "LINK";

    // css
    switch (type) {
        case "EMAIL":
            elements.sendingCard.classList.add("email");
            elements.sendingCard.classList.remove("link");
            elements.sendingCard.classList.remove("direct");
            const opts = {
                contentType: 'application/json',
                method: "POST",
                url: `/letter/${letter}/send`,
                // headers: {
                //     token: `${token}`
                // }, // ?? token
                payload: {
                    email: elements.sendingEmailAddr.value,
                    subject: elements.sendingSubject.value ||"Here is something for you",
                    content: elements.sendingMessage.value ||"Guten Tag!",
                },
            }
            console.log(opts)
            if (elements.btnSend.classList.contains("disable")) return;
            let err, data;
            [err, data] = await to(makeRequest(opts));
            if (err) {
                console.log(err)
                // throw new Error(err)
            }
            if (data) {
                console.log(data);
                return;
            }
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
    elements.terms.classList.remove("u-display");

    elements.tabSend.classList.add("active");
    elements.tabSend.classList.add("show");
    elements.tabPane1.classList.add("active");
    elements.tabPane1.classList.add("show");
    elements.tabReceive.classList.remove("active");
    elements.tabReceive.classList.remove("show");
    elements.tabPane2.classList.remove("active");
    elements.tabPane2.classList.remove("show");
    // window.location.hash = "send";
}

let tabView2Location = "receive"
const renderTabView2 = () => {
    elements.terms.classList.remove("u-display");

    elements.tabSend.classList.remove("active");
    elements.tabSend.classList.remove("show");
    elements.tabPane1.classList.remove("active");
    elements.tabPane1.classList.remove("show");
    elements.tabReceive.classList.add("active");
    elements.tabReceive.classList.add("show");
    elements.tabPane2.classList.add("active");
    elements.tabPane2.classList.add("show");
    // window.location.hash = tabView2Location;
    // console.log(window.location.hash)
}

const closeNavbar = () => {
    elements.html.classList.remove("nav-open");
    elements.navbarToggle.classList.remove("toggled");

}

//     '/#sign-in': signInView,
//     '/#sign-up': signUpView,
const renderLoginView = target => {
    // window.location.hash = target;
    closeNavbar();
    hiddenElement(elements.confirmPage);
    hiddenElement(elements.purchasePage);
    // hiddenElement(elements.successPage);
    // hiddenElement(elements.failedPage);
    hiddenElement(elements.mainPage);
    elements.terms.classList.remove("u-display");

    unhiddenElement(elements.signinPage); //
}


const renderPrivacyPolicy = () => {
    elements.terms.classList.add("u-display");
    elements.usePane.classList.remove("active");
    elements.usePane.classList.remove("show");
    elements.useTab.classList.remove("active");
    elements.useTab.classList.remove("show");
    elements.privacyPane.classList.add("active");
    elements.privacyPane.classList.add("show");
    elements.privacyTab.classList.add("active");
    elements.privacyTab.classList.add("show");
}
const renderTerms = () => {
    elements.terms.classList.add("u-display");
    elements.usePane.classList.add("active");
    elements.usePane.classList.add("show");
    elements.useTab.classList.add("active");
    elements.useTab.classList.add("show");
    elements.privacyPane.classList.remove("active");
    elements.privacyPane.classList.remove("show");
    elements.privacyTab.classList.remove("active");
    elements.privacyTab.classList.remove("show");
}

elements.privacyTab.addEventListener("click", () => window.location.hash = `terms/privacy`, false);
elements.useTab.addEventListener("click", () => window.location.hash = `terms`, false);

// const changeView = (nextView) => {
//     closeNavbar();
//     // const currViewEl = document.querySelector(".page.active-page");
//     hiddenElement(currViewEl);
//     unhiddenElement(nextViewEl);
// }

//     '/': dropView,
//     '/#send': dropView,
const renderDropView = () => {
    // window.location.hash = "send";
    closeNavbar();
    hiddenElement(elements.signinPage);
    hiddenElement(elements.confirmPage);
    hiddenElement(elements.purchasePage)
    // hiddenElement(elements.successPage);
    // hiddenElement(elements.failedPage);
    elements.terms.classList.remove("u-display");

    unhiddenElement(elements.mainPage); // ++
    renderTabView1();
}

// '/#receive': downloadInput,
const renderDownloadInput = () => {
    // window.location.hash = "receive";
    tabView2Location = "receive";

    closeNavbar();
    hiddenElement(elements.signinPage);
    hiddenElement(elements.confirmPage);
    hiddenElement(elements.purchasePage)
    // hiddenElement(elements.successPage);
    // hiddenElement(elements.failedPage);
    elements.terms.classList.remove("u-display");

    unhiddenElement(elements.mainPage); //++
    renderTabView2();
    elements.inputCard.classList.add("active");
    elements.downloadCard.classList.remove("active");
}

// '/#confirm
const renderConfirmPage = () => {
    // window.location.hash = "confirm";
    closeNavbar();
    hiddenElement(elements.signinPage);
    // hiddenElement(elements.successPage);
    // hiddenElement(elements.failedPage);
    hiddenElement(elements.mainPage);
    hiddenElement(elements.purchasePage);
    elements.terms.classList.remove("u-display");

    unhiddenElement(elements.confirmPage);
}

const renderPurchasePage = () => {
    closeNavbar();
    hiddenElement(elements.signinPage);
    hiddenElement(elements.mainPage);
    hiddenElement(elements.confirmPage);
    elements.terms.classList.remove("u-display");


    unhiddenElement(elements.purchasePage);
}
//     '/#verification-success': verifyResultView(true),
//     '/#verification-fail': verifyResultView(false),
// const renderVerifyResultView = result => {
//     closeNavbar();
//     hiddenElement(elements.signinPage);
//     hiddenElement(elements.confirmPage);
//     hiddenElement(elements.mainPage);
//     elements.terms.classList.remove("u-display");

//     if (result) {
//         // result === true 👉 驗證成功
//         window.location.hash = "verification-success";
//         hiddenElement(elements.failedPage);
//         unhiddenElement(elements.successPage);
//     } else {
//         // result === false 👉 驗證失敗
//         window.location.hash = "verification-fail";
//         hiddenElement(elements.successPage);
//         unhiddenElement(elements.failedPage);
//     }
// }

elements.navSendpills.addEventListener("click", evt => {
    if (evt.target.matches("a[href='#pill1']")) {
        elements.btnSend.classList.remove("disable")
    } else if (evt.target.matches("a[href='#pill2']")) {
        // ?? token
        // token? null:renderLoginView("sign-in")
        elements.btnSend.classList.remove("disable")
    } else if (evt.target.matches("a[href='#pill3']")) {
        // ?? token
        // token? null:renderLoginView("sign-in")
        if (!elements.sendingEmailAddr.value || !varifyEmail(elements.sendingEmailAddr.value)) {
            elements.btnSend.classList.add("disable")
        }
    }
}, false);

elements.sendingEmailAddr.addEventListener("input", () => {
    if (varifyEmail(elements.sendingEmailAddr)) {
        elements.btnSend.classList.remove("disable")
    } else {
        elements.btnSend.classList.add("disable")
    }
}, false)

elements.boxFile.addEventListener("change", evt => handleFilesSelected(evt), false);
elements.downloadList.addEventListener("click", evt => uiFileControl(evt), false);
elements.fileList.addEventListener("click", evt => uiFileControl(evt), false);
elements.sendingCard.addEventListener("click", evt => sendingViewControl(evt), false);