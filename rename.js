const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    try {
      filelist = fs.statSync(dirFile).isDirectory()
        ? walkSync(dirFile, filelist)
        : filelist.concat(dirFile);
    } catch (err) {
      if (err.code === 'ENOENT') return;
    }
  });
  return filelist;
};

const dirs = [
  path.join(__dirname, 'app'),
  path.join(__dirname, 'components'),
  path.join(__dirname, 'lib')
];

let files = [];
dirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    files = files.concat(walkSync(dir));
  }
});

files.forEach(file => {
  if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Remove danh-gia-san related objects in admin dashboard / sitemap
    if (file.includes('sitemap.ts')) {
      content = content.replace(/\{ url: `\$\{BASE_URL\}\/danh-gia-san`.*\},\n/g, '');
      content = content.replace(/\{ url: `\$\{BASE_URL\}\/danh-gia-san\/\$\{broker\.slug\}`.*\n.*\n.*\n/g, '');
    }
    
    if (file.includes('admin\\layout.tsx') || file.includes('admin/layout.tsx')) {
      content = content.replace(/\{ href: '\/admin\/danh-gia-san', label: '.*' \},?\n/g, '');
    }
    
    if (file.includes('admin\\page.tsx') || file.includes('admin/page.tsx')) {
      content = content.replace(/\{ label: '.*', value: stats\.totalBrokers \?\? 0, href: '\/admin\/danh-gia-san' \},?\n/g, '');
    }
    
    if (file.includes('MobileBottomNav.tsx')) {
      content = content.replace(/<Link href="\/danh-gia-san".*>.*<\/Link>/g, '');
    }

    // Rename branding
    content = content.replace(/Đừng đầu tư/g, 'Góc nhìn đầu tư');
    content = content.replace(/Đừng Đầu Tư/g, 'Góc Nhìn Đầu Tư');
    content = content.replace(/đừng đầu tư/g, 'góc nhìn đầu tư');
    
    content = content.replace(/dungdautu\.com/gi, 'gocnhindautu.com');
    content = content.replace(/dungdautu/g, 'gocnhindautu');
    content = content.replace(/Dungdautu/g, 'Gocnhindautu');
    content = content.replace(/DUNGDAUTU/g, 'GOCNHINDAUTU');

    if (content !== original) {
      fs.writeFileSync(file, content, 'utf8');
      console.log('Updated', file);
    }
  }
});
