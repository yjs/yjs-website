/* eslint-env browser */

/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useEffect, useRef, useState } from 'react'
import styles from './styles.module.css'
import clsx from 'clsx'
import { basicSetup, EditorView } from 'codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { parse } from 'acorn'
import { simple } from 'acorn-walk'

import { EditorState } from '@codemirror/state'
import { Decoration, ViewPlugin, WidgetType } from '@codemirror/view'
import * as dom from 'lib0/dom'
import * as pair from 'lib0/pair'
import evalCode from './eval.js'

export default ({ code }) => {
  const ref = useRef(null)
  const [errorMessage, setErrorMessage] = useState(
    /** @type {null|string} */ (null)
  )
  const [editorView, setEditor] = useState(
    /** @type {EditorView | null} */ (null)
  )
  useEffect(() => {
    const state = EditorState.create({
      doc: code,
      extensions: [
        basicSetup,
        javascript(),
        // EditorView.lineWrapping,
        liveCodePlugin(setErrorMessage)
        // oneDark
      ]
    })
    const view = new EditorView({
      state,
      parent: /** @type {any} */ (ref.current)
    })
    setEditor(view)
    return () => {
      view.destroy()
    }
  }, [ref])

  const resetState = () => {
    if (editorView) {
      editorView.dispatch({
        changes: [{
          from: 0,
          to: editorView.state.doc.length,
          insert: code
        }]
      })
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>Live Code Editor</div>
        <button
          onClick={resetState}
          className={clsx('button', 'button--sm', 'button--secondary')}
        >
          Reset
        </button>
      </div>
      <div
        className={clsx(styles.editorContainer)}
        ref={ref}
      />
      {errorMessage &&
        <pre className={clsx(styles.footer)}>
          {errorMessage || ''}
        </pre>}
    </div>
  )
}

class ExpressionAnnotation extends WidgetType {
  /**
   * @param {string} result
   * @param {'eval'|'error'} [type]
   */
  constructor (result, type = 'eval') {
    super()
    this.result = result
    this.type = type
  }

  toDOM () {
    if (this.type === 'eval') {
      return /** @type {HTMLElement} */ (dom.element('span', [
        pair.create('class', 'executionResult'),
        pair.create('style', 'color:grey;user-select:none;')
      ], [dom.text(` => ${this.result}`)]))
    } else {
      return /** @type {HTMLElement} */ (dom.element('span', [
        pair.create('class', 'executionError'),
        pair.create('style', 'color:red;user-select:none;')
      ], [dom.text(` => ${this.result}`)]))
    }
  }

  /**
   * @param {ExpressionAnnotation} widget
   */
  eq (widget) {
    return widget.result === this.result
  }

  /**
   * @param {ExpressionAnnotation} widget
   */
  compare (widget) {
    return widget.result === this.result
  }

  updateDOM () {
    return false
  }

  get estimatedHeight () {
    return -1
  }

  ignoreEvent () {
    return true
  }
}

/**
 * @param {EditorView} view
 * @param {any} setErrorMessage
 */
const computeDecorations = (view, setErrorMessage) => {
  const code = view.state.doc.toJSON().join('\n')
  try {
    const ast = parse(code, { ecmaVersion: 'latest' })
    /**
     * @type {Array<{ pos: number, insert: string }>}
     */
    const changes = []
    simple(ast, {
      /**
       * @param {any} node
       */
      ExpressionStatement (node) {
        const expression = node.expression
        changes.push({
          pos: expression.start,
          insert: '__liveCodeEdit('
        })
        changes.push({
          pos: expression.end,
          insert: `,${node.end})`
        })
      }
    })
    changes.sort((a, b) => a.pos - b.pos)
    const res = []
    for (let currPos = 0, i = 0; i < changes.length; i++) {
      const change = changes[i]
      if (change.pos !== currPos) {
        res.push(code.slice(currPos, change.pos))
      }
      res.push(change.insert)
      currPos = change.pos
    }
    const transformedCode = res.join('')

    try {
      const annotations = evalCode(transformedCode)
      const decorations = []

      for (const line in annotations) {
        const lineNumber = Number.parseInt(line)
        const executionResult = annotations[line]
        if (executionResult !== undefined) {
          decorations.push({
            from: lineNumber,
            to: lineNumber,
            value: Decoration.widget({
              side: 1,
              block: false,
              widget: new ExpressionAnnotation(executionResult + '')
            })
          })
        }
      }

      setErrorMessage(null)
      return Decoration.set(decorations, true)
    } catch (/** @type {any} */ error) {
      setErrorMessage(error.toString())
      return Decoration.set([], true)
    }
  } catch (/** @type {any} */ error) {
    setErrorMessage(null)
    const line = view.state.doc.line(error.loc.line)
    return Decoration.set([
      {
        from: line.to,
        to: line.to,
        value: Decoration.widget({
          side: 1,
          block: false,
          widget: new ExpressionAnnotation(error.message + '', 'error')
        })
      }
    ], true)
  }
}

/**
 * @param {function(string|null):void} setErrorMessage
 */
export const liveCodePlugin = (setErrorMessage) => {
  class LiveCodePluginValue {
    /**
     * @param {EditorView} view
     */
    constructor (view) {
      /**
       * @type {import('@codemirror/view').DecorationSet}
       */
      this.decorations = computeDecorations(view, setErrorMessage)
    }

    destroy () {
    }

    /**
     * @param {import('@codemirror/view').ViewUpdate} update
     */
    update (update) {
      if (update.docChanged) {
        this.decorations = computeDecorations(update.view, setErrorMessage)
      }
    }
  }
  return ViewPlugin.fromClass(
    LiveCodePluginValue,
    {
      decorations: (v) => v.decorations
    }
  )
}
