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
import * as math from 'lib0/math'
import { WebsocketProvider } from 'y-websocket'
import * as random from 'lib0/random.js'
import BrowserOnly from '@docusaurus/BrowserOnly'

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

const ydoc = new Y.Doc()
let provider = null
let awareness = null
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

/**
 * @typedef {Object} CursorState
 * @property {number} clientid
 * @property {string} name
 * @property {string} color
 * @property {string} colorLight
 * @property {{x:number,y:number}} introMouse
 */

export default () => {
  const [userName, setUserName] = useState(getUserName())
  const [cursors, setCursors] = useState(
    /** @type {Array<CursorState>} */ ([])
  )
  /**
   * @type {React.MutableRefObject<HTMLDivElement|null>}
   */
  const infoRef = useRef(null)
  useEffect(() => {
    const awarenessListener = () => {
      const cursorStates = Array.from(awareness.getStates().entries())
        .filter(([clientid, state]) =>
          clientid !== ydoc.clientID && state.introMouse != null &&
          state.introMouse.x && state.introMouse.y
        ).map(([clientid, state]) => ({
          clientid,
          name: state.user.name,
          color: state.user.color,
          colorLight: state.user.colorLight,
          introMouse: state.introMouse
        }))
      setCursors(cursorStates)
      document.documentElement.style.setProperty(
        '--user-color',
        userColor.color
      )
      document.documentElement.style.setProperty(
        '--user-color-light',
        userColor.light
      )
    }
    awareness && awareness.on('change', awarenessListener)
    return () => {
      awareness && awareness.off('change', awarenessListener)
    }
  })

  /**
   * @type {React.ChangeEventHandler<any>}
   */
  const onInputChange = (event) => {
    setUserName(event.target.value)
    localStorage.setItem('username', event.target.value)
  }

  if (awareness) {
    const localState = awareness.getLocalState()
    if (
      localState == null || localState.user == null ||
      localState.user.name !== userName
    ) {
      awareness.setLocalStateField('user', {
        name: userName,
        color: userColor.color,
        colorLight: userColor.light
      })
    }
  }

  /**
   * @type {React.MouseEventHandler<HTMLDivElement>}
   */
  const onMouseMove = (event) => {
    const infoRect = /** @type {HTMLDivElement} */ (event.target).getBoundingClientRect()
    // compute x relative to infoRect and relative to dimension
    const x = (event.clientX - infoRect.left) / infoRect.width
    const y = (event.clientY - infoRect.top) / infoRect.height
    awareness.setLocalStateField('introMouse', { x, y })
  }

  /**
   * @type {React.MouseEventHandler<HTMLDivElement>}
   */
  const onMouseLeave = (_event) => {
    awareness.setLocalStateField('introMouse', null)
  }

  const infoRect = infoRef.current && infoRef.current.getBoundingClientRect()

  return (
    <BrowserOnly fallback={<div className={clsx(styles.intro)} />}>
      {() => (
        <div
          className={clsx(styles.intro)}
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
          ref={infoRef}
        >
          <div className={clsx(styles.namePicker)}>
            Your name:
            <div className={clsx(styles.colorpicker)} />
            <input
              type='text'
              placeholder='Anonymous'
              maxLength={25}
              spellCheck='false'
              value={userName}
              onChange={onInputChange}
            />
          </div>
          <div className={clsx(styles.cursors)}>
            {infoRect && cursors.map((state) => (
              <div
                key={state.clientid}
                style={{
                  transform: `translate(${
                    math.floor(state.introMouse.x * infoRect.width)
                  }px,${math.floor(state.introMouse.y * infoRect.height)}px)`,
                  backgroundColor: state.color
                }}
              />
            ))}
          </div>
        </div>
      )}
    </BrowserOnly>
  )
}
