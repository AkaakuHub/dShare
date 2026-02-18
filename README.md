# dShare

PC版dアニメストアにツイートボタンを追加する Chrome 拡張です。

## Status
- `main` にブランチを集約済み
- 旧MV3実装は `legacy/chrome-mv3/` に退避
- 新規開発は `wxt` 構成で進行

## Development (WXT)
```bash
npm install
npm run dev
```

## Directory
- `entrypoints/content.ts`: 現行のWXTコンテンツスクリプト
- `src/styles/content.css`: コンテンツスクリプト用CSS
- `public/images/`: 拡張アイコン
- `legacy/chrome-mv3/`: 旧manifest直書き構成

## Reference
<img width="50%" alt="dShare_img" src="https://github.com/AkaakuHub/AkaakuHub/blob/main/thumbnail/dShare1.png">
<img width="50%" alt="dShare_img" src="https://github.com/AkaakuHub/AkaakuHub/blob/main/thumbnail/dShare2.png">

Chrome Web Store:
https://chromewebstore.google.com/detail/dshare/gddckcmgggemdlbioklkjflbcobpjjdk?hl=ja
