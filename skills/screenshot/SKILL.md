---
name: screenshot
description: >
  URL を Chromium で開いて画面を画像に保存する。
  グローバル導入の playwright を自動解決するので NODE_PATH の設定は要らない。
  「スクリーンショットを撮って」「この画面を見せて」「描画を確認したい」で使う。
  テキストだけ取れれば済むフェッチ道具はブラウザ描画に使えない
  （JavaScript で描く画面は空の <div id="root"> しか返らない）。描画が要るならこちら。
user-invocable: true
allowed-tools: Bash
argument-hint: "<URL> <out.png> [--click | --wait <ms> | --vp <WxH> | --full | --dark]"
---

# screenshot

## 実行環境の扱い

この手順の Read / Bash / WebSearch / Agent / Skill は操作の種類を表す。
Claude Codeでは対応するツールを使い、Codexでは提供されているファイル読取・シェル・Web検索・画像表示ツールを使う。
別スキルを使うときは、利用可能なスキル一覧から名前と実際の SKILL.md の場所を確認して読む。
スキルが未導入なら、その工程に必要な依存として案内し、実行したことにしない。
サブエージェントは提供されているAPIと実行権限に従う。
使えない場合、取得作業は自分で順に行い、独立レビューが必要な工程は未実施として報告する。
スクリプトと参照資料は、この SKILL.md のあるディレクトリを基準に絶対パスへ解決する。
作業先プロジェクトの cwd や隣のプラグインの配置を、スキルの配置場所と取り違えない。

URL を Chromium（playwright）で開き、画面を png に保存する。

```bash
node capture.js <url> <out.png> [オプション]
```

このリポジトリの外から呼ぶときは `capture.js` を絶対パスで指す。

| オプション | 何をするか |
| - | - |
| `--wait <ms>` | 読み込み後に待つミリ秒（字体・描画の待ち。既定 2500） |
| `--vp <WxH>` | 画面の大きさ（既定 1600x1000） |
| `--click` | 中央を1回クリックする（「クリックで開始」の覆いを消す） |
| `--full` | ページ全体を撮る（既定は画面に入る範囲だけ） |
| `--dark` | 暗い配色（`prefers-color-scheme: dark`）で開く |

倍率は 2 倍で固定（`deviceScaleFactor: 2`）。読み込みは `networkidle` まで待ち、
届かなくても止まらずに進む（上限 30 秒）。

例（発表者ビューの特定のスライド）:

```bash
node capture.js "http://localhost:5181/?view=presenter&slide=7" out.png --click --wait 4000
```

## 撮り比べるとき

直す前と後を撮って差を根拠にするなら、先に画面が時間で変わるか（アニメ・自動回転・読み込み待ち）を確かめる。
変わる画面では、同じ条件で2回撮ったときのぶれを先に出し、前後の差がぶれより小さければ根拠にしない。
時間で変わる画面は、撮り比べより、要素の位置や大きさを直接読むほうが確か。

## 使えないときの直し方

`playwright を解決できません` と出たら、グローバルへ入れる:

```bash
npm install -g playwright && playwright install chromium
```

版番号をここに書かない（書いた瞬間から腐る）。要るときに `--version` で採る。
