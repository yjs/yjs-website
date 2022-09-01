const visit = require('unist-util-visit')
const axios = require('axios').default
const { parse } = require('node-html-parser')

const getSocialMetadata = async (href, backupTitle = null) => {
  const res = await axios.get(href)
  const root = parse(res.data)
  const querySocialData = (name, fallback = null) => {
    const n = root.querySelector(`head meta[property="${name}"]`)
    return (n && n.getAttribute('content')) || fallback
  }
  const image = querySocialData('og:image') // @todo add fallback image
  const imageAlt = querySocialData('og:image:alt')
  const siteName = querySocialData('og:site_name')
  const type = querySocialData('og:type')
  const title = querySocialData('og:title', backupTitle)
  const url = querySocialData('og:url')
  const description = querySocialData('og:description', '')
  return {
    image,
    imageAlt,
    siteName,
    type,
    title,
    url,
    description
  }
}

const plugin = (_options) => {
  const transformer = async (ast) => {
    const options = []
    visit(ast, 'link', (node, _index, parent) => {
      if (parent.children.length === 1) {
        options.push(node)
      }
    })
    await Promise.all(options.map(async (node) => {
      const backupTitle = node.title ||
        (node.children.length === 1 && node.children[0].type === 'text'
          ? node.children[0].value
          : '')
      try {
        const { image, title, description } = await getSocialMetadata(
          node.url,
          backupTitle
        )
        node.type = 'jsx'
        node.value = `<SocialLink image="${image}" href="${node.url}" title="${
          backupTitle || title
        }" description="${description}" />`
      } catch {
        console.error(`Issues catching social description of ${node.url}`)
      }
    }))
  }
  return transformer
}

module.exports = plugin
