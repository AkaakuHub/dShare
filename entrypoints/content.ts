import "../src/styles/content.css";

const twitterSvg = `<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" viewBox="0 0 500 500" class="SVGclassname">
<path fill="#ffffff" d="M221.95 51.29c.15 2.17.15 4.34.15 6.53 0 66.73-50.8 143.69-143.69 143.69v-.04c-27.44.04-54.31-7.82-77.41-22.64 3.99.48 8 .72 12.02.73 22.74.02 44.83-7.61 62.72-21.66-21.61-.41-40.56-14.5-47.18-35.07 7.57 1.46 15.37 1.16 22.8-.87-23.56-4.76-40.51-25.46-40.51-49.5v-.64c7.02 3.91 14.88 6.08 22.92 6.32C11.58 63.31 4.74 33.79 18.14 10.71c25.64 31.55 63.47 50.73 104.08 52.76-4.07-17.54 1.49-35.92 14.61-48.25 20.34-19.12 52.33-18.14 71.45 2.19 11.31-2.23 22.15-6.38 32.07-12.26-3.77 11.69-11.66 21.62-22.2 27.93 10.01-1.18 19.79-3.86 29-7.95-6.78 10.16-15.32 19.01-25.2 26.16z"/>
</svg>`;

function waitForElement(selector: string, callback: () => void, timeout = 5000): void {
  const interval = 500;
  const maxAttempts = timeout / interval;
  let attempts = 0;

  const check = (): void => {
    if (document.querySelector(selector)) {
      callback();
      return;
    }

    if (attempts >= maxAttempts) {
      console.log("dShare: 要素の発見がタイムアウトしました");
      return;
    }

    attempts += 1;
    setTimeout(check, interval);
  };

  check();
}

function isAlreadyExist(selector: string): boolean {
  return document.querySelector(selector) !== null;
}

function buildButtonPart(targetElement: Element): void {
  const div = document.createElement("div");
  div.innerHTML = twitterSvg.replace("SVGclassname", "twtSVG_part");
  div.className = "twtButton_part";
  div.title = "ツイートする";
  div.addEventListener("click", () => {
    let baseUrl = window.location.href;
    baseUrl = baseUrl.replace(/workId=\d{5}&/, "").replace("ci_pc", "cd") + "&ref=twtr";
    baseUrl = baseUrl.trim();

    const title = document.querySelector(".headerText")?.textContent?.trim();
    const episode = document.querySelector(".episodeTitle span")?.textContent?.trim();
    if (!title || !episode) {
      console.error("dShare: 話数ツイートに必要なテキストが見つかりませんでした");
      return;
    }

    let tweetText = `${title} ${episode}を視聴しました！#dアニメストア ${baseUrl}`;
    tweetText = encodeURIComponent(tweetText);
    window.open(`https://x.com/intent/post?text=${tweetText}`, "_blank");
  });

  targetElement.appendChild(div);
  console.log("dShare: 話数ツイートボタンの追加に成功しました");
}

function buildButtonWork(targetElement: Element): void {
  const div = document.createElement("div");
  div.innerHTML = twitterSvg.replace("SVGclassname", "twtSVG_work");
  div.className = "twtButton_work";
  div.title = "ツイートする";
  div.addEventListener("click", () => {
    let baseUrl = window.location.href;
    baseUrl = baseUrl.replace("ci_pc", "ci") + "&ref=twtr";
    baseUrl = baseUrl.trim();

    const title = document.querySelector(".titleWrap h1")?.textContent?.trim();
    if (!title) {
      console.error("dShare: 作品ツイートに必要なタイトルが見つかりませんでした");
      return;
    }

    let tweetText = `${title}配信中！#dアニメストア ${baseUrl}`;
    tweetText = encodeURIComponent(tweetText);
    window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, "_blank");
  });

  targetElement.appendChild(div);
  console.log("dShare: 作品ツイートボタンの追加に成功しました");
}

function runMain(): void {
  const urlPatternPart = /https:\/\/animestore.docomo.ne.jp\/animestore\/ci_pc\?workId=\d{5}&partId=\d{8}/;
  const urlPatternWork = /https:\/\/animestore.docomo.ne.jp\/animestore\/ci_pc\?workId=\d{5}/;

  if (urlPatternPart.test(window.location.href)) {
    if (!isAlreadyExist(".twtButton_part")) {
      waitForElement("#modalInformation3", () => {
        const target = document.querySelector("#modalInformation3");
        if (target) {
          buildButtonPart(target);
        } else {
          console.error("dShare: #modalInformation3 が見つかりませんでした");
        }
      });
    }

    if (!isAlreadyExist(".twtButton_work")) {
      waitForElement(".actionArea", () => {
        const target = document.querySelector(".actionArea");
        if (target) {
          buildButtonWork(target);
        } else {
          console.error("dShare: .actionArea が見つかりませんでした");
        }
      });
    }
    return;
  }

  if (urlPatternWork.test(window.location.href) && !isAlreadyExist(".twtButton_work")) {
    waitForElement(".actionArea", () => {
      const target = document.querySelector(".actionArea");
      if (target) {
        buildButtonWork(target);
      } else {
        console.error("dShare: .actionArea が見つかりませんでした");
      }
    });
    return;
  }

  console.log("dShare: 作品ページまたは話数ページではありません");
}

export default defineContentScript({
  matches: ["https://animestore.docomo.ne.jp/animestore/*"],
  runAt: "document_idle",
  main() {
    runMain();

    let oldHref = document.location.href;
    const body = document.querySelector("body");
    if (!body) {
      console.error("dShare: body 要素が見つかりませんでした");
      return;
    }

    const observer = new MutationObserver(() => {
      if (oldHref === document.location.href) {
        return;
      }

      oldHref = document.location.href;
      runMain();
    });

    observer.observe(body, {
      childList: true,
      subtree: true
    });
  }
});
