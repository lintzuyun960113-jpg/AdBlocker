// content.js
console.log("AdShield 廣告清掃機器人 v5.3 - 白名單防護版");

// 廣告選擇器 (只留妳確認過的、絕對是廣告的項目)
const adSelectors = [
    // --- 1. 妳指定的特定目標 ---
    '#sda-moments-iframe',
    '.text-gandalf',         // 雖然這通常是廣告，但下面會加保險檢查
    '.bg-toast-background',
    '#sda-top-center-iframe',
    
    // --- 2. 針對 ExoClick ---
    'div[class*="exo-native-widget"]',
    'video[id^="exo-video-"]',
    
    // --- 3. Google AdSense ---
    '.adsbygoogle',
    '#google_image_div',
    '#google_ads_iframe',
    
    // ❌ 已移除：所有針對 component/banners 或 carousel 的規則
];

function removeAds() {
    if (adSelectors.length === 0) return;

    const selectorString = adSelectors.join(', ');
    const ads = document.querySelectorAll(selectorString);

    ads.forEach(ad => {
        // 【重要修正】執行刪除前，先過「白名單」檢查
        // 如果這個元素 (或它的父層) 看起來像重要的網頁結構，就「放過它」
        if (isSafeContent(ad)) {
            console.log("略過誤判的重要內容:", ad);
            return; // 直接跳過，不執行刪除
        }

        // --- 策略 A: 針對 "廣告" 文字標籤 ---
        if (ad.classList.contains('text-gandalf') || ad.innerText.trim() === '廣告') {
            if (ad.parentElement && ad.parentElement.tagName !== 'BODY') {
                // 再次檢查父層是否安全
                if (!isSafeContent(ad.parentElement)) {
                    destroyElement(ad.parentElement);
                }
            }
        }
        // --- 策略 B: 針對外層容器 ---
        else if (ad.classList.contains('bg-toast-background')) {
             destroyElement(ad);
        }
        // --- 策略 C: 針對特定 iframe ---
        else if (ad.id === 'sda-moments-iframe' || ad.id === 'sda-top-center-iframe') {
             destroyElement(ad);
             // 只有在父層高度很小 (像廣告條) 時才刪除父層
             if(ad.parentElement && ad.parentElement.offsetHeight < 400 && ad.parentElement.tagName !== 'BODY') {
                 if (!isSafeContent(ad.parentElement)) {
                     destroyElement(ad.parentElement);
                 }
             }
        }
        // --- 策略 D: 其他 (ExoClick, Google) ---
        else {
             destroyElement(ad);
        }
    });
}

// 【新增】白名單檢測函式：判斷這個元素是不是「絕對不能刪」的好東西
function isSafeContent(el) {
    if (!el) return false;

    // 1. 檢查 class 名稱是否包含重要關鍵字 (如 carousel, banner, header, nav)
    // 注意：有些廣告也會偷用 banner 字眼，所以這裡要根據妳的狀況調整
    // 元智的跑馬燈有 "carousel-item"，所以我們保護它
    const className = (el.className || '').toString().toLowerCase();
    
    if (className.includes('carousel') ||    // 保護輪播圖
        className.includes('navbar') ||      // 保護導覽列
        className.includes('menu') ||        // 保護選單
        el.tagName === 'HEADER' ||           // 保護頁首
        el.tagName === 'NAV')                // 保護導航區
    {
        return true; // 這是安全內容，不要殺
    }

    // 2. 往上找父層，看看是不是包在重要結構裡
    // 例如：如果這個東西在 .carousel-inner 裡面，那它就是輪播圖的一部分
    if (el.closest('.carousel-inner') || el.closest('.navbar')) {
        return true;
    }

    return false;
}

// 毀滅元素的函式
function destroyElement(el) {
    if (!el) return;
    if (el.tagName === 'BODY' || el.tagName === 'HTML') return;

    el.style.setProperty('display', 'none', 'important');
    el.style.setProperty('visibility', 'hidden', 'important');
    el.style.setProperty('height', '0px', 'important');
    el.style.setProperty('min-height', '0px', 'important'); 
    el.style.setProperty('margin', '0px', 'important');
    el.style.setProperty('padding', '0px', 'important');
    el.innerHTML = ''; 
}

// 執行清除
removeAds();

// 監聽動態載入
const observer = new MutationObserver((mutations) => {
    let shouldCheck = false;
    for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
            shouldCheck = true;
            break;
        }
    }
    if (shouldCheck) {
        removeAds();
    }
});
observer.observe(document.body, { childList: true, subtree: true });