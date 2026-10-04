#!/usr/bin/env node
/**
 * capture.js — URL を Chromium で開いてスクリーンショットを保存する。
 *
 * グローバル導入した playwright（`npm install -g playwright` + `playwright install chromium`）を
 * 自動解決して使う。NODE_PATH の設定は不要。
 *
 * 使い方:
 *   node capture.js <url> <out.png> [オプション]
 *
 * オプション:
 *   --wait <ms>     読み込み後に待つミリ秒（フォント/描画待ち。既定 2500）
 *   --vp <WxH>      ビューポート（既定 1600x1000）
 *   --click         中央を1回クリック（「クリックで開始」等のオーバーレイを消す）
 *   --full          ページ全体を撮る（既定はビューポート内）
 *   --dark          prefers-color-scheme: dark で開く
 *
 * 例（発表者ビューの特定スライド）:
 *   node capture.js "http://localhost:5181/?view=presenter&slide=7" out.png --click --wait 4000
 */
const { execSync } = require('child_process');
const path = require('path');

// グローバル playwright を解決（require 解決パスに乗らないため明示 require）
let chromium;
try {
  const groot = execSync('npm root -g', { encoding: 'utf-8' }).trim();
  ({ chromium } = require(path.join(groot, 'playwright')));
} catch (e) {
  process.stderr.write(
    'playwright を解決できません。`npm install -g playwright && playwright install chromium` を実行してください。\n' +
      String(e) + '\n',
  );
  process.exit(1);
}

const args = process.argv.slice(2);
const url = args[0];
const out = args[1];
if (!url || !out) {
  process.stderr.write('使い方: node capture.js <url> <out.png> [--wait ms] [--vp WxH] [--click] [--full] [--dark]\n');
  process.exit(1);
}
const getOpt = (name, def) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
};
const waitMs = parseInt(getOpt('--wait', '2500'), 10);
const [vw, vh] = getOpt('--vp', '1600x1000').split('x').map((n) => parseInt(n, 10));
const doClick = args.includes('--click');
const fullPage = args.includes('--full');
const dark = args.includes('--dark');

(async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({
      viewport: { width: vw || 1600, height: vh || 1000 },
      deviceScaleFactor: 2,
      colorScheme: dark ? 'dark' : 'light',
    });
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
    if (doClick) {
      await page.mouse.click((vw || 1600) / 2, (vh || 1000) / 2).catch(() => {});
    }
    await page.waitForTimeout(waitMs);
    await page.screenshot({ path: out, fullPage });
    process.stdout.write(`保存: ${out}\n`);
  } finally {
    await browser.close();
  }
})().catch((e) => {
  process.stderr.write('capture 失敗: ' + String(e) + '\n');
  process.exit(1);
});
