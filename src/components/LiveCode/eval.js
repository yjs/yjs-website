// @ts-nocheck
import * as Y from 'yjs'
import { Awareness } from 'y-protocols/awareness'
import * as object from 'lib0/object'

const _fakeConsole = {
  ...console,
  log: (...args) => {
    if (args.length <= 1) {
      return args[0]
    } else {
      return args
    }
  }
}

/**
 * @param {any} instance
 */
const getClassName = (instance) => {
  switch (instance.constructor) {
    case Y.Doc:
      return 'Y.Doc'
    case Y.Array:
      return 'Y.Array'
    case Y.YEvent:
      return 'Y.Event'
    case Y.YMapEvent:
      return 'Y.MapEvent'
    case Y.YXmlEvent:
      return 'Y.XmlEvent'
    case Y.YTextEvent:
      return 'Y.TextEvent'
    case Y.YArrayEvent:
      return 'Y.ArrayEvent'
    case Y.Map:
      return 'Y.Map'
    case Y.Text:
      return 'Y.Text'
    case Y.XmlElement:
      return 'Y.XmlElement'
    case Y.XmlFragment:
      return 'Y.XmlFragment'
    case Y.XmlText:
      return 'Y.XmlText'
    case Y.UndoManager:
      return 'Y.UndoManager'
    case Y.RelativePosition:
      return 'Y.RelativePosition'
    default:
      return instance.constructor.name || typeof val
  }
}

const customFlatStringify = (val) => {
  if (typeof val === 'function') {
    return 'function'
  }
  if (
    val && val.constructor && typeof val === 'object' && !Array.isArray(val)
  ) {
    return `${getClassName(val)} { .. }`
  }
  return JSON.stringify(val)
}

/**
 * @param {any} val
 */
const customStringify = (val) => {
  if (typeof val === 'function') {
    return 'function'
  }

  if (val instanceof Map) {
    const props = Array.from(val.entries()).map(([key, val]) =>
      `${customFlatStringify(key)}: ${customFlatStringify(val)}`
    ).join(', ')
    return `Map { ${props}${props.length > 0 ? ' ' : ''}}`
  }

  if (
    val && val.constructor && typeof val === 'object' && !Array.isArray(val)
  ) {
    let res = val.constructor.name || typeof val
    res += ' { '
    const props = []
    for (const key in val) {
      if (key[0] !== '_') {
        props.push(`"${key}": ${customFlatStringify(val[key])}`)
      }
    }
    res += props.join(', ')
    if (props.length > 0) {
      res += ' '
    }
    res += '}'
    return res
  }
  return JSON.stringify(val)
}

/**
 * Syncs in the Live Code Editor will alwyas differ from run to run. This makes
 * execution deterministic by enforcing an increasing clientID.
 */
const sanitizedYModule = {}
object.forEach(Y, (val, key) => {
  sanitizedYModule[key] = val
})
let nextClientID = 1
sanitizedYModule.Doc = class Doc extends Y.Doc {
  static get name () {
    return 'Y.Doc'
  }

  constructor (...args) {
    super(...args)
    this.clientID = nextClientID++
  }
}

/**
 * @param {string} __code
 */
export default (__code) => {
  // eslint-disable-next-line
  const __liveCodeEdit = (val, line) => {
    __liveCodeEditResults[line] = customStringify(val)
  }
  // eslint-disable-next-line
  const _global = { Y: sanitizedYModule, Awareness };
  const __liveCodeEditResults = {}
  {
    // eslint-disable-next-line
    const console = _fakeConsole;
    // eslint-disable-next-line
    const Y = _global.Y;
    // eslint-disable-next-line
    const Awareness = _global.Awareness;
    // eslint-disable-next-line
    eval(__code);
  }
  return __liveCodeEditResults
}
