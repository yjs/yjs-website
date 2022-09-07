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
import * as env from 'lib0/environment'

import { basicSetup, EditorView } from 'codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { parse } from 'acorn'
import { simple } from 'acorn-walk'

import { EditorState, RangeSet } from '@codemirror/state'
import { Decoration, ViewPlugin, WidgetType } from '@codemirror/view'
import * as dom from 'lib0/dom'
import * as pair from 'lib0/pair'
import evalCode from './eval.js'

export default ({ code }) => {
  const ref = useRef(null)
  const [errorMessage, setErrorMessage] = useState(/** @type {null|string} */ (null))
  useEffect(() => {
    if (!env.isBrowser) {
      return
    }
    const state = EditorState.create({
      doc: code,
      extensions: [
        basicSetup,
        javascript(),
        EditorView.lineWrapping,
        liveCodePlugin(setErrorMessage)
        // oneDark
      ]
    })
    const view = new EditorView({
      state,
      parent: /** @type {any} */ (ref.current)
    })
    return () => {
      view.destroy()
    }
  }, [ref])

  return (
    <div>
      <div
        className={clsx(styles.editorContainer)}
        ref={ref}
      />
      {errorMessage && <pre style={{ color: 'red' }}>{errorMessage}</pre>}
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
        pair.create('style', 'color:grey;')
      ], [dom.text(` => ${this.result} `)]))
    } else {
      return /** @type {HTMLElement} */ (dom.element('span', [
        pair.create('class', 'executionError'),
        pair.create('style', 'color:red;')
      ], [dom.text(` => ${this.result} `)]))
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
 * @param {function(string|null):void} setErrorMessage
 */
export const liveCodePlugin = (setErrorMessage) => {
  class LiveCodePluginValue {
    /**
     * @param {EditorView} _view
     */
    constructor (_view) {
      /**
       * @type {import('@codemirror/view').DecorationSet}
       */
      this.decorations = RangeSet.of([])
    }

    destroy () {
    }

    /**
     * @param {import('@codemirror/view').ViewUpdate} update
     */
    update (update) {
      if (update.docChanged) {
        this.decorations = RangeSet.of([])
        console.log(update)
        const code = update.view.state.doc.toJSON().join('\n')
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

            this.decorations = Decoration.set(decorations, true)
            setErrorMessage(null)
          } catch (/** @type {any} */ error) {
            setErrorMessage(error.toString())
          }
        } catch (/** @type {any} */ error) {
          setErrorMessage(null)
          const line = update.view.state.doc.line(error.loc.line)
          this.decorations = Decoration.set([
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
    }
  }
  return ViewPlugin.fromClass(
    LiveCodePluginValue,
    {
      decorations: (v) => v.decorations
    }
  )
}
