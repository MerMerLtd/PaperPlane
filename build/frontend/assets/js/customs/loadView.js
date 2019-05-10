let elements = {
    tab1: document.querySelector("a[href$='tab1']"),
    tab2: document.querySelector("a[href$='tab2']"),
    tabPane1: document.querySelector("#tab1"), // same div 👉 dropCard: document.querySelector(".drop-card"),
    tabPane2: document.querySelector("#tab2"),
    dropCard: document.querySelector(".drop-card"),
    downloadCard: document.querySelector(".download-card"),
    signinCard: document.querySelector(".sign-in"),
    signupCard: document.querySelector(".sign-up"),
    switchSignin: document.querySelector(".switch-signin > span"),
    switchSignup: document.querySelector(".switch-signup > span"),
    navLoginBtn: document.querySelector("li[data-toggle='modal'] > .btn"),
    navbarToggle: document.querySelector(".navbar-toggler"),
    html: document.querySelector("html"),
    modal: document.querySelector(".modal"),
    container: document.querySelector(".page-header > .container"),
    emailInput: document.querySelector(".sign-in input[type=email]"),
    passwordInput: document.querySelector(".sign-in input[type=password]"),
    passwordInput2: document.querySelector(".sign-up input[name^=password2]"),
    signInCheck: document.querySelector(".sign-in input[type=checkbox]"),
    signUpCheck: document.querySelector(".sign-up input[type=checkbox]"),
    downloadCheck: document.querySelector(".download-card input[type=checkbox]"),
    agreeTerms: document.querySelector(".agree-terms"),
    pageHeader: document.querySelector(".page-header"),
    addIcon: document.querySelector(".add__icon"),
    addText: document.querySelector(".add__text"),
    dropndDrop: document.querySelector(".box__dragndrop"), //text
    placeholder: document.querySelector(".placeholder"),
    cardHeader: document.querySelector(".card-header"),
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
    btnRecieve: document.querySelector(".btn-recieve"),
    downloadList: document.querySelector(".download-card .file-list"),
    downloadBody: document.querySelector(".download-card > .card-body"),
    expDate: document.querySelector(".download-card .exp-date "),
    filesInfo: document.querySelector(".download-card .files-info "),

}

// 同一 element 監聽 && 不監聽多個event
const addMultiListener = (element, events, func) => {
    events.split(" ").forEach(event => element.addEventListener(event, func, false));
}

const removeMultiListener = (element, events, func) => {
    events.split(" ").forEach(event => element.removeEventListener(event, func, false));
}

//================================================
//=================== Drop View ==================

// 判斷瀏覽器是否支持拖拉上傳
let isAdvancedUpload = function () {
    let div = document.createElement('div');
    return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div));
}();

if (isAdvancedUpload) {
    elements.cardHeader.classList.add("has-advanced-upload");
    addMultiListener(elements.pageHeader, "drag dragstart dragend dragover dragenter dragleave drop", evt => handleDefault(evt));
    addMultiListener(elements.pageHeader, "dragover dragenter", evt => handleDragInPageHeader(evt));
    addMultiListener(elements.pageHeader, "dragleave dragend drop", evt => handleDragoutPageHeader(evt));
    addMultiListener(elements.pageHeader, "drop", evt => handleFilesSelected(evt));
}

//================================================
//=========== Upload || download Files ===========

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

