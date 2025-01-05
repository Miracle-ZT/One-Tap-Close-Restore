document.addEventListener("DOMContentLoaded", function () {
    // 绑定关闭按钮的点击事件
    bindButtonClick("closeAllWindowsBtn", saveWindowsNum);
    // 绑定打开按钮的点击事件
    bindButtonClick("openHistoryWindowsBtn", getWindowsNum);
});

// 按钮绑定点击事件
function bindButtonClick(buttonId, callback) {
    const button = document.getElementById(buttonId);
    if (button) {
        button.addEventListener("click", callback);
    } else {
        console.warn(`Button with ID ${buttonId} not found.`);
    }
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
        if (restoredCount >= windowsNum) {
            console.log('All requested windows restored.');
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
            }
        });
    }

    restoreNextSession();
}