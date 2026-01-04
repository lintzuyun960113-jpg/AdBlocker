// 等待 HTML 載入完成才執行
document.addEventListener('DOMContentLoaded', () => {
  
  // 1. 抓取 HTML 裡的元素
  const toggleBtn = document.getElementById('toggle-btn');
  const statusText = document.getElementById('status-text');

  // 2. 初始化：一打開視窗，先去 storage 查上次是開還是關
  chrome.storage.local.get(['enabled'], (result) => {
    // 如果 storage 裡沒有紀錄，預設就是 true (開啟)
    const isEnabled = result.enabled !== false; 
    
    // 根據狀態設定按鈕跟文字
    updateUI(isEnabled);
  });

  // 3. 監聽：當使用者點擊開關時
  toggleBtn.addEventListener('change', () => {
    const isEnabled = toggleBtn.checked;

    // A. 儲存新的狀態到 storage
    chrome.storage.local.set({ enabled: isEnabled });

    // B. 更新介面文字
    updateUI(isEnabled);

    // C. 發送訊息給 background.js (通知總配電箱)
    // 注意：這裡的 action 名稱要跟 background.js 裡的一模一樣
    chrome.runtime.sendMessage({ 
      action: "toggleBlocking", 
      enabled: isEnabled 
    });
  });

  // --- 輔助函式：用來更新介面文字與顏色 ---
  function updateUI(enabled) {
    toggleBtn.checked = enabled; // 設定按鈕勾選狀態
    
    if (enabled) {
      statusText.textContent = "🛡️ 保護運作中";
      statusText.style.color = "#2196F3"; // 藍色
    } else {
      statusText.textContent = "⚠️ 保護已暫停";
      statusText.style.color = "#ff4444"; // 紅色
    }
  }
});
