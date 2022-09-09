const visit = require('unist-util-visit')
const axios = require('axios').default
const { parse } = require('node-html-parser')

/**
 * @param {string} href
 * @param {string | null} [backupTitle]
 */
const getSocialMetadata = async (href, backupTitle = null) => {
  const res = await axios.get(href)
  const root = parse(res.data)
  const head = /** @type {typeof root} */ (root.querySelector('head'))
  /**
   * @param {string} name
   * @param {string|null} [fallback]
   */
  const querySocialData = (name, fallback = null) => {
    const n = head.querySelector(`meta[property="${name}"]`)
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

/**
 * @param {any} _options
 */
const plugin = (_options) => {
  /**
   * @param {import('unist').Node} ast
   */
  const transformer = async (ast) => {
    /**
     * @type {Array<{node: any, overwrite: any | null }>}
     */
    const options = []
    visit(ast, 'link', (node, _index, parent) => {
      if (
        parent == null ||
        (parent.type === 'paragraph' && parent.children.length === 1)
      ) {
        options.push({ node, overwrite: parent || node })
      }
    })
    await Promise.all(options.map(async ({ node, overwrite }) => {
      const backupTitle = node.title ||
        (node.children.length === 1 && node.children[0].type === 'text'
          ? node.children[0].value
          : '')
      try {
        const { image, title, description } = await getSocialMetadata(
          node.url,
          backupTitle
        )
        overwrite.type = 'jsx'
        overwrite.value =
          `<SocialLink image="${image}" href="${node.url}" title="${
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
