import { elements } from "../base";

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

export const renderFiles = files => {
    files.forEach(file => renderFile(file));
}



// 檔案進到畫面的但沒有到file-container提示 || 移出
const hintLocation = () => {
    const markup = `
        <div class="hint">Drag it here</div>
    `;
}




