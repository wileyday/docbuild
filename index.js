const md = require('markdown-it')({
  // hugo의 code highlight를 사용하기 위해 {{< highlight ... >}} 처리한다.
  // hugo에서 자동으로 <pre><code> 태그가 붙기 때문에 여기(markdown-it)에서는
  // 빼야하는데 여기에도 <pre><code> 태그가 자동으로 붙는다.
  // 그래서 <pre-[syntax|code]> 와 같이 처리해주고 pre-syntax는 왼쪽 본문에
  // 들어가는 Syntax로 구분 해준다.
  highlight: function (str, lang) {
    let outputString = ''
    if (lang === 'syntax') {
      outputString = '<pre-syntax>{{< highlight json >}}' + str + '{{< /highlight >}}</pre-syntax>'
    } else {
      outputString = '<pre-code>{{< highlight ' + lang + '>}}' + str + '{{< /highlight >}}</pre-code>'
    }
    return outputString
  }
})

// nested definition list 를 위해 사용
md.use(require('markdown-it-deflist'))

// heading 태그에 id를 넣기 위해 사용
// 스페이스가 올경우 '-' 넣어주어서 내부 링크에도 문제 없도록 한다.
md.use(require('markdown-it-named-headers'), {
  slugify: function(inputString) {
    return inputString.replace(/ /g, '-')
  }
})

const fs = require('fs')
const path = require('path')

module.exports = (srcDir, destDir) => {
  // 절대경로 가져오기
  realSrc = fs.realpathSync(srcDir)
  realDest = fs.realpathSync(destDir)

  // 디렉토리 안의 목록
  dirList = fs.readdirSync(realSrc)

  // working directory를 바꿔줘야 한다.
  process.chdir(realSrc)

  dirList.forEach(file => {
    const fileName = path.resolve(realSrc, file)

    // 디렉토리는 그냥 패스
    if (fs.lstatSync(fileName).isDirectory()) return

    const destName = path.resolve(realDest, file).replace(/\.md$/, '.html')
    const fileContent = fs.readFileSync(fileName).toString()
    let lines = fileContent.split("\n")

    // front matter 는 markdown 파싱할 부분이 아니므로 따로 추출한다.
    if (lines[0] === '---') {
      for (var i = 1; i < lines.length; i++) {
        if (lines[i] === '---') break
      }
    }
    let frontMatter = []
    for (let j = 0; j < i+1; j++) {
      frontMatter[j] = lines[j]
      delete lines[j]
    }

    // %include가 발견되면 파일을 읽어 해당 라인에 replace 한다.
    for (let j = 0; j < lines.length; j++) {
      if (!lines[j]) continue
      if (lines[j].startsWith('%include')) {
        const parameters = lines[j].split(' ')
        lines[j] = include(parseInt(parameters[1]), parameters[2])
      }
    }

    // Markdown 렌더링해서 frontMatter와 함께 파일에 쓴다.
    const htmlString = md.render(lines.join("\n"))
    const outputString = frontMatter.join("\n") + "\n" + htmlString
    return fs.writeFileSync(destName, outputString)
  })
}

// fileName의 파일의 읽어서 라인별로 spaces 만큼 공백을 왼쪽으로 채우고 
// string을 리턴한다.
function include(spaces, fileName) {
  const fileContent = fs.readFileSync(fileName).toString()
  const lines = fileContent.split("\n")
  for (let i = 0; i < lines.length; i++) {
    lines[i] = ' '.repeat(spaces) + lines[i]
  }
  return lines.join("\n")
}