const renderFile = file => {
    const markup = `
            <div class="file" data-fid="${file.fid}" data-type="upload">
                <div class="delete-button"></div>
                <div class="file-icon">
                    <div class="cover u-hidden">
                        <div class="cover__border"></div>
                        <div class="cover__continue">
                            <div class="cover__sector--before"></div>
                            <div class="cover__sector"></div>
                            <div class="cover__sector--after"></div>
                        </div>
                        <div class="cover__pause">
                            <div class="cover__pause--p1"></div>
                            <div class="cover__pause--p2"></div>
                        </div>  
                        <div class="cover__select">
                            <div class="cover__select--s1"></div>
                            <div class="cover__select--s2"></div>
                        </div>     
                    </div>
                </div>
                <div class="progress">
                    <div data-progressId="${file.fid}" class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100" style="width: ${(file.sliceIndex/file.sliceCount)*100}%"></div>
                </div>
                <div class="file-name">${file.name}</div>
                <div class="file-size">${formatFileSize(file.size)}</div>
            </div>  
    
            <!-- <p class="file-name">螢幕快照 2019-03-19 上午9.04.16.png</p> -->
            <!-- <p class="file-name">螢幕快照 ...04.16.png</p> -->
        `;
    elements.fileList.insertAdjacentHTML("beforeend", markup);
}

const renderFiles = files => {
    files.forEach(file => renderFile(file));
}

const showFileProgress = file => {
    const progress = (file.sliceIndex / file.sliceCount).toFixed(2) * 100;
    document.querySelector(`[data-progressid='${file.fid}']`).style.width = `${progress}%`;
    // ??之後我想要改這裡的樣式
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
    const isStarted = type === "download" ?
        downloadFiles.findIndex(file => file.fid === fid) !== -1 :
        true;

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

    if (evt.target.matches(`.cover, .cover > *`)) {
        console.log("match!", file);
        if (file.progress === 1 && file.isDownloaded) return;

        console.log(isStarted)
        if (!isStarted) {
            file.isSelected = !file.isSelected;
            elementCover.classList.remove("continue");
            elementCover.classList.add("select");
            elementCover.classList.remove("pause");
            if (file.isSelected) {
                elementCover.children.item(3).classList.add("selected")
            } else {
                elementCover.children.item(3).classList.remove("selected")
            }
        } else {
            console.log("isSelected", file)

            file.isPaused = !file.isPaused;
            if (file.isPaused) {
                elementCover.classList.remove("continue");
                elementCover.classList.remove("select");
                elementCover.classList.add("pause");
            } else {
                elementCover.classList.add("continue");
                elementCover.classList.remove("select");
                elementCover.classList.remove("pause");
                type === "upload" ? uploadShard(file) : downloadShard(file);
            }
        }
        return;
    }
}

elements.fileList.addEventListener("click", evt => uploadFileControl(evt), false);
// elements.fileList.addEventListener("click", evt => uiControlFile(evt), false);


//================================================
//================= Sending View =================

let intervalId;

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

const formatTime = time => {
    const min = Math.trunc(time / 1000 / 60).toString().length === 2 ?
        `${Math.trunc(time / 1000 / 60)}` :
        `0${Math.trunc(time / 1000 / 60)}`;
    const sec = ((time / 1000) % 60).toString().length === 2 ?
        `${(time / 1000) % 60}` :
        `0${(time / 1000) % 60}`;
    return [min, sec];
}

