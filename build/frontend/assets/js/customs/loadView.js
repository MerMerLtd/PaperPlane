let elements = {
    tab1: document.querySelector("a[href$='tab1']"),
    tab2: document.querySelector("a[href$='tab2']"),
    tabPane1: document.querySelector("#tab1"), // same div 👉 dropCard: document.querySelector(".drop-card"),
    tabPane2: document.querySelector("#tab2"),
    // dropCard: document.querySelector(".drop-card"),
    downloadCard: document.querySelector(".download-card"),
}

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
    btnRecieve:document.querySelector(".btn-recieve"),
    downloadList: document.querySelector(".download-card .file-list"),
    downloadBody: document.querySelector(".download-card > .card-body"),
    expDate: document.querySelector(".download-card .exp-date "),
    filesInfo: document.querySelector(".download-card .files-info "),
}

const renderInputCard = () => {
    console.log(letter); // ?? for testing
    if(window.location.hash){ // ??
        renderDownloadCard();
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
    elements = {...elements,
        loader: document.querySelector(".lds-spinner"),
    }
}

const removeLoader = parentEl => {
    elements.loader.remove();
    unHiddenChildEls(parentEl);
}

const checkValidity = inputKey => {
    // 1. if elements.inputKey.value is numbers || 1.2.1 if elements.inputKey.value is string (can be link)
    elements.inputKey.value = "";

    const regExp = new RegExp(/^\d+$/);

    if(!regExp.test(inputKey)){
        // 如果不是數字
        // case1: 作為網址打開 www.drophere.io/#123456
        // case2: 直接返回
        // return false;
    };
    if(!regExp.test(inputKey) || inputKey.length !== 6){
        elements.inputCard.classList.add("shake");
        setTimeout(() => elements.inputCard.classList.remove("shake"), 1000);
        return false;
    };

    renderDownloadZone(parseInt(inputKey));
    return false;
    // return parseInt(inputKey);
}

const fetchAvailableFid = async letter => {
    let err, res;

    [err, res] = await to(makeRequest({
        method: "GET",
        url: `/letter/${letter}/`, // 絕對正確的 url: `/letter/${letter}/`
    }));

    if(err || parseInt(res.lid) !== letter){
        //1.1.3 if letter is invalid, 要重新顯示input 👈 不是寫在這裡
        console.log(err || letter);
        // renderInputCard();
        return false;
    }

    if(res){
        return res.files;
    }
}

const renderDownloadFile = file => {
    console.log(file);
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
    
        <div class="file-name">${file.fileName}</div>
        <div class="file-size">${formatFileSize(file.size)}</div>
    </div>

    <!-- <p class="file-name">螢幕快照 2019-03-19 上午9.04.16.png</p> -->
    <!-- <p class="file-name">螢幕快照 ...04.16.png</p> -->
    `;

    elements.downloadList.insertAdjacentHTML("beforeend", markup)
}

const renderDownloadFiles = async availibleFiles => {
    if(!availibleFiles.length){
        // ?? test
        elements.downloadList.insertAdjacentHTML("afterbegin", `
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
        `);
        document.querySelector(".arrow_back").addEventListener("click", () => {
            elements.downloadList.innerText = "";
            window.location.hash = ""; 
            renderInputCard();
        });
        document.querySelector(".refresh").addEventListener("click", () => {
            elements.downloadList.innerText = "";
            checkUrl();
        })
        // or setInterval to fetch
        // setTimeout(() => {
        //         window.location.href = window.location.origin; // trim hash
        //         renderInputCard();
        //     }, 3000);
    }else{
        Promise.all(availibleFiles.map(async file => {
            const opts = {
                method: "GET",
                //  url: `/letter/${inputKey}/`
                url: `/letter/${letter}/upload/${file}`,
            }
            try{
                return res = await makeRequest(opts);
            }catch(err){
                return Promise.resolve({ errorMessage: "API BAD GATEWAY", error, file });
            }
        }))
        .then(resultArray => {
    
            resultArray.forEach(result => renderDownloadFile(result));
        })
    }
}


const renderDownloadZone = async letter => {

    renderDownloadCard();
    // 2.2 render loader 
    renderLoader(elements.downloadCard);
  
    // 2.3 fetch data 👉 use elements.inputKey.value 跟backend要資料
    const filesId = await fetchAvailableFid(letter);

    // 2.3.1 如果沒有要到，重新輸入inputKey
    if(!filesId){
        // ?? render custom alert downloadKey || inputKey is invalid
        removeLoader(elements.downloadCard);
        window.location.hash = ""; //// window.location = window.location.origin;
        renderInputCard();
        return false;
    };

    console.log("renderDownloadFiles", filesId);

    // 2.3.2 如果有要到，cleanLoader 
    removeLoader(elements.downloadCard);
    // 3 renderDownloadFiles
    window.location.hash = letter;

    renderDownloadFiles(filesId);
}

elements.btnDownload.addEventListener("click", () => checkValidity(elements.inputKey.value), false);


elements.tab2.addEventListener("click",renderInputCard , false); // 要判斷url 決定render inputCard or downloadCard


// })()




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

// // https://davidwalsh.name/add-rules-stylesheets
// const addCSSRule = (sheet, selector, rules, index = 0) => {
// 	if("insertRule" in sheet) {

// 		sheet.insertRule(`${selector}{ ${rules} }`, index);
// 	}
// 	else if("addRule" in sheet) {
// 		sheet.addRule(selector, rules, index);
// 	}
// }
