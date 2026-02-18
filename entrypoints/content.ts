import "../src/styles/content.css";

const twitterSvg = `<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" viewBox="0 0 500 500">
<path transform="translate(20 40) scale(2)" fill="#ffffff" d="M221.95 51.29c.15 2.17.15 4.34.15 6.53 0 66.73-50.8 143.69-143.69 143.69v-.04c-27.44.04-54.31-7.82-77.41-22.64 3.99.48 8 .72 12.02.73 22.74.02 44.83-7.61 62.72-21.66-21.61-.41-40.56-14.5-47.18-35.07 7.57 1.46 15.37 1.16 22.8-.87-23.56-4.76-40.51-25.46-40.51-49.5v-.64c7.02 3.91 14.88 6.08 22.92 6.32C11.58 63.31 4.74 33.79 18.14 10.71c25.64 31.55 63.47 50.73 104.08 52.76-4.07-17.54 1.49-35.92 14.61-48.25 20.34-19.12 52.33-18.14 71.45 2.19 11.31-2.23 22.15-6.38 32.07-12.26-3.77 11.69-11.66 21.62-22.2 27.93 10.01-1.18 19.79-3.86 29-7.95-6.78 10.16-15.32 19.01-25.2 26.16z"/>
</svg>`;
const clipboardSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
<path fill="currentColor" d="M16 2h-1.18A3 3 0 0 0 12 0a3 3 0 0 0-2.82 2H8a2 2 0 0 0-2 2v1H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V4a2 2 0 0 0-2-2m-4-1a1 1 0 0 1 1 1h-2a1 1 0 0 1 1-1m4 4H8V4h8zM5 7h14v14H5z"/>
</svg>`;

type ShareContext = "part" | "work";
type ShareAction = "tweet" | "copy";

const selectors = {
  partTarget: "#modalInformation3",
  workTarget: ".actionArea",
  partTitle: ".headerText",
  partEpisode: ".episodeTitle span",
  workTitle: ".titleWrap h1"
} as const;

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

function getPageContext(): ShareContext | null {
  const url = new URL(window.location.href);
  const workId = url.searchParams.get("workId");
  const partId = url.searchParams.get("partId");

  if (url.hostname !== "animestore.docomo.ne.jp" || url.pathname !== "/animestore/ci_pc") {
    return null;
  }

  if (!workId || !/^\d{5}$/.test(workId)) {
    return null;
  }

  if (partId && /^\d{8}$/.test(partId)) {
    return "part";
  }

  return "work";
}

function buildShareUrl(context: ShareContext): string {
  const url = new URL(window.location.href);

  if (context === "part") {
    url.searchParams.delete("workId");
    url.pathname = url.pathname.replace("/ci_pc", "/cd");
  } else {
    url.pathname = url.pathname.replace("/ci_pc", "/ci");
  }

  url.searchParams.set("ref", "twtr");
  return url.toString();
}

function buildShareText(context: ShareContext): string | null {
  if (context === "part") {
    const title = document.querySelector(selectors.partTitle)?.textContent?.trim();
    const episode = document.querySelector(selectors.partEpisode)?.textContent?.trim();
    if (!title || !episode) {
      console.error("dShare: 話数共有に必要なテキストが見つかりませんでした");
      return null;
    }

    const shareUrl = buildShareUrl("part");
    return `${title} ${episode}を視聴しました！#dアニメストア ${shareUrl}`;
  }

  const title = document.querySelector(selectors.workTitle)?.textContent?.trim();
  if (!title) {
    console.error("dShare: 作品共有に必要なタイトルが見つかりませんでした");
    return null;
  }

  const shareUrl = buildShareUrl("work");
  return `${title}配信中！#dアニメストア ${shareUrl}`;
}

function openTweetIntent(text: string): void {
  const encoded = encodeURIComponent(text);
  window.open(`https://x.com/intent/post?text=${encoded}`, "_blank");
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    console.log("dShare: クリップボードにコピーしました");
    return true;
  } catch (error) {
    console.error("dShare: クリップボードへのコピーに失敗しました", error);
    return false;
  }
}

function showCopyIndicator(button: HTMLButtonElement): void {
  let indicator = button.querySelector<HTMLSpanElement>(".dshare-copy-indicator");
  if (!indicator) {
    indicator = document.createElement("span");
    indicator.className = "dshare-copy-indicator";
    indicator.textContent = "コピーしました！";
    button.appendChild(indicator);
  }

  indicator.classList.add("is-visible");

  const activeTimerId = button.dataset.copyIndicatorTimerId;
  if (activeTimerId) {
    window.clearTimeout(Number(activeTimerId));
  }

  const timeoutId = window.setTimeout(() => {
    indicator.classList.remove("is-visible");
    delete button.dataset.copyIndicatorTimerId;
  }, 1200);
  button.dataset.copyIndicatorTimerId = String(timeoutId);
}

function createShareButton(context: ShareContext, action: ShareAction): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `dshare-btn dshare-btn--${context} dshare-btn--${action}`;
  button.title = action === "tweet" ? "ポストする" : "クリップボードにコピーする";
  button.setAttribute("aria-label", button.title);

  const icon = document.createElement("span");
  icon.className = "dshare-btn__icon";
  icon.innerHTML = action === "tweet" ? twitterSvg : clipboardSvg;
  button.appendChild(icon);

  button.addEventListener("click", async () => {
    const shareText = buildShareText(context);
    if (!shareText) {
      return;
    }

    if (action === "tweet") {
      openTweetIntent(shareText);
      return;
    }

    const isCopied = await copyToClipboard(shareText);
    if (isCopied) {
      showCopyIndicator(button);
    }
  });

  return button;
}

function createActionGroup(context: ShareContext): HTMLDivElement {
  const group = document.createElement("div");
  group.className = `dshare-actions dshare-actions--${context}`;
  group.append(createShareButton(context, "tweet"), createShareButton(context, "copy"));
  return group;
}

function ensureActionGroup(targetSelector: string, groupSelector: string, context: ShareContext): void {
  if (document.querySelector(groupSelector)) {
    return;
  }

  waitForElement(targetSelector, () => {
    if (document.querySelector(groupSelector)) {
      return;
    }

    const targetElement = document.querySelector(targetSelector);
    if (!targetElement) {
      console.error(`dShare: ${targetSelector} が見つかりませんでした`);
      return;
    }

    targetElement.appendChild(createActionGroup(context));
    console.log(`dShare: ${context} 用の共有ボタン追加に成功しました`);
  });
}

function runMain(): void {
  const pageContext = getPageContext();

  if (pageContext === "part") {
    ensureActionGroup(selectors.partTarget, ".dshare-actions--part", "part");
    ensureActionGroup(selectors.workTarget, ".dshare-actions--work", "work");
    return;
  }

  if (pageContext === "work") {
    ensureActionGroup(selectors.workTarget, ".dshare-actions--work", "work");
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
