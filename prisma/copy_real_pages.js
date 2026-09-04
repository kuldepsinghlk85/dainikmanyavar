const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'public', 'uploads', 'epaper', 'pages');
fs.mkdirSync(targetDir, { recursive: true });

const sourceFiles = [
  { num: 1, src: 'C:\\Users\\hp\\.gemini\\antigravity\\brain\\5262d82b-023c-4c11-81cf-e0c518114267\\.user_uploaded\\media_1788500837645.png', ext: 'png' },
  { num: 2, src: 'C:\\Users\\hp\\.gemini\\antigravity\\brain\\5262d82b-023c-4c11-81cf-e0c518114267\\.user_uploaded\\media_1788500837552.png', ext: 'png' },
  { num: 3, src: 'C:\\Users\\hp\\.gemini\\antigravity\\brain\\5262d82b-023c-4c11-81cf-e0c518114267\\.user_uploaded\\media_1788500837652.jpg', ext: 'jpg' },
  { num: 4, src: 'C:\\Users\\hp\\.gemini\\antigravity\\brain\\5262d82b-023c-4c11-81cf-e0c518114267\\.user_uploaded\\media_1788500837683.png', ext: 'png' },
  { num: 5, src: 'C:\\Users\\hp\\.gemini\\antigravity\\brain\\5262d82b-023c-4c11-81cf-e0c518114267\\.user_uploaded\\media_1788500837536.png', ext: 'png' },
  { num: 6, src: 'C:\\Users\\hp\\.gemini\\antigravity\\brain\\tempmediaStorage\\media_1788500917335.png', ext: 'png' },
  { num: 7, src: 'C:\\Users\\hp\\.gemini\\antigravity\\brain\\tempmediaStorage\\media_1788500917395.png', ext: 'png' },
  { num: 8, src: 'C:\\Users\\hp\\.gemini\\antigravity\\brain\\tempmediaStorage\\media_1788500917423.jpg', ext: 'jpg' }
];

for (const item of sourceFiles) {
  const dest = path.join(targetDir, 'page_' + item.num + '.' + item.ext);
  fs.copyFileSync(item.src, dest);
  console.log('[+] Copied Page ' + item.num + ' -> ' + dest + ' (' + fs.statSync(dest).size + ' bytes)');
}