const calculator = () => {
    // ?? Or setInterval check
    let completeCount = 0,
        totalCount = 0,
        totalSize = 0,
        completeSize = 0,
        fileCount = 0,
        totalProgress = 0;
    // marginLeft = 0;

    if (!uploadQueue.length) return {
        totalProgress,
        totalSize,
        completeSize,
        fileCount,
        // marginLeft,
    }

    uploadQueue.forEach(file => {
        completeCount += file.sliceIndex;
        totalCount += file.sliceCount;
        totalSize += file.size;
    })

    totalProgress = (completeCount / totalCount).toFixed(2); // 0.??;
    completeSize = Math.round(totalProgress * totalSize);
    totalProgress *= 100; // ??
    // marginLeft = Math.round(totalProgress * 0.85);
    fileCount = uploadQueue.length;


    if (totalProgress === 100) {
        isDone = true;
        elements.btnOk.classList.remove("disable"); // ?? 不應該放這裡不過就先這樣吧
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
    const data = calculator();
    elements.totalProgressBar.style.width = `${data.totalProgress}%`;
    elements.progressNum.style.marginLeft = `${5 + data.totalProgress *.8}%`;
    elements.progressNum.innerText = `${(data.totalProgress || 0 )}%`;
    elements.fileNums.innerText = `Total ${data.fileCount || 0} files`;
    elements.fileSize.innerText = `${formatFileSize(data.completeSize || 0)}/${formatFileSize(data.totalSize)}`;
}


elements.sendingCard.addEventListener("click", evt => sendingViewControl(evt));



// const backSendingControl = () => {
//     // render dropZone with sending files;
//     renderDropView(uploadQueue);

// }

const enableBtnOk = () => {
    elements.btnOk.classList.remove("disable");
    // Array.from(btnOk.classList).findIndex(s => s === "disable") !== -1 ?
    //     elements.btnOk.classList.remove("disable") :
    //     null;
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

// renderDropView();
//================================================
//================ Download View =================
let isFetching = false;


elements.downloadList.addEventListener("click", uiControlFile, false)

const renderInputCard = () => {
    // console.log(letter); // ?? for testing
    if (window.location.hash.substr(1)) { // ??
        elements.downloadList.innerText = "";
        checkUrl();
        return;
    }
    elements.inputCard.classList.add("active");
    elements.downloadCard.classList.remove("active");
}
const renderDownloadCard = () => {
    elements.inputCard.classList.remove("active");
    elements.downloadCard.classList.add("active");
}
// const toggleInputOrDownloadCard = () => {
//     elements.inputCard.classList.toggle("active");
//     elements.downloadCard.classList.toggle("active");
// }

// let testEl;
const hiddenChildEls = parentEl => {
    // testEl = parentEl;
    Array.from(parentEl.children).forEach(el => el.classList.add("u-hidden"));
}

const unHiddenChildEls = parentEl => {
    Array.from(parentEl.children).forEach(el => el.classList.remove("u-hidden"));
}

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


const renderEmptyFile = () => {
    const markup = `
        <div style="text-align: center;">
            <p>
                <span class="arrow_back">&larr;</span>
                目前沒有檔案哦！
            </p>
            <div>
                <i class="material-icons refresh" style="color: #ff2d55">
                    refresh
                </i>
            </div>
        </div>
    `;
    elements.downloadList.insertAdjacentHTML("afterbegin", markup);
    document.querySelector(".arrow_back").addEventListener("click", () => {
        elements.downloadList.innerText = "";
        window.location.hash = "";
        renderInputCard();
    });
    document.querySelector(".refresh").addEventListener("click", () => {
        elements.downloadList.innerText = "";
        checkUrl();
    })
}

const renderDownloadFile = file => {
    // console.log(file);
    const markup = `
    <div class="file" data-fid="${file.fid}" data-type="download">
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
                <div class="cover__select selected">
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

    elements.downloadList.insertAdjacentHTML("beforeend", markup)
}

const disableBtn = btn => {
    if (btn.classList.contains("disable")) return;
    btn.classList.add("disable");
}
const enableBtn = btn => {
    if (!btn.classList.contains("disable")) return;
    btn.classList.remove("disable");
}


//================================================
//================== Login View ==================

elements.downloadCheck.addEventListener("change", evt => document.querySelectorAll(".cover__select").toggle("selected"), false)
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
    const checkedEmail = checkEmail(elements.emailInput.value);
    if (checkedEmail) {
        elements.emailInput.classList.add("has-success")
        elements.emailInput.classList.remove("has-danger");
    }
    const checkedPassword = checkPassword(elements.passwordInput.value);
    if (checkedPassword) {
        elements.passwordInput.classList.add("has-success")
        elements.passwordInput.classList.remove("has-danger");
    }

    if (type === "signup") {
        // const checkedPassword2 = checkPassword(elements.passwordInput2.value);
        // if(checkedPassword2) {
        //     elements.passwordInput2.classList.add("has-success")
        //     elements.passwordInput2.classList.remove("has-danger");
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
const switchInOrUp = () => {
    console.log("clicked!")
    elements.signinCard.classList.toggle("u-hidden");
    elements.signupCard.classList.toggle("u-hidden");
    if (!elements.signinCard.classList.contains("u-hidden") && elements.signupCard.classList.contains("u-hidden")) {
        elements = {
            ...elements,
            emailInput: document.querySelector(".sign-in input[type=email]"),
            passwordInput: document.querySelector(".sign-in input[type=password]"),
        }
        window.location.href = `${window.location.href.replace("signup", "signin")}`;
        elements.emailInput.addEventListener("change", () => inputValidation("signin"), false)
        elements.passwordInput.addEventListener("change", () => inputValidation("signin"), false)

    }
    if (!elements.signupCard.classList.contains("u-hidden") && elements.signinCard.classList.contains("u-hidden")) {
        elements = {
            ...elements,
            emailInput: document.querySelector(".sign-up input[type=email]"),
            passwordInput: document.querySelector(".sign-up input[name^=password]"),
        }
        window.location.href = `${window.location.href.replace("signin", "signup")}`;
        elements.emailInput.addEventListener("change", () => inputValidation("signup"), false)
        elements.passwordInput.addEventListener("change", () => inputValidation("signup"), false)

    }
}
const openLoginPage = evt => {
    // close Nav && change url
    elements.html.classList.remove("nav-open");
    elements.navbarToggle.classList.remove("toggled");
    elements.container.classList.add("u-hidden");
    if (!elements.signinCard.classList.contains("u-hidden") && elements.signupCard.classList.contains("u-hidden")) {
        window.location.hash = `${window.location.hash}/#signin`;
    }
    if (elements.signinCard.classList.contains("u-hidden") && !elements.signupCard.classList.contains("u-hidden")) {
        window.location.hash = `${window.location.hash}/#signup`;
    }
    // add 
}
const closeLoginPage = evt => {
    elements.container.classList.remove("u-hidden");
    // if (evt.target.matches(".modal")) {
    //     elements.container.classList.remove("u-hidden");
    //     window.location.href = window.location.href.replace("/#signin" || "/#signup", "");
    //     // window.location.href = `${window.location.href.replace("/signin" || "/signup", "")}`;
    // }
}

elements.switchSignup.addEventListener("click", switchInOrUp, false);
elements.switchSignin.addEventListener("click", switchInOrUp, false);
elements.navLoginBtn.addEventListener("click", openLoginPage, false);
elements.modal.addEventListener("click", closeLoginPage, false);


//================================================
//================ UI renderView =================

const renderSendingView = () => {
    console.log(isSend);
    if (!isSend) { // && !!uploadQueue.length
        countdown(10);
    }
    isSend = true;

    // 1. according to "#tab1 .active" to render differ sendingWays
    const type = document.querySelector("#tab1 .active").innerText || "LINK";
    // css
    switch (type) {
        case "EMAIL":
            elements.sendingCard.classList.add("email");
            elements.sendingCard.classList.remove("link");
            elements.sendingCard.classList.remove("direct");
            console.log(type)

            break;
        case "LINK":
            elements.sendingCard.classList.remove("email");
            elements.sendingCard.classList.add("link");
            elements.sendingCard.classList.remove("direct");
            console.log(type)

            break;
        case "DIRECT":
            elements.sendingCard.classList.remove("email");
            elements.sendingCard.classList.remove("link");
            elements.sendingCard.classList.add("direct");
            console.log(type)

            break;
        default:
            throw new Error(`${type}`);
    }
    // 2. hidden drop-card
    elements.dropCard.classList.add("u-hidden");
    // 3. show sending-card
    elements.sendingCard.classList.remove("u-hidden");
}

elements.btnSend.addEventListener("click", renderSendingView, false);

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