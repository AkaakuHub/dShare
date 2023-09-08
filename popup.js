document.addEventListener("DOMContentLoaded", function () {
    setTimeout(function () {
        browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            browser.tabs.sendMessage(tabs[0].id, { action: "execute" });
        });
    }, 100);//遅延させないと一回目のクリックで動かない
});
