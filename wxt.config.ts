import { defineConfig } from "wxt";

export default defineConfig({
  manifest: {
    name: "dShare",
    description: "PC版dアニメストアからスマホ版と同じような共有ツイートをできるようにします。",
    author: {
      email: "contact@akaaku.net",
    },
  },
  modules: ["@wxt-dev/auto-icons"],
  hooks: {
    "build:manifestGenerated": (wxt, manifest) => {
      if (wxt.config.browser !== "firefox") {
        return;
      }

      const author = manifest.author;
      if (!author) {
        return;
      }

      Reflect.set(manifest, "author", author.email);
    },
  },
});
