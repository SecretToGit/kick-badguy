// build-faces.mjs —— 把 faces/a.txt、faces/b.txt、faces/c.txt 里的 data URI 注入 index.html 的 FACES 块。
// a = 坏人A、b = 坏人B、c = 主角（主角）。
// 为什么要这一步：三张照片转成 base64 后加起来接近 25 万字符，写进代码里就是三行超长字符串。
// 图片单独存成 faces/*.txt、由脚本塞进 index.html，改代码时就不用把那几坨 Base64 读进来，
// 而最终交付仍然只有一个 index.html（双击就能玩，照片不会丢）。
// 用法：node build-faces.mjs   （幂等：换完图片重跑一次就行）
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const html = path.join(dir, 'index.html');
const keys = ['a', 'b', 'c'];

const body = keys.map(k => {
  const v = fs.readFileSync(path.join(dir, 'faces', k + '.txt'), 'utf8').trim();
  if (!v.startsWith('data:image/')) throw new Error('faces/' + k + '.txt 不是 data:image/... 开头的 data URI');
  if (v.includes("'")) throw new Error('faces/' + k + '.txt 里有单引号，不能直接进字符串');
  return '  ' + k + ": '" + v + "',";
}).join('\n');

const src = fs.readFileSync(html, 'utf8');
const out = src.replace(/const FACES = \{[\s\S]*?\n\};/, 'const FACES = {\n' + body + '\n};');
if (out === src && !src.includes(body)) throw new Error('没找到 const FACES = { ... }; 这一段，检查 index.html 有没有被改坏');
fs.writeFileSync(html, out);
console.log('已注入 FACES，index.html 现在 ' + Math.round(out.length / 1024) + ' KB');
