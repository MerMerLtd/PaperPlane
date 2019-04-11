// (() => {
const skeleton = {
    dropOrdownload: document.querySelector(".dropOrdownload"),
}

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
}

const renderFile = file => {
    const markup = `
            <div class="file" data-fid="${file.fid}">
                <div class="delete-button"></div>
                <div class="file-icon"></div>
                <div class="progress">
                    <div data-progressId="${file.fid}" class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100" style="width: 0%"></div>
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

const renderDropZone = files => {
    const markup = `
        <div class="card">
        <div class="placeholder"></div>
        <div class="card-header ">
          <!-- <div class="hint u-invisible">Drag it here</div> -->
          <div class="file-list"></div>
    
          <!-- 使用表单输入进行选择 -->
          <div class="box__dropzone ">
            <input class="box__file" type="file" name="files[]" id="file"
              data-multiple-caption="{count} files selected" multiple />
            <button class="box__button" type="submit">Upload</button>
          </div>
    
          <label for="file">
            <div class="add__icon"></div>
            <div class="add__text"><strong>Choose a file</strong><span class="box__dragndrop"> or drag it
                here</span>.</div>
          </label>
    
        </div>
    
        <div class="card-body">
          <!-- <div class="col-md-8"> -->
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
              <!-- Nothings -->
              <div class="space"></div>
            </div>
            <div class="tab-pane" id="pill2">
              <!-- Nothings -->
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
          <!-- </div> -->
        </div>
      </div>
      `;

    skeleton.dropOrdownload.insertAdjacentHTML("afterbegin", markup);
    if (!files || !files.length) return;
    renderFiles(files) // uploadQueue || state;
}
const renderSendingPage = type => {
    const markup = `
        <div class="card-body">
        
        </div>
        `;
    elements.dropCard.innerHTML = "";
    elements.dropCard.insertAdjacentHTML("afterbegin", markup);
}
const renderDownloadZone = files => {
    const markup = `
        <div class="card">
            <div class="card-body">
                ${"download"}
            </div>
        </div>
        `;
}


// renderDropZone();
// })()