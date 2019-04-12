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
    dropOrdownload: document.querySelector(".dropOrdownload"),
}

// 判斷瀏覽器是否支持拖拉上傳
let isAdvancedUpload = function() {
    let div = document.createElement('div');
    return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div));
}();
    
const formatFileSize = size => {
    let formatted, power;

    if(typeof size !== "number") return false;
    const unit = ["byte", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

    const check = (size, power = 0) => {
        if(Math.ceil(size).toString().length > 3){
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
        completeCount += file.sliceIndex ;
        totalCount += file.sliceCount;
        totalSize += file.size;
    })

    totalProgress = (completeCount/totalCount).toFixed(2);  // 0.??;
    completeSize = Math.round(totalProgress * totalSize);
    totalProgress *= 100; // ??
    marginLeft = Math.round(totalProgress * 0.85);
    fileCount = uploadQueue.length;


    if(totalProgress === 100){
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
    const progress = (file.sliceIndex/file.sliceCount).toFixed(2)*100;
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

    if(evt.target.matches(".delete-button, .delete-button *")){
        isSend = false;
        element.parentElement.removeChild(element);
        uploadQueue.splice(index, 1);
        if(!elements.fileList.childElementCount) handleOutFileList();

    }else if(evt.target.closest(".file")){
        isSend = false;
        if(file.sliceIndex === file.sliceCount) return;
        file.isPaused = !file.isPaused; 
        console.log("uploadFileControl/ isPaused: ", file.fid, file.isPaused);
        if(!file.isPaused){
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
    elements.dropOrdownload.innerHTML = "";
    elements.dropOrdownload.insertAdjacentHTML("afterbegin", markup);

    elements = {...elements,
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

    elements.boxFile.addEventListener("change",  evt => handleFilesSelected(evt), false);  
    elements.fileList.addEventListener("click", evt => uploadFileControl(evt), false);
    // elements.btnDownload.addEventListener("click", evt => downloadFiles(evt), false);
    elements.btnSend.addEventListener("click", evt => send(evt), false);

    if(isAdvancedUpload){
        elements.cardHeader.classList.add("has-advanced-upload");
        addMultiListener(elements.pageHeader, "drag dragstart dragend dragover dragenter dragleave drop", evt => handleDefault(evt));
        addMultiListener(elements.pageHeader, "dragover dragenter", evt => handleDragInPageHeader(evt));
        addMultiListener(elements.pageHeader, "dragleave dragend drop",  evt => handleDragoutPageHeader(evt));
        addMultiListener(elements.pageHeader, "drop",  evt => handleFilesSelected(evt));
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
    const min = Math.trunc(time / 1000 / 60).toString().length === 2 
                ? `${Math.trunc(time / 1000 / 60)}`
                : `0${Math.trunc(time / 1000 / 60)}`;
    const sec = ((time / 1000) % 60).toString().length === 2 
                ? `${(time / 1000) % 60}`
                : `0${(time / 1000) % 60}`;
    return [min, sec];
}

const countdown = time => {
    isCountdown = true
    time *= 60*1000;

    if(!time){
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
    elements = {...elements,
        progressNum: document.querySelector(".progress-num"),
        fileNums: document.querySelector(".file-nums"),
        fileSize: document.querySelector(".file-size"),
        totalProgressBar: document.querySelector(".total-progress-bar"),
    }
}

const renderSendingWays = data => {
    // ?? download link && Qrcode
    elements.boxFile.removeEventListener("change",  evt => handleFilesSelected(evt));  
    elements.fileList.removeEventListener("click", evt => uploadFileControl(evt));
    // elements.btnDownload.removeEventListener("click", evt => downloadFiles(evt));
    elements.btnSend.removeEventListener("click", evt => send(evt));
    
    const direct = `
    <p class="countdown">Expire in <span>${isCountdown? formatTime(timerTime) : countdown(10) || "10:00"}</span></p>
    <div class="display">
        <div class="display-digit">
            <span>1</span>
            <span>3</span>
            <span>3</span>
            <span>4</span>
            <span>7</span>
            <span>2</span>
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
            <a href="https://drophere.io${/*data*/null}" class="link"> 
            <span><i class="material-icons">file_copy</i></span>
            https://drophere.io
            </a>
        </div>
        <!-- display progress -->
    </div>
    `;
    const email =`
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
    switch (data.type){
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
    elements = {...elements, 
        display: document.querySelector(".display"),
        countdown: document.querySelector(".countdown > span"),
    }

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
    
    elements.dropOrdownload.innerHTML = ""
    elements.dropOrdownload.insertAdjacentHTML("afterbegin", markup);

    elements = {...elements, 
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
    Array.from(btnOk.classList).findIndex(s => s === "disable") !== -1 
    ? elements.btnOk.classList.remove("disable")
    : null;   
}

// btn-cancel || btn-ok 
const doneWithSending = () => {
    if(!isDone && uploadQueue.length){
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
    if(evt.target.matches(".btn-back, .btn-back *")){
        // render dropZone with sending files;
        renderDropView(uploadQueue);
    }else if(evt.target.matches(".btn-cancel")){
        doneWithSending(isDone);
    }else if(evt.target.matches(".btn-ok")){
        if(!isDone) return;
        doneWithSending();
    }
}



//================================================
//================ Download View =================

const renderDownloadZone = files => {
    const markup = `
        <div class="card">
            <div class="card-body">
                ${"download"}
            </div>
        </div>
        `;
}


renderDropView();

// })()

