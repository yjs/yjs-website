import React from 'react'
import clsx from 'clsx'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import Layout from '@theme/Layout'
import HomepageFeatures from '@site/src/components/HomepageFeatures'
import DemoIntro from '@site/src/components/DemoIntro'
import BrowserOnly from '@docusaurus/BrowserOnly'

import styles from './index.module.css'

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
      <BrowserOnly>
        {DemoIntro}
      </BrowserOnly>
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  )
}
