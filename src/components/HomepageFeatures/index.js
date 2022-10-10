import React from 'react'
import clsx from 'clsx'
import styles from './styles.module.css'

const FeatureList = [
  {
    title: 'Automatic Synchronization',
    Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
    description: (
      <>
        Yjs implements a highly optimized CRDT that syncs{' '}
        <strong>shared data types</strong>{' '}
        automatically with other peers without merge conflicts.
      </>
    )
  },
  {
    title: 'Rich Ecosystem',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    description: (
      <>
        We work together with other projects to provide collaborative features
        based on Yjs.
      </>
    )
  },
  {
    title: 'Network Agnostic',
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    description: (
      <>
        You specify how you want to share data with other peers. Yjs syncs over
        existing networking stacks (e.g.{' '}
        <a href='https://github.com/YousefED/Matrix-CRDT'>Matrix</a>), over a
        websocket server, or completely peer-to-peer via WebRTC.
      </>
    )
  },
  {
    title: 'Unmatched Performance',
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    description: (
      <>
        Yjs is the{' '}
        <a href='https://github.com/dmonad/crdt-benchmarks'>fastest</a>{' '}
        CRDT implementation, by far.
      </>
    )
  },
  {
    title: 'Language Ports',
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    description: (
      <>
        Yjs can be used in many other programming languages. It is just one of
        many compatible implementations of the{' '}
        <a href='https://github.com/y-crdt'>y-crdt</a>.
      </>
    )
  },
  {
    title: 'Open Source',
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    description: (
      <>
        The Yjs ecosystem is open-source and funded by our awesome community.
        Support us on{' '}
        <a href='https://github.com/sponsors/dmonad'> GitHub Sponsors </a>{' '}
        or <a href='https://opencollective.com/y-collective'>OpenCollective</a>.
      </>
    )
  }
]

function Feature ({ Svg, title, description }) {
  return (
    <div className={clsx('col col--4')}>
      <div className='text--center'>
        <Svg className={styles.featureSvg} role='img' />
      </div>
      <div className='text--center padding-horiz--md'>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  )
}

export default function HomepageFeatures () {
  return (
    <section className={styles.features}>
      <div className='container'>
        <div className='row'>
          {FeatureList.map((props, idx) => <Feature key={idx} {...props} />)}
        </div>
      </div>
    </section>
  )
}
