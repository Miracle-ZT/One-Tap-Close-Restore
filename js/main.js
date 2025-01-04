// 绑定关闭按钮的点击事件
document.addEventListener("DOMContentLoaded", function () {
    const closeAllWindowsBtn = document.getElementById("closeAllWindowsBtn");
    // closeAllTabsBtn.addEventListener("click", function () {
    // chrome.tabs.query({}, function (tabs) {
    //     console.log('All open tabs:', tabs);
    // });

    // chrome.windows.getAll({ populate: false }, function (windows) {
    //     console.log('Number of windows:', windows.length);
    // });
    // });

    closeAllWindowsBtn.addEventListener("click", saveWindowsNum);
});

// 绑定打开按钮的点击事件
document.addEventListener("DOMContentLoaded", function () {
    const openHistoryWindowsBtn = document.getElementById("openHistoryWindowsBtn");
    openHistoryWindowsBtn.addEventListener("click", getWindowsNum);
});

// document.addEventListener("DOMContentLoaded", function () {
//     const setWindowsNumBtn = document.getElementById("setWindowsNum");
//     setWindowsNumBtn.addEventListener("click", saveWindowsNum);
// });

// document.addEventListener("DOMContentLoaded", function () {
//     const getWindowsNumBtn = document.getElementById("getWindowsNum");
//     getWindowsNumBtn.addEventListener("click", getWindowsNum);
// });

// 获取窗口数量并保存
function saveWindowsNum() {
    let windowsNum = 0;
    chrome.windows.getAll({ populate: false }, function (windowList) {
        console.log('Number of windowList:', windowList.length);
        windowsNum = windowList.length;
        console.log("windowsNum = " + windowsNum);
        chrome.storage.local.set({ windowsNum: windowsNum }, function () {
            console.log('windowsNum is saved => ', windowsNum);
        });

        closeAllWindows(windowList);
    });
}

// 关闭所有打开的窗口
function closeAllWindows(windowList) {
    // 循环每个windows
    for (let i = 0; i < windowList.length; i++) {
        const window = windowList[i];
        console.log("window", window);
        chrome.windows.remove(window.id, function () {
            console.log('Closed window with ID:', window.id);
        });
    }
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
    // 循环打开上次被关闭的窗口
    for (let i = 0; i < windowsNum; i++) {
        chrome.sessions.restore(null, function (session) {
            if (session) {
                console.log('Restored session:', session);
            } else {
                console.log('No recently closed session to restore.');
            }
        });
    }
}