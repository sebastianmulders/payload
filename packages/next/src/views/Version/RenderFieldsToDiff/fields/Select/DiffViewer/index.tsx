'use client'
import React from 'react'
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer-continued'

export const DiffViewer: React.FC<{
  comparisonToRender: string
  diffMethod: string
  diffStyles: any
  placeholder: string
  versionToRender: string
}> = ({ comparisonToRender, diffMethod, diffStyles, placeholder, versionToRender }) => {
  return (
    <ReactDiffViewer
      compareMethod={DiffMethod[diffMethod]}
      hideLineNumbers
      newValue={typeof versionToRender !== 'undefined' ? versionToRender : placeholder}
      oldValue={comparisonToRender}
      showDiffOnly={false}
      splitView
      styles={diffStyles}
    />
  )
}
