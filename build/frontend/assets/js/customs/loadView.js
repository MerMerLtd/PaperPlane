// (() => {
const addMultiListener = (element, events, func) => {
    events.split(" ").forEach(event => element.addEventListener(event, func, false));
}
const removeMultiListener = (element, events, func) => {
    events.split(" ").forEach(event => element.removeEventListener(event, func, false));
}

//================================================
//================== Login View ==================

const renderLoginView = () => {
    const markup = `
    <div class="container">
      <div class="row">
        <div class="col-lg-4 col-md-6 col-sm-8 ml-auto mr-auto">
          <form class="form" method="" action="">
            <div class="card card-login card-hidden">
              <div class="card-header card-header-primary text-center">
                <h4 class="card-title">Login</h4>
                <div class="social-line">
                  <a href="#pablo" class="btn btn-just-icon btn-link btn-white">
                    <i class="fa fa-facebook-square"></i>
                  <div class="ripple-container"></div></a>
                  <a href="#pablo" class="btn btn-just-icon btn-link btn-white">
                    <i class="fa fa-twitter"></i>
                  <div class="ripple-container"></div></a>
                  <a href="#pablo" class="btn btn-just-icon btn-link btn-white">
                    <i class="fa fa-google-plus"></i>
                  <div class="ripple-container"></div></a>
                </div>
              </div>
              <div class="card-body ">
                <p class="card-description text-center">Or Be Classical</p>
                <span class="bmd-form-group">
                  <div class="input-group">
                    <div class="input-group-prepend">
                      <span class="input-group-text">
                        <i class="material-icons">face</i>
                      </span>
                    </div>
                    <input type="text" class="form-control" placeholder="First Name...">
                  </div>
                </span>
                <span class="bmd-form-group">
                  <div class="input-group">
                    <div class="input-group-prepend">
                      <span class="input-group-text">
                        <i class="material-icons">email</i>
                      </span>
                    </div>
                    <input type="email" class="form-control" placeholder="Email...">
                  </div>
                </span>
                <span class="bmd-form-group">
                  <div class="input-group">
                    <div class="input-group-prepend">
                      <span class="input-group-text">
                        <i class="material-icons">lock_outline</i>
                      </span>
                    </div>
                    <input type="password" class="form-control" placeholder="Password...">
                  </div>
                </span>
              </div>
              <div class="card-footer justify-content-center">
                <a href="#pablo" class="btn btn-rose btn-link btn-lg">Lets Go<div class="ripple-container"></div></a>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
    `;

    //?? 還沒完成
}

//================================================
//=================== Drop View ==================

