const hljs = require('highlight.js');
const markedpp = require('markedpp');
const MarkdownIt = require('markdown-it');
const md = new MarkdownIt({
  html: true,
  highlight: function (str, lang) {
    let outputString = '';
    if (lang === 'syntax') {
      outputString = '<pre-syntax>{{< highlight json >}}' + str + '{{< /highlight >}}</pre-syntax>';
    } else {
      outputString = '<pre-code>{{< highlight ' + lang + '>}}' + str + '{{< /highlight >}}</pre-code>';
    }
    return outputString;
  }
});
md.use(require('markdown-it-deflist'));
md.use(require('markdown-it-named-headers'), {
  slugify: function(inputString) {
    return inputString.replace(/ /g, '-');
  }
});
const fs = require('fs');
const path = require('path');

module.exports = (srcDir, destDir) => {
  realSrc = fs.realpathSync(srcDir);
  realDest = fs.realpathSync(destDir);
  dirs = fs.readdirSync(realSrc);
  process.chdir(realSrc);
  dirs.forEach(file => {
    const fileName = path.resolve(realSrc, file);
    if (fs.lstatSync(fileName).isDirectory()) return;
    const destName = path.resolve(realDest, file).replace(/\.md$/, '.html');
    const fileContent = fs.readFileSync(fileName).toString();
    const lines = fileContent.split("\n");
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
    markedpp(
      markdown,
      {},
      (err, markedppString) => {
        const htmlString = md.render(markedppString);
        const outputString = frontMatter.join("\n") + "\n" + htmlString;
        return fs.writeFileSync(destName, outputString);
      }
    ); 
  });
};
