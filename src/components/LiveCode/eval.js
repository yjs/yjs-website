// @ts-nocheck
import * as _Y from 'yjs'

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

const customFlatStringify = val => {
  if (typeof val === 'function') {
    return 'function'
  }
  if (val && val.constructor && typeof val === 'object' && !Array.isArray(val)) {
    let res = val.constructor.name || typeof val
    res += ' { .. }'
    return res
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

  if (val && val.constructor && typeof val === 'object' && !Array.isArray(val)) {
    let res = val.constructor.name || typeof val
    res += ' {'
    const props = []
    for (const key in val) {
      if (key[0] !== '_') {
        props.push(`${key}: ${customFlatStringify(val[key])}`)
      }
    }
    res += props.join(', ')
    res += '}'
    return res
  }
  return JSON.stringify(val)
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
  const _global = { Y: _Y };
  const __liveCodeEditResults = {}
  // eslint-disable-next-line
  const console = _fakeConsole;
  // eslint-disable-next-line
  const Y = _Y;
  eval(__code)
  return __liveCodeEditResults
}
