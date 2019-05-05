let elements = {
    tab1: document.querySelector("a[href$='tab1']"),
    tab2: document.querySelector("a[href$='tab2']"),
    tabPane1: document.querySelector("#tab1"), // same div 👉 dropCard: document.querySelector(".drop-card"),
    tabPane2: document.querySelector("#tab2"),
    // dropCard: document.querySelector(".drop-card"),
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
}

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
    if(checkedEmail) {
        elements.emailInput.classList.add("has-success")
        elements.emailInput.classList.remove("has-danger");
    }
    const checkedPassword = checkPassword(elements.passwordInput.value);
    if(checkedPassword) {
        elements.passwordInput.classList.add("has-success")
        elements.passwordInput.classList.remove("has-danger");
    }
   
    if(type === "signup"){
        // const checkedPassword2 = checkPassword(elements.passwordInput2.value);
        // if(checkedPassword2) {
        //     elements.passwordInput2.classList.add("has-success")
        //     elements.passwordInput2.classList.remove("has-danger");
        // }
        // if(checkedEmail && checkedPassword && checkedPassword2 && elements.signUpCheck.checked){
        if(checkedEmail && checkedPassword && elements.signUpCheck.checked){
            // enable 
        }
    }
    if(type === "signin"){
        if(checkedEmail && checkedPassword){
        
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
        window.location.href = `${window.location.href}/signin`;
    }
    if (elements.signinCard.classList.contains("u-hidden") && !elements.signupCard.classList.contains("u-hidden")) {
        window.location.href = `${window.location.href}/signup`;
    }
    // add 
}
const closeLoginPage = evt => {
    if (evt.target.matches(".modal")) {
        elements.container.classList.remove("u-hidden");
        window.location.href = `${window.location.href.replace("/signin" || "/signup", "")}`;
    }
}

elements.switchSignup.addEventListener("click", switchInOrUp, false);
elements.switchSignin.addEventListener("click", switchInOrUp, false);
elements.navLoginBtn.addEventListener("click", openLoginPage, false);
elements.modal.addEventListener("click", closeLoginPage, false);


const renderTabView1 = () => {
    elements.tab1.classList.add("active");
    elements.tab1.classList.add("show");
    elements.tabPane1.classList.add("active");
    elements.tabPane1.classList.add("show");
    elements.tab2.classList.remove("active");
    elements.tab2.classList.remove("show");
    elements.tabPane2.classList.remove("active");
    elements.tabPane2.classList.remove("show");
}
const renderTabView2 = () => {
    elements.tab1.classList.remove("active");
    elements.tab1.classList.remove("show");
    elements.tabPane1.classList.remove("active");
    elements.tabPane1.classList.remove("show");
    elements.tab2.classList.add("active");
    elements.tab2.classList.add("show");
    elements.tabPane2.classList.add("active");
    elements.tabPane2.classList.add("show");
}

// (() => {
const addMultiListener = (element, events, func) => {
    events.split(" ").forEach(event => element.addEventListener(event, func, false));
}
const removeMultiListener = (element, events, func) => {
    events.split(" ").forEach(event => element.removeEventListener(event, func, false));
}

//================================================
//================== Login View ==================



//================================================
//=================== Drop View ==================

// let elements = {
//     dropCard: document.querySelector(".drop-card"),
//     downloadCard: document.querySelector(".download-card"),
// }

// 判斷瀏覽器是否支持拖拉上傳
let isAdvancedUpload = function () {
    let div = document.createElement('div');
    return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div));
}();

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

const calculator = () => {
    // ?? Or setInterval check
    let completeCount = 0,
        totalCount = 0,
        totalSize = 0,
        completeSize = 0,
        fileCount = 0,
        marginLeft = 0;

    uploadQueue.forEach(file => {
        completeCount += file.sliceIndex;
        totalCount += file.sliceCount;
        totalSize += file.size;
    })

    totalProgress = (completeCount / totalCount).toFixed(2); // 0.??;
    completeSize = Math.round(totalProgress * totalSize);
    totalProgress *= 100; // ??
    marginLeft = Math.round(totalProgress * 0.85);
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
        marginLeft,
    };
}

