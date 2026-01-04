// =================================================
// background.js - 擴充功能的後台大腦
// 負責處理：安裝初始化、接收 Popup 指令、切換攔截規則
// =================================================

// 1. 監聽「安裝/更新」事件
// 當使用者第一次安裝這個插件時，會執行這裡
chrome.runtime.onInstalled.addListener(() => {
    // 預設將功能設定為 "true" (開啟狀態)
    chrome.storage.local.set({ enabled: true }, () => {
        console.log("AdShield 已安裝，預設為開啟狀態。");
    });
});

// 2. 監聽來自 Popup (介面) 的訊息
// 當使用者在 popup.js 裡面按下開關時，會傳送訊息過來
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    
    // 檢查訊息的動作是否為 "toggleBlocking" (切換阻擋)
    if (request.action === "toggleBlocking") {
        
        const isEnabled = request.enabled; // 取得使用者是想開 (true) 還是關 (false)
        console.log(`接收到指令：將阻擋功能設為 ${isEnabled}`);

        if (isEnabled) {
            // === 如果要開啟 ===
            
            // 呼叫 Chrome API：啟用規則集
            // "ruleset_1" 對應到 manifest.json 裡面的 id
            chrome.declarativeNetRequest.updateEnabledRulesets({
                enableRulesetIds: ["ruleset_1"] 
            }, () => {
                console.log("規則已啟用：廣告將被攔截");
                updateBadge("ON"); // 更新圖示上的小文字
            });

        } else {
            // === 如果要關閉 ===
            
            // 呼叫 Chrome API：停用規則集
            chrome.declarativeNetRequest.updateEnabledRulesets({
                disableRulesetIds: ["ruleset_1"]
            }, () => {
                console.log("規則已停用：廣告將被放行");
                updateBadge("OFF"); // 更新圖示上的小文字
            });
        }
    }
});

// 3. 輔助函式：更新擴充功能圖示上的文字 (Badge)
// 讓使用者不點開選單也能看到現在是 ON 還是 OFF
function updateBadge(text) {
    chrome.action.setBadgeText({ text: text });
    
    // 設定文字顏色 (ON 用綠色，OFF 用灰色)
    const color = text === "ON" ? "#4CAF50" : "#9E9E9E";
    chrome.action.setBadgeBackgroundColor({ color: color });
}
