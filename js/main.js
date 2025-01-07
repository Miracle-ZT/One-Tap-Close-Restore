// 全局按钮
let closeAllWindowsBtn = null;
let restoreWindowsBtn = null;

function getElementById(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.error(`Element with ID "${id}" not found.`);
        return;
    }
    return element;
}

document.addEventListener("DOMContentLoaded", function () {
    closeAllWindowsBtn = getElementById("closeAllWindowsBtn");
    restoreWindowsBtn = getElementById("restoreWindowsBtn");

    // 绑定关闭按钮的点击事件
    bindButtonClick(closeAllWindowsBtn, saveWindowsNum);
    // 绑定恢复按钮的点击事件
    bindButtonClick(restoreWindowsBtn, getWindowsNum);

    updateCloseBtnState();
    updateRestoreBtnState();

    // 监听窗口打开事件
    chrome.windows.onCreated.addListener(updateCloseBtnState);

    // 监听窗口关闭事件
    chrome.windows.onRemoved.addListener(updateCloseBtnState);
});

// 按钮绑定点击事件
function bindButtonClick(button, callback) {
    if (!button || typeof callback !== 'function') {
        console.warn('Invalid button or callback.');
        return;
    }
    // 确保不会重复绑定
    button.removeEventListener('click', callback);
    button.addEventListener('click', callback);
}

// 获取窗口数量并保存
function saveWindowsNum() {
    let windowsNum = 0;
    chrome.windows.getAll({ populate: false }, function (windowList) {
        if (chrome.runtime.lastError) {
            console.error('Error getting windows:', chrome.runtime.lastError);
            return;
        }
        console.log('Number of windowList:', windowList.length);
        windowsNum = windowList.length;
        console.log("windowsNum = " + windowsNum);
        chrome.storage.local.set({ windowsNum: windowsNum }, function () {
            if (chrome.runtime.lastError) {
                console.error('Error saving windowsNum:', chrome.runtime.lastError);
                return;
            }
            console.log('windowsNum is saved => ', windowsNum);
        });

        closeAllWindows(windowList);
    });
}

// 关闭所有打开的窗口
function closeAllWindows(windowList) {
    // 循环每个windows
    windowList.map((window) => {
        console.log("window", window);
        chrome.windows.remove(window.id, function () {
            console.log('Closed window with ID:', window.id);
        });
    })
}

// 获取保存的窗口数
function getWindowsNum() {
    chrome.storage.local.get('windowsNum', function (result) {
        console.log('Loaded windowsNum:', result.windowsNum);
        openHistoryWindows(result.windowsNum);
    });
}

// 打开固定数量的历史窗口(ctrl + shift + t)
function openHistoryWindows(windowsNum) {
    let restoredCount = 0;

    // 递归恢复窗口会逐个恢复，相较循环直接调用异步的用时可能较长，因需等待上一个窗口恢复完成
    function restoreNextSession() {
        if (restoredCount >= windowsNum || windowsNum <= 0) {
            console.log('All requested windows restored.');
            removeWindowsNum();
            return;
        }

        chrome.sessions.restore(null, function (session) {
            if (chrome.runtime.lastError) {
                console.error('Error restoring session:', chrome.runtime.lastError);
            } else if (session) {
                console.log('Restored session:', session);
                restoredCount++;
                restoreNextSession(); // 继续恢复下一个会话
            } else {
                console.log('No recently closed session to restore.');
                removeWindowsNum();
            }
        });
    }

    restoreNextSession();
}

// 清除缓存的windowsNum
function removeWindowsNum() {
    chrome.storage.local.remove('windowsNum', function () {
        console.log('windowsNum has been removed from storage.');
        updateRestoreBtnState();
    });
}

// 更新关闭按钮的文本
function updateCloseBtnState() {
    chrome.windows.getAll({ populate: false }, (windowList) => {
        closeAllWindowsBtn.textContent = `关闭 (${windowList.length})`;
    });
}

// 更新恢复按钮的文本与状态
function updateRestoreBtnState() {
    chrome.storage.local.get('windowsNum', function (result) {
        const savedWindowsNum = result.windowsNum || 0;

        // 当 windowsNum 为 undefined 或 0 时，禁用 "恢复" 按钮
        restoreWindowsBtn.disabled = savedWindowsNum === 0;
        restoreWindowsBtn.textContent = `恢复 (${savedWindowsNum})`;

        console.log("restoreWindowsBtn.disabled = ", restoreWindowsBtn.disabled);
    });
}