import React from "react"
import { BaseElement, BaseText } from "slate"

export type $RenderElementProps<$Element extends BaseElement> = {
  children: any
  element: $Element
  attributes: {
    "data-slate-node": "element"
    "data-slate-inline"?: true
    "data-slate-void"?: true
    dir?: "rtl"
    ref: any
  }
}

export type $RenderLeafProps<$Text extends BaseText> = {
  children: any
  leaf: $Text
  text: $Text
  /**
   * Removed from the props given because we don't want the user to add it
   * themselves.
   */
  // attributes: {
  //   "data-slate-leaf": true
  // }
}
