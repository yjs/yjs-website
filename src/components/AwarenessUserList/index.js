/* eslint-env browser */

/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react'
import styles from './styles.module.css'
import clsx from 'clsx'
import { YAwarenessStateConsumer } from '../YContext'

export default () => (
  <YAwarenessStateConsumer>
    {(aw) => (
      <div className={clsx(styles.userlist)} y-show='true'>
        {aw.map(
          (s) => (
            <div
              key={s.clientID}
              y-islocaluser={s.isLocal.toString()}
              style={{
                backgroundColor: s.state.user.colorLight,
                borderColor: s.state.user.color
              }}
            >
              {s.state.user.name}
            </div>
          )
        )}
      </div>
    )}
  </YAwarenessStateConsumer>
)
