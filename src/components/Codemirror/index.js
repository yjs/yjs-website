/* eslint-env browser */

/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useRef, useEffect, useState } from 'react'
import styles from './styles.module.css'
import clsx from 'clsx'

import { yCollab, yUndoManagerKeymap } from 'y-codemirror.next'

import { basicSetup, EditorView } from 'codemirror'
import { keymap } from '@codemirror/view'
import { javascript } from '@codemirror/lang-javascript'
import { Compartment, EditorState } from '@codemirror/state'
import { githubDark, githubLight } from '@uiw/codemirror-theme-github'
import { useColorMode } from '@docusaurus/theme-common'

const theme = new Compartment()

/**
 * @typedef {Object} CodemirrorProps
 * @property {import('yjs').Text} ytext
 * @property {string} [initialValue]
 * @property {Array<import('@codemirror/state').Extension>} [plugins]
 * @property {import('y-protocols/awareness').Awareness} [awareness]
 */

/**
 * @param {CodemirrorProps} props
 */
export default ({ initialValue = '', plugins = [], ytext, awareness }) => {
  const ref = useRef(null)
  const [editorView, setEditor] = useState(
    /** @type {EditorView | null} */ (null)
  )
  const { colorMode } = useColorMode()

  if (initialValue && ytext.length === 0) {
    ytext.insert(0, initialValue)
  }

  useEffect(() => {
    const state = EditorState.create({
      doc: ytext.toString(),
      extensions: [
        basicSetup,
        javascript(),
        keymap.of([
          ...yUndoManagerKeymap
        ]),
        yCollab(ytext, awareness || null),
        theme.of(colorMode === 'dark' ? githubDark : githubLight),
        ...plugins
      ]
    })
    const view = new EditorView({
      state,
      parent: /** @type {any} */ (ref.current)
    })
    // disable grammarly
    const cmContent = /** @type {any} */ (ref).current.querySelector('.cm-content')
    cmContent.setAttribute('spellcheck', 'false')
    cmContent.setAttribute('data-gramm', 'false')
    cmContent.setAttribute('data-gramm_editor', 'false')
    cmContent.setAttribute('data-enable-grammarly', 'false')
    setEditor(view)
    return () => {
      view.destroy()
    }
  }, [ref])

  useEffect(() => {
    if (editorView) {
      editorView.dispatch({
        effects: theme.reconfigure(
          colorMode === 'dark' ? githubDark : githubLight
        )
      })
    }
  }, [colorMode])

  return (
    <div
      className={clsx(styles.editorContainer)}
      ref={ref}
    />
  )
}
