import React from 'react'

import {
  findSidebarCategory,
  useDocsSidebar
  // @ts-ignore
} from '@docusaurus/theme-common/internal'
import DocCardList from '@theme/DocCardList'

/**
 * @param {string} label
 */
export const useSidebarCategory = (label) => {
  const sidebar = useDocsSidebar()
  if (!sidebar) {
    throw new Error('Unexpected: cant find current sidebar in context')
  }
  console.log({ label, sidebar })
  const category = findSidebarCategory(
    sidebar.items,
    (item) => item.label === label
  )
  if (!category) {
    throw new Error(
      'is not associated with a category. useCurrentSidebarCategory() should only be used on category index pages.'
    )
  }
  return category
}

/**
 * @param {{label: string}} opts
 */
export const ListCategoryItems = ({ label }) => (
  <DocCardList items={useSidebarCategory(label).items} />
)
