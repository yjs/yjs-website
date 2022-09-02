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

import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'

import { yCollab, yUndoManagerKeymap } from 'y-codemirror.next'

import { basicSetup, EditorView } from 'codemirror'
import { keymap } from '@codemirror/view'
import { javascript } from '@codemirror/lang-javascript'
// import { oneDark } from '@codemirror/next/theme-one-dark'

import * as random from 'lib0/random'
import { EditorState } from '@codemirror/state'

export const usercolors = [
  { color: '#30bced', light: '#30bced33' },
  { color: '#6eeb83', light: '#6eeb8333' },
  { color: '#ffbc42', light: '#ffbc4233' },
  { color: '#ecd444', light: '#ecd44433' },
  { color: '#ee6352', light: '#ee635233' },
  { color: '#9ac2c9', light: '#9ac2c933' },
  { color: '#8acb88', light: '#8acb8833' },
  { color: '#1be7ff', light: '#1be7ff33' }
]

export const userColor = usercolors[random.uint32() % usercolors.length]

const ydoc = new Y.Doc()
let provider = null
let awareness = null

const getUserName = () => {
  if (!env.isBrowser) {
    return 'Anonymous'
  }
  if (localStorage.getItem('username') == null) {
    localStorage.setItem(
      'username',
      `User ${ydoc.clientID.toString().slice(-4)}`
    )
  }
  return localStorage.getItem('username') || 'Anonymous'
}

if (env.isBrowser) {
  provider = new WebsocketProvider(
    'wss://demos.yjs.dev',
    'yjs-website-beta',
    ydoc
  )
  awareness = provider.awareness
  awareness.setLocalStateField('user', {
    name: getUserName(),
    color: userColor.color,
    colorLight: userColor.light
  })
}

export default ({ height = '100%' }) => {
  const ref = useRef(null)
  useEffect(() => {
    console.log(env.isBrowser)
    if (!env.isBrowser) {
      return
    }
    const ytext = ydoc.getText()
    const state = EditorState.create({
      doc: ytext.toString(),
      extensions: [
        keymap.of([
          ...yUndoManagerKeymap
        ]),
        basicSetup,
        javascript(),
        EditorView.lineWrapping,
        yCollab(ytext, provider.awareness)
        // oneDark
      ]
    })
    const view = new EditorView({
      state,
      parent: /** @type {any} */ (ref.current)
    })
    console.log(view, ref)
    return () => {
      view.destroy()
    }
  })

  return (
    <div
      className={clsx(styles.editorContainer)}
      ref={ref}
      style={{ height }}
    />
  )
}
