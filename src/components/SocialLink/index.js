/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react'
import Link from '@docusaurus/Link'
import styles from './styles.module.css'
import clsx from 'clsx'

function CardContainer ({ href, children }) {
  return (
    <Link
      href={href}
      className={clsx('card', 'padding--md', styles.cardContainer)}
    >
      {children}
    </Link>
  )
}

export default ({ href, image, description, title }) => {
  return (
    <CardContainer href={href}>
      <div className={clsx('avatar')}>
        <div
          className={clsx('avatar__photo', 'avatar__photo--md', styles.logo)}
        >
          <img
            alt={title + ' - Logo'}
            src={image}
          />
        </div>
        <div className={clsx('avatar__intro')}>
          <div
            className={clsx('avatar__name', styles.cardTitle)}
          >
            {title}
          </div>
          {description && (
            <small
              className={clsx(
                'avatar__subtitle',
                styles.cardDescription
              )}
            >
              {description}
            </small>
          )}
        </div>
      </div>
    </CardContainer>
  )
}
