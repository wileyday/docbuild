const Gitdown = require('gitdown');
const MarkdownIt = require('markdown-it');
const md = new MarkdownIt();
md.use(require('markdown-it-deflist'));
const fs = require('fs');
const path = require('path');

module.exports = (srcDir, destDir) => {
  fs.readdirSync(srcDir).forEach(file => {
    const fileName = path.resolve(srcDir, file);
    if (fs.lstatSync(fileName).isDirectory()) return;
    const destName = path.resolve(destDir, file).replace(/\.md$/, '.html');
    const gitdown = Gitdown.readFile(fileName);
    gitdown.setConfig({
      headingNesting: {
        enabled: false
      }
    })
    gitdown.get().then(gitdownString => {
      const lines = gitdownString.split("\n");
      if (lines[0] === '---') {
        for (var i = 1; i < lines.length; i++) {
          if (lines[i] === '---') break;
        }
      }
      let frontMatter = [];
      for (let j = 0; j < i+1; j++) {
        frontMatter[j] = lines[j];
        delete lines[j];
      }

      const markdown = lines.join("\n");
      const htmlString = md.render(markdown);
      const outputString = frontMatter.join("\n") + "\n" + htmlString;
      return fs.writeFileSync(destName, outputString);                          
    }); 
  });
};
