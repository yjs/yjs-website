// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github')
const darkCodeTheme = require('prism-react-renderer/themes/dracula')
const socialLink = require('./src/remark/social-link')
const liveCode = require('./src/remark/live-code')

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Yjs',
  tagline: 'Build local-first collaborative software',
  url: 'https://yjs.dev',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'yjs', // Usually your GitHub org/user name.
  projectName: 'yjs-website', // Usually your repo name.

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en']
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: 'https://github.com/yjs/yjs-website/tree/main/pages/',
          remarkPlugins: [socialLink, liveCode]
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css')
        }
      })
    ]
  ],

  themes: ['@docusaurus/theme-live-codeblock'],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'Yjs Docs',
        logo: {
          alt: 'Yjs Logo',
          src: 'logo/yjs.png'
        },
        items: [
          {
            type: 'doc',
            docId: 'introduction',
            position: 'left',
            label: 'Docs'
          },
          {
            href: 'https://github.com/sponsors/dmonad',
            label: 'Support',
            position: 'right'
          },
          {
            href: 'https://discuss.yjs.dev',
            label: 'Forum',
            position: 'right'
          },
          {
            href: 'https://github.com/yjs/yjs',
            label: 'GitHub',
            position: 'right'
          }
        ]
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Tutorial',
                to: '/docs/introduction'
              }
            ]
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Chat',
                href: 'https://gitter.im/Yjs/community'
              },
              {
                label: 'Twitter',
                href: 'https://twitter.com/kevin_jahns'
              }
            ]
          },
          {
            title: 'More',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/yjs/yjs'
              }
            ]
          }
        ]
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme
      }
    })
}

module.exports = config