let elements = {
    dropCard: document.querySelector(".drop-card"),
    downloadCard: document.querySelector(".download-card"),
}

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
            <div class="file" data-fid="${file.fid}">
                <div class="delete-button"></div>
                <div class="file-icon"></div>
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
const uploadFileControl = evt => {
    const element = evt.target.closest(".file");
    const fid = element.dataset.fid; // UI onClickedFid
    const index = uploadQueue.findIndex(file => file.fid === fid);
    const file = uploadQueue[index];

    if (evt.target.matches(".delete-button, .delete-button *")) {
        isSend = false;
        element.parentElement.removeChild(element);
        uploadQueue.splice(index, 1);
        if (!elements.fileList.childElementCount) handleOutFileList();

    } else if (evt.target.closest(".file")) {
        isSend = false;
        if (file.sliceIndex === file.sliceCount) return;
        file.isPaused = !file.isPaused;
        console.log("uploadFileControl/ isPaused: ", file.fid, file.isPaused);
        if (!file.isPaused) {
            uploadShard(file);
        }
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

    elements.dropCard.innerHTML = "";
    elements.dropCard.insertAdjacentHTML("afterbegin", markup);

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
        if( elements.countdown)
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
        colorDark : "#ff2d55",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.H
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
            <a href="http://localhost/letter/${letter}" class="link"> 
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

    if(document.querySelector(".display-code")) genQRCode();

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

    elements.dropCard.innerHTML = ""
    elements.dropCard.insertAdjacentHTML("afterbegin", markup);

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

//================================================
//================ Download View =================
let isFetching = false;

elements = {
    ...elements,
    btnDownload: document.querySelector(".btn-download"),
    inputKey: document.querySelector(".input-key"),
    downloadBody: document.querySelector(".download-card > .card-body"),
    downloadCard: document.querySelector(".download-card "),
}

let testEl;

const hiddenEls = parentEl => {
    parentEl.children[0].style.display = "none";
}

const renderLoader = parentEl => {
    console.log(parentEl)
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
    //     console.log(parentEl)
    //     testEl = parentEl;
    hiddenEls(parentEl);
    parentEl.insertAdjacentHTML("afterbegin", markup);
}

// // https://davidwalsh.name/add-rules-stylesheets
// const addCSSRule = (sheet, selector, rules, index = 0) => {
// 	if("insertRule" in sheet) {

// 		sheet.insertRule(`${selector}{ ${rules} }`, index);
// 	}
// 	else if("addRule" in sheet) {
// 		sheet.addRule(selector, rules, index);
// 	}
// }

// deg: 0 ~ 360;
// progress: 0 ~ 1;
const renderProgress = progress => { //?
    let deg = progress*360;
    
    if(deg >= 180){
        elements.sectorAfter.style.zIndex = 1;
        elements.sectorBefore.style.transform = `rotate(90deg)`;
        elements.sectorAfter.style.transform = `rotate(${deg + 90}deg)`;
    }else{
        elements.sectorBefore.style.transform = `rotate(${deg - 90}deg)`;
        elements.sectorAfter.style.transform = `rotate(${deg + 90}deg)`;
    }
    // elements.sectorBefore.style.transform = `rotate(${deg-90}deg)`;

    // if(deg >= 180){
    //     elements.sectorAfter.style.opacity = 1;
    //     elements.sector.style.overflow = "visible";
    // }

    if(deg === 360){
        elements.cover.parentNode.removeChild(elements.cover);
        return;
    }
    return;
}
const toggleProgressIcon = target => { // ?
  
    elements.coverContinue.classList.toggle("u-hidden");
    elements.coverPause.classList.toggle("u-hidden");
}

const renderDownloadFile = file => {
    const markup = `
    <div class="file" data-fid="${file.fid}">
        <div class="file-icon">

        <div class="cover">
            <div class="cover__border"></div>
            <div class="cover__continue ">
                <div class="cover__sector--before"></div>
                <div class="cover__sector">
                    <!-- <div class="cover__sector--before"></div>
                    <div class="cover__sector--after"></div> -->
                </div>
                <div class="cover__sector--after"></div>
            </div>
            <div class="cover__pause u-hidden">
                <div class="cover__pause--p1"></div>
                <div class="cover__pause--p2"></div>
            </div>  
        </div>  
        
        </div>
    
        <div class="file-name">${file.name}</div>
        <div class="file-size">${formatFileSize(file.size)}</div>
    </div>

    <!-- <p class="file-name">螢幕快照 2019-03-19 上午9.04.16.png</p> -->
    <!-- <p class="file-name">螢幕快照 ...04.16.png</p> -->
    `;

    elements = {...elements,
        cover: document.querySelector(".cover"),
        coverContinue: document.querySelector(".cover__continue"),
        coverPause: document.querySelector(".cover__pause"),
        sector: document.querySelector(".cover__sector"),
        sectorBefore: document.querySelector(".cover__sector--before"),
        sectorAfter: document.querySelector(".cover__sector--after"),
    }
}

const cleanCard = el => {
    el.innerHTML = "";
    // parentEl.removeChild();
}

const disableBtn = (btnEl, event, func) => {
    btnEl.removeEventListener(event, func);
    btnEl.classList.add("disable");
}

const validity = () => {
    // ?? later
}

const renderDownloadZone = async evt => {
    console.log("renderDownloadZone");
    // 1. if elements.inputKey.value is numbers (check by RegExp)
    // 1.1 check elements.inputKey.value.length !== 6 return; 顯示input key is invalid
    // 2.1 use elements.inputKey.value 跟backend要資料
    // 2.2 replace input to loader 
    // 2.1.1 resolve => clean loader & renderfiles
    // 2.1.2 reject => 顯示input key is invalid
    // 2. else // are string (之後再做)
    // 2.1 open as our download key;
    let err, files;

    // const value = elements.inputKey.value;
    // if(value.length !== 6) return;

    // const regExp = new RegExp(/^\d+$/);
    // if(!regExp.test(value)) return;

    renderLoader(elements.downloadBody);
    renderLoader(elements.downloadBody);

    isFetching = true;
    disableBtn(elements.btnDownload, "click", renderDownloadZone);

    // [err, files] = await to(makeRequest({
    //     method: "POST",
    //     // url: "/test/upload",
    //     url: "",
    //     payload: "",
    // }));

    // if(err || !files){
    //     console.log(err);
    //     return;
    // }

    cleanCard(elements.downloadCard);



    const markup = `
    <div class="text-box">
        <h3 class="tim-note">Files</h3>
        <h3 class="tim-note exp-date">Exp. Apr 15 03:32 AM</h3>
    </div>
    <div class="card-header ">
        <div class="file-list">
        <!-- files -->
        </div>
    </div>
    <div class="card-body">
        <div class="text-box">
        <div class="togglebutton">
            <label>
            <input type="checkbox" checked="">
            <span class="toggle"></span>
            Select all
            </label>
        </div>
        <p class="tim-note small-text">Total 1 files &middot; 34.45MB</p>
        </div>
        <div class="btn btn-primary btn-block btn-recieve">Recieve</div>
    </div>
    `;

    elements.downloadCard.insertAdjacentHTML("afterbegin", markup);


}

if (!isFetching) elements.btnDownload.addEventListener("click", renderDownloadZone);

renderDropView();

// })()