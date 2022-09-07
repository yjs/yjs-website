const visit = require('unist-util-visit')

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
    console.log(ast)
    visit(ast, 'code', /** @type {function(any, any, any): void} */ (node, _index, parent) => {
      if ((node.lang === 'javascript' || node.lang === 'js') && node.meta === 'live') {
        console.log({ node, parent })
        node.type = 'jsx'
        delete node.meta
        delete node.lang
        node.value = `<LiveCode code={"${node.value.replaceAll('"', '\\"').replaceAll('\n', '\\n')}"} />`
      }
    })
  }
  return transformer
}

module.exports = plugin
