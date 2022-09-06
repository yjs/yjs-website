/* eslint-env browser */

/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useContext, useEffect, useState } from 'react'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import * as env from 'lib0/environment'
import { Awareness } from 'y-protocols/awareness'
import * as random from 'lib0/random'

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

const YContext = React.createContext(/** @type {YState | null} */ (null))

/**
 * @typedef {Object} YState
 * @property {string} room
 * @property {Y.Doc} ydoc
 * @property {import('y-protocols/awareness').Awareness} awareness
 * @property {Y.AbstractConnector | null} provider
 */

/**
 * @param {string} room
 */
const initYState = (room) => {
  const ydoc = new Y.Doc({ guid: room })
  const awareness = new Awareness(ydoc)
  const provider = env.isBrowser
    ? new WebsocketProvider('wss://demos.yjs.dev', room, ydoc, { awareness })
    : null
  const updateAwarenessFromLocalstorage = () => {
    console.log('updating from local storage')
    const localstorageUsername = localStorage.getItem('username')
    const awarenessState = awareness.getLocalState()
    if (
      localstorageUsername != null && awarenessState != null &&
      (
        awarenessState.user == null ||
        localstorageUsername !== awarenessState.user.name
      )
    ) {
      awareness.setLocalStateField('user', {
        name: localstorageUsername || 'Anonymous',
        color: userColor.color,
        colorLight: userColor.light
      })
    }
  }
  updateAwarenessFromLocalstorage()
  addEventListener('storage', updateAwarenessFromLocalstorage)

  ydoc.on('destroy', () => {
    removeEventListener('storage', updateAwarenessFromLocalstorage)
  })

  return {
    room,
    ydoc,
    awareness,
    provider
  }
}

/**
 * Note that this component will have memory leaks if it is never mounted.
 *
 * @implements React.Component<{room:string},YState>
 */
export class Provider extends React.Component {
  /**
   * @param {{room: string, children: Array<any>}} props
   */
  constructor (props) {
    super(props)
    this.state = initYState(props.room)
  }

  componentWillUnmount () {
    this.state.ydoc.destroy()
  }

  /**
   * @param {{room: string, children: Array<any>}} nextProps
   */
  UNSAFE_componentWillReceiveProps (nextProps) {
    if (nextProps.room !== this.props.room) {
      this.state.ydoc.destroy()
      this.setState(initYState(nextProps.room))
    }
  }

  componentDidMount () {
    document.documentElement.style.setProperty(
      '--user-color',
      userColor.color
    )
    document.documentElement.style.setProperty(
      '--user-color-light',
      userColor.light
    )
  }

  render () {
    return (
      <YContext.Provider value={this.state}>
        {this.props.children}
      </YContext.Provider>
    )
  }
}

export const YStateConsumer = YContext.Consumer

/**
 * @typedef {Object} AWState
 * @property {number} clientID
 * @property {{ user: { name: string, color: string, colorLight: string } }} state
 * @property {boolean} isLocal
 */

/**
 * @param {Awareness} awareness
 * @return {Array<AWState>}
 */
const computeAwarenessState = (awareness) =>
  Array.from(awareness.getStates().entries()).filter(([_clientID, state]) =>
    state && state.user && state.user.name && state.user.color &&
    state.user.colorLight
  ).map(/** @type {function(any,any):AWState} */ ([clientID, state]) => ({
    clientID,
    state,
    isLocal: awareness.clientID === clientID
  }))

/**
 * @template {AWState} P
 * @param {{children:function(Array<P | Object>):React.ReactElement}} props
 */
export const YAwarenessStateConsumer = ({ children }) => {
  const { awareness } = /** @type {YState} */ (useContext(YContext))
  const [aw, setAwarenessState] = useState(computeAwarenessState(awareness))
  useEffect(() => {
    const awarenessListener = () =>
      setAwarenessState(computeAwarenessState(awareness))
    awareness.on('change', awarenessListener)
    return () => {
      awareness.off('change', awarenessListener)
    }
  })
  // @todo check whether children are recreated on every render
  return children(aw)
}
