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
import * as math from 'lib0/math'
import BrowserOnly from '@docusaurus/BrowserOnly'

/**
 * @typedef {Object} CursorState
 * @property {number} clientid
 * @property {string} name
 * @property {string} color
 * @property {string} colorLight
 * @property {{x:number,y:number}} introMouse
 */

/**
 * @param {{awareness: import('y-protocols/awareness').Awareness}} props
 */
export default ({ awareness }) => {
  const [userName, setUserName] = useState(
    localStorage.getItem('username') || 'Anonymous'
  )
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
          clientid !== awareness.clientID && state.introMouse != null &&
          state.user != null && state.user.name != null &&
          state.user.color != null && state.user.colorLight != null &&
          state.introMouse.x && state.introMouse.y
        ).map(([clientid, state]) => ({
          clientid,
          name: state.user.name,
          color: state.user.color,
          colorLight: state.user.colorLight,
          introMouse: state.introMouse
        }))
      setCursors(cursorStates)
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
    localStorage.setItem('username', event.target.value)
    setUserName(event.target.value)
    const localAwState = awareness.getLocalState()
    if (
      localAwState && localAwState.user && localAwState.user.color &&
      localAwState.user.colorLight
    ) {
      awareness.setLocalStateField('user', {
        name: event.target.value || 'Anonymous',
        color: localAwState.user.color,
        colorLight: localAwState.user.colorLight
      })
    }
  }

  /**
   * @type {React.MouseEventHandler<HTMLDivElement>}
   */
  const onMouseMove = (event) => {
    const infoRect = /** @type {HTMLDivElement} */ (event.target)
      .getBoundingClientRect()
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
