const TwitterSVG = `<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" viewBox="0 0 500 500" class="SVGclassname">
<path fill="#ffffff" d="M221.95 51.29c.15 2.17.15 4.34.15 6.53 0 66.73-50.8 143.69-143.69 143.69v-.04c-27.44.04-54.31-7.82-77.41-22.64 3.99.48 8 .72 12.02.73 22.74.02 44.83-7.61 62.72-21.66-21.61-.41-40.56-14.5-47.18-35.07 7.57 1.46 15.37 1.16 22.8-.87-23.56-4.76-40.51-25.46-40.51-49.5v-.64c7.02 3.91 14.88 6.08 22.92 6.32C11.58 63.31 4.74 33.79 18.14 10.71c25.64 31.55 63.47 50.73 104.08 52.76-4.07-17.54 1.49-35.92 14.61-48.25 20.34-19.12 52.33-18.14 71.45 2.19 11.31-2.23 22.15-6.38 32.07-12.26-3.77 11.69-11.66 21.62-22.2 27.93 10.01-1.18 19.79-3.86 29-7.95-6.78 10.16-15.32 19.01-25.2 26.16z"/>
</svg>`

function waitForElement(selector, callback, timeout = 5000) {
    const interval = 500;
    const maxAttempts = timeout / interval;
    let attempts = 0;

    const check = () => {
        if (document.querySelector(selector)) {
            callback();
        } else if (attempts < maxAttempts) {
            attempts++;
            setTimeout(check, interval);
        } else {
            console.log("dShare: 要素の発見がタイムアウトしました");
        }
    };
    check();
}

// 特定のクラスを持つ要素があるかどうかをチェックする
function isAlreadyExist(selector) {
    return document.querySelector(selector) ? true : false;
}

function buildButton_part(targetElement) {
    const div = document.createElement("div");
    div.innerHTML = TwitterSVG.replace("SVGclassname", "twtSVG_part");
    div.className = "twtButton_part";
    div.title = "ツイートする";
    div.addEventListener("click", function () {
        let baseURL = window.location.href;
        baseURL = baseURL.replace(/workId=\d{5}&/, "").replace("ci_pc", "cd") + "&ref=twtr";
        baseURL = baseURL.trim();
        // htmlのtitle
        let title = document.querySelector(".headerText").textContent;
        let wasuu = document.querySelector(".episodeTitle span").textContent;
        title = (title + " " + wasuu).trim();
        let tweetText = `${title}を視聴しました！#dアニメストア ${baseURL}`;
        tweetText = encodeURIComponent(tweetText);
        window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, "_blank");
    });
    targetElement.appendChild(div);
    console.log("dShare: 話数ツイートボタンの追加に成功しました");
}

function buildButton_work(targetElement) {
    const div = document.createElement("div");
    div.innerHTML = TwitterSVG.replace("SVGclassname", "twtSVG_work");
    div.className = "twtButton_work";
    div.title = "ツイートする";
    div.addEventListener("click", function () {
        let baseURL = window.location.href;
        baseURL = baseURL.replace("ci_pc", "ci") + "&ref=twtr";
        baseURL = baseURL.trim();
        // titleWrapの子要素のh1のテキスト
        let title = document.querySelector(".titleWrap h1").textContent;
        title = title.trim();
        let tweetText = `${title}配信中！#dアニメストア ${baseURL}`;
        tweetText = encodeURIComponent(tweetText);
        window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, "_blank");
    });
    targetElement.appendChild(div);
    console.log("dShare: 作品ツイートボタンの追加に成功しました");
}

function main() {
    const urlPattern_part = /https:\/\/animestore.docomo.ne.jp\/animestore\/ci_pc\?workId=\d{5}&partId=\d{8}/;
    const urlPattern_work = /https:\/\/animestore.docomo.ne.jp\/animestore\/ci_pc\?workId=\d{5}/;
    if (urlPattern_part.test(window.location.href)) { // workIdとpartIdがある場合
        if (!isAlreadyExist(".twtButton_part")) {
            waitForElement("#modalInformation3", function () {
                const targetElement = document.querySelector("#modalInformation3");
                if (targetElement) {
                    buildButton_part(targetElement);
                } else {
                    console.error("dShare: targetElementが見つかりませんでした");
                }
            });
        }
        if (!isAlreadyExist(".twtButton_work")) {
            waitForElement(".actionArea", function () {
                const targetElement = document.querySelector(".actionArea");
                if (targetElement) {
                    buildButton_work(targetElement);
                } else {
                    console.error("dShare: targetElementが見つかりませんでした");
                }
            });
        }
    } else if (urlPattern_work.test(window.location.href)) { // workIdのみの場合
        if (!isAlreadyExist(".twtButton_work")) {
            waitForElement(".actionArea", function () {
                const targetElement = document.querySelector(".actionArea");
                if (targetElement) {
                    buildButton_work(targetElement);
                } else {
                    console.error("dShare: targetElementが見つかりませんでした");
                }
            });
        }
    } else {
        console.log("dShare: 作品ページまたは話数ページではありません");
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", main);
} else {
    main();
}

// urlのクエリが変わったら再度実行
let oldHref = document.location.href;

const bodyList = document.querySelector("body");
const observer = new MutationObserver(function (mutations) {
    if (oldHref != document.location.href) {
        oldHref = document.location.href;
        main();
    }
});

const config = {
    childList: true,
    subtree: true
};

observer.observe(bodyList, config);
