import React from 'react'
import clsx from 'clsx'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import Layout from '@theme/Layout'
import HomepageFeatures from '../components/HomepageFeatures'
import DemoIntro from '../components/DemoIntro'
import EditorCodemirror from '../components/EditorCodemirror'
import * as YContext from '../components/YContext'

import styles from './index.module.css'
import AwarenessUserList from '../components/AwarenessUserList'

function HomepageHeader () {
  const { siteConfig } = useDocusaurusContext()
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className='container'>
        <h2 className='hero__title'>{siteConfig.tagline}</h2>
      </div>
    </header>
  )
}

export default function Home () {
  const { siteConfig } = useDocusaurusContext()
  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description='Description will go into a meta tag in <head />'
    >
      <YContext.Provider room='home'>
        <section style={{ position: 'relative' }}>
          <YContext.YStateConsumer>
            {(ystate) => (
              <DemoIntro awareness={/** @type {any} */ (ystate).awareness} />
            )}
          </YContext.YStateConsumer>
          <AwarenessUserList />
        </section>
      </YContext.Provider>
      <HomepageHeader />
      <main>
        <HomepageFeatures />
        <section>
          <div
            className={clsx(
              'card',
              'container',
              'padding--md',
              'margin-vert--lg',
              styles.Cm6Demo
            )}
          >
            <div className={clsx('card__header')}>
              <h3>CodeMirror editor demo</h3>
            </div>
            <div className={clsx('card__body')}>
              <EditorCodemirror height='35vh' />
            </div>
          </div>
        </section>
      </main>
    </Layout>
  )
}