const showTotalProgress = () => {
    const data = calculator();
    elements.totalProgressBar.style.width = `${data.totalProgress}%`;
    elements.progressNum.style.marginLeft = `${(data.totalProgress || 0 )* 0.85 || 10}px`;
    elements.progressNum.innerText = `${(data.totalProgress || 0 )}%`;
    elements.fileNums.innerText = `Total ${data.fileCount || 0} files`;
    elements.fileSize.innerText = `${formatFileSize(data.totalProgress * data.totalSize || 0) || "0B"}/${formatFileSize(data.totalSize) || "0B"}`;
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

// UI Control
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
        if (!elements.fileList.childElementCount) handleOutFileList();
        const res = await makeRequest({
            method: "DELETE",
            url: `/letter/${letter}/upload/${fid}`
        })
        console.log(res);
    } else if (evt.target.closest(".file")) {
        // if (type === "upload") {
        isSend = false;
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

const fileControl = evt => {
    const element = evt.target.closest(".file"); 
    const elementCover = evt.target.closest(".cover");
    const fid = element.dataset.fid;
    // console.log("fileControl", evt.target.closest(".file"), evt.target.matches(`.cover, .cover > *`))
    const type = element.dataset.type;
    const file = type === "upload" ?
        uploadQueue[uploadQueue.findIndex(file => file.fid === fid)] :
        downloadQueue[downloadQueue.findIndex(file => file.fid === fid)];
    const isStarted = type === "download" 
    ? downloadFiles.findIndex(file => file.fid === fid) !== -1
    : true;

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
        console.log("match!", file)
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





const renderDropView = files => {
    const markup = `
        <div class="card">
            <div class="placeholder"></div>
            <div class="card-header ">
                <div class="file-list"></div>
                <div class="box__dropzone ">
                    <input class="box__file" type="file" name="files[]" id="file"
                    data-multiple-caption="{count} files selected" multiple />
                    <button class="box__button" type="submit">Upload</button>
                </div>
                <label for="file">
                    <div class="add__icon"></div>
                    <div class="add__text">
                        <strong>Choose a file</strong>
                        <span class="box__dragndrop"> or drag it here</span>
                        .
                    </div>
                </label>
            </div>
    
            <div class="card-body">
                <ul class="nav nav-pills nav-pills-rose">
                    <li class="nav-item">
                        <a class="nav-link" href="#pill1" data-toggle="tab">Direct</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#pill2" data-toggle="tab">Link</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link active show" href="#pill3" data-toggle="tab">Email</a>
                    </li>
                </ul>
                <div class="tab-content">
                    <div class="tab-pane" id="pill1">
                        <!-- &nbsp; -->
                        <div class="space"></div>
                    </div>
                    <div class="tab-pane" id="pill2">
                        <!-- &nbsp; -->
                        <div class="space"></div>
                    </div>
                    <div class="tab-pane active show" id="pill3">
                        <div class="input-group">
                            <div class="input-group-prepend">
                                <span class="input-group-text">
                                    <i class="material-icons">mail</i>
                                </span>
                            </div>
                            <input type="email" value="" placeholder="Email to..." class="form-control">
                            </div>
                            <div class="input-group">
                            <div class="input-group-prepend">
                            <span class="input-group-text">
                                <i class="material-icons">label</i>
                            </span>
                            </div>
                            <input type="text" value="" placeholder="Subject..." class="form-control">
                        </div>
                        <div class="form-group label-floating bmd-form-group is-filled">
                            <label class="form-control-label bmd-label-floating" for="message"> Your message</label>
                            <textarea class="form-control" rows="4" id="message"></textarea>
                        </div>
                    </div>
                </div>
                <div class="btn btn-primary btn-block btn-send">Send<div class="ripple-container"></div>
            </div>

        </div>
    `;

    elements.tabPane1.innerHTML = "";
    elements.tabPane1.insertAdjacentHTML("afterbegin", markup);

    elements = {
        ...elements,
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
    }

    elements.boxFile.addEventListener("change", evt => handleFilesSelected(evt), false);
    elements.fileList.addEventListener("click", evt => uploadFileControl(evt), false);
    // elements.btnDownload.addEventListener("click", evt => downloadFiles(evt), false);
    elements.btnSend.addEventListener("click", evt => send(evt), false);

    if (isAdvancedUpload) {
        elements.cardHeader.classList.add("has-advanced-upload");
        addMultiListener(elements.pageHeader, "drag dragstart dragend dragover dragenter dragleave drop", evt => handleDefault(evt));
        addMultiListener(elements.pageHeader, "dragover dragenter", evt => handleDragInPageHeader(evt));
        addMultiListener(elements.pageHeader, "dragleave dragend drop", evt => handleDragoutPageHeader(evt));
        addMultiListener(elements.pageHeader, "drop", evt => handleFilesSelected(evt));
    }

    if (!files || !files.length) return;
    handleInFileList();
    renderFiles(files) // uploadQueue || state;
}

//================================================
//================= Sending View =================
let isCountdown = false;
let timerTime = 0;

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
    isCountdown = true
    time *= 60 * 1000;

    if (!time) {
        elements.countdown.innerText = `00:00`;
        isCountdown = false;
        timerTime = 0;
        clearInterval(interval);
        return;
        // return `00:00`;
    }
    const interval = () => {
        let min, sec;
        time -= 1000;
        [min, sec] = formatTime(time);
        if (elements.countdown)
            elements.countdown.innerText = `${min}:${sec}`;
        timerTime = time;
        return;
        // return `${min}:${sec}`;
    }
    setInterval(interval, 1000);
}

// ?? if Choose EMAIL disable btnBack but can cancel uploading 問題在於什麼時候寄email
const renderTotalProgress = data => {
    const markup = `
    <div class="display-progress">
        <div class="progress progress-custom">
            <div class="progress-num" style = "margin-left: ${ data.marginLeft || 10}px">${(data.totalProgress || 0 )}%</div>
            <div class="progress-bar progress-bar-striped progress-bar-animated total-progress-bar" role="progressbar"
                aria-valuenow="75" aria-valuemin="0%" aria-valuemax="100" style="width: ${(data.totalProgress || 0 )}%"></div>
        </div>
        <div class="text-box">
            <p class="file-nums">Total ${data.fileCount || 0} files</p>
            <p class="file-size">${formatFileSize(data.completeSize) || "0B"}/${formatFileSize(data.totalSize) || "0B"}</p>
        </div>
    </div>
    `;
    elements.display.insertAdjacentHTML("beforeend", markup);
    elements = {
        ...elements,
        progressNum: document.querySelector(".progress-num"),
        fileNums: document.querySelector(".file-nums"),
        fileSize: document.querySelector(".file-size"),
        totalProgressBar: document.querySelector(".total-progress-bar"),
    }
}

const genQRCode = letter => {
    let qrcode = new QRCode(document.querySelector(".display-code"), {
        text: ``,
        width: 100,
        height: 100,
        colorDark: "#ff2d55",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
    qrcode.makeCode(`http://localhost/letter/${letter}`);
}

const renderSendingWays = data => {
    // ?? download link && Qrcode
    elements.boxFile.removeEventListener("change", evt => handleFilesSelected(evt));
    elements.fileList.removeEventListener("click", evt => uploadFileControl(evt));
    // elements.btnDownload.removeEventListener("click", evt => downloadFiles(evt));
    elements.btnSend.removeEventListener("click", evt => send(evt));

    const direct = `
    <p class="countdown">Expire in 
        <span>
            ${(isCountdown && data.type === "DIRECT")
            ? formatTime(timerTime) 
            : countdown(10) || "10:00"}
        </span>
    </p>
    <div class="display">
        <div class="display-digit">
            <span>${letter[0]}</span>
            <span>${letter[1]}</span>
            <span>${letter[2]}</span>
            <span>${letter[3]}</span>
            <span>${letter[4]}</span>
            <span>${letter[5]}</span>
        </div> 
        <div class="display-code"></div>

        <!-- display progress -->

    </div>
            
    `;
    // ?? download link && Qrcode
    const link = `
    <div class="display">
        <div class="display-code"></div>
        <div class="display-link">
            <a href="http://localhost/#${letter}" target="_blank" class="link"> 
            <span><i class="material-icons">file_copy</i></span>
            https://drophere.io/download
            </a>
        </div>
        <!-- display progress -->
    </div>
    `;
    const email = `
    <div class="display">
        <div class="display-paperplane">
            <div class="loader">
                <i class="material-icons">send</i>
            </div>
            <i class="material-icons gift">card_giftcard</i>
        </div>
        <!-- display progress -->
    </div>
    `;

    let markup;
    switch (data.type) {
        case "EMAIL":
            markup = email;
            break;
        case "LINK":
            markup = link;
            break;
        case "DIRECT":
            markup = direct;
            break;
        default:
            throw new Error(`${data}`);
    }

    elements.sendingWays.insertAdjacentHTML("afterbegin", markup);
    elements = {
        ...elements,
        display: document.querySelector(".display"),
        countdown: document.querySelector(".countdown > span"),
    }

    if (document.querySelector(".display-code")) genQRCode();

    const progressData = calculator();
    renderTotalProgress(progressData);
}

const renderSendingView = data => {
    const markup = `
    <div class="card sending-card">
        <div class="card-body">
            <div class="text-box">
                <h3>
                    <span class="btn-back">
                        <i class="material-icons">arrow_back</i>
                    </span>
                    <span class="tim-note">Sending...</span>
                </h3>
                <h5 class="tim-note btn-cancel">Cancel</h5>
            </div>

            <div class="sending-ways"></div>

            <div class="btn btn-block btn-ok disable">O K !</div>
        </div>
    </div>
    `;

    elements.tabPane1.innerHTML = ""
    elements.tabPane1.insertAdjacentHTML("afterbegin", markup);

    elements = {
        ...elements,
        sendingCard: document.querySelector(".sending-card"),
        sendingWays: document.querySelector(".sending-ways"),
        btnBack: document.querySelector(".btn-back"),
        btnCancel: document.querySelector(".btn-cancel"),
        btnOk: document.querySelector(".btn-ok"),
    }
    renderSendingWays(data);
}

const backSendingControl = () => {
    // render dropZone with sending files;
    renderDropView(uploadQueue);

}

const enableBtnOk = () => {
    Array.from(btnOk.classList).findIndex(s => s === "disable") !== -1 ?
        elements.btnOk.classList.remove("disable") :
        null;
}

// btn-cancel || btn-ok 
const doneWithSending = () => {
    if (!isDone && uploadQueue.length) {
        // alert ?? 自己寫一個library；
        alert("Are you sure about canceling the sending?");
    }
    // 還我一個初始畫面 && 清空 uploadQueue // ?? 順序有差嗎？
    isCountdown = false;
    renderDropView();
    emptyUploadQueue();
    // renderDropView(uploadQueue) // uploadQueue.length should be 0
    return false;
}

const sendingViewControl = evt => {
    if (evt.target.matches(".btn-back, .btn-back *")) {
        // render dropZone with sending files;
        renderDropView(uploadQueue);
    } else if (evt.target.matches(".btn-cancel")) {
        doneWithSending(isDone);
    } else if (evt.target.matches(".btn-ok")) {
        if (!isDone) return;
        doneWithSending();
    }
}

renderDropView();
//================================================
//================ Download View =================
let isFetching = false;

elements = {
    ...elements,
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
elements.downloadList.addEventListener("click", fileControl, false)

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