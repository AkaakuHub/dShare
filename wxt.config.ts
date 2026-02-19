import { defineConfig } from "wxt";

export default defineConfig({
  manifest: {
    name: "dShare",
    description: "PC版dアニメストアからスマホ版と同じような共有ツイートをできるようにします。",
    author: {
      email: "contact@akaaku.net",
    },
    action: {
      default_icon: {
        "16": "images/icon16.png",
        "32": "images/icon32.png",
        "48": "images/icon48.png",
        "64": "images/icon64.png",
        "128": "images/icon128.png"
      }
    }
  },
  modules: ['@wxt-dev/auto-icons'],
});
