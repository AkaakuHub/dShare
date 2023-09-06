const userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1';
let url = "";
const eInfo = [
    {
        url: "https://animestore.docomo.ne.jp/animestore/",
        s: '<li class=snsTwitter><a href="',
        e: '" onclick=',
    }
];

browser.runtime.onMessage.addListener(function (message) {
    if (message.action === "execute") {
        share();
    }
});

async function getHTML() {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.setRequestHeader('User-Agent', userAgent);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    const smartphoneHTML = xhr.responseText;
                    resolve(smartphoneHTML);
                } else {
                    reject('Request failed with status: ' + xhr.status);
                }
            }
        };
        xhr.send();
    });
}

function cut(text, s, e) {
    const startIndex = text.indexOf(s);
    if (startIndex === -1) {
        alert('Start keyword not found.');
        console.error('Start keyword not found.');
        return null;
    }
    const endIndex = text.indexOf(e, startIndex + s.length);
    if (endIndex === -1) {
        alert('End keyword not found after start keyword.');
        console.error('End keyword not found after start keyword.');
        return null;
    }
    let extractedText = text.substring(startIndex + s.length, endIndex);
    return extractedText;
}

function share() {
    url = window.location.href;
    if (url.includes("partId")) {
        url = url.slice(0, 43) + "cd?" + url.slice(-15);
    } else if (url.includes("ci_pc")) {
        url = (window.location.href).replace("ci_pc?", "ci?");
    } else {
        alert('dアニメストアのURLではありません。');
        console.error('dアニメストアのURLではありません。');
        return;
    }
    const eInfoItem = eInfo.find((item) => url.includes(item.url));
    if (eInfoItem) {
        getHTML()
            .then((smartphoneHTML) => {
                let extractedText = cut(smartphoneHTML, eInfoItem.s, eInfoItem.e);
                window.open(extractedText, '_blank');
            })
            .catch((error) => {
                alert(error);
                console.error(error);
            });
    } else {
        alert('dアニメストアのURLではありません。');
        console.error('dアニメストアのURLではありません。');
    }
}
