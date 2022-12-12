import {
  Descendant,
  Editor,
  Element,
  NodeEntry,
  Path,
  Text,
  Transforms,
} from "slate"
export * from "./types"

import {
  createHotkeyHandler,
  createPlugin,
  getLines,
  matchElement,
  matchEndOfElement,
  matchStartOfElement,
} from "~/src/sink"

import { createTableMethods } from "./methods"
import { normalizeTableIndexes } from "./normalize/normalize-table"
import { renderElement } from "./render-element"
import {
  TableCellElement,
  TableContentElement,
  TableElement,
  TableRowElement,
} from "./types"

type TableMethods = ReturnType<typeof createTableMethods>

export type TableEditor = {
  supportsTable: true
  tablePlugin: TableMethods
}

export type TablePluginCustomTypes = {
  Name: "table"
  Editor: TableEditor
  Element:
    | TableElement
    | TableRowElement
    | TableCellElement
    | TableContentElement
}

export const TablePlugin = () =>
  createPlugin<TablePluginCustomTypes>((editor) => {
    editor.supportsTable = true
    const p = (editor.tablePlugin = createTableMethods(editor))
    return {
      name: "table",
      editor: {
        deleteBackward: () => {
          /**
           * If we're at start of a cell, disable delete backward
           */
          return !!matchStartOfElement(editor, "table-cell")
        },
        deleteForward: () => {
          /**
           * If we're at end of a cell, disable delete forward
           */
          return !!matchEndOfElement(editor, "table-cell")
        },
        insertBreak: () => {
          /**
           * IF we're anywhere in a table cell, disable insertBreak
           */
          const entry = matchElement(editor, "table-cell")
          return !!entry
        },
        isInline(element) {
          if (
            ["table", "table-row", "table-cell", "table-content"].includes(
              element.type
            )
          )
            return false
        },
        isVoid(element) {
          if (["table", "table-row", "table-cell"].includes(element.type))
            return false
        },
        isInvalidProp() {
          /* noop */
        },
        // isDependant(element) {
        //   if (["table-row", "table-cell"].includes(element.type)) {
        //     return true
        //   } else if (["table"].includes(element.type)) {
        //     return false
        //   }
        // },
        normalizeNode: (entry): boolean => {
          const [node] = entry
          if (!Element.isElement(node)) return false
          switch (node.type) {
            case "table":
              return normalizeTableIndexes(
                editor,
                entry as NodeEntry<TableElement>
              )
            case "table-cell": {
              if (
                node.children.length === 1 &&
                node.children[0].type === "table-content"
              ) {
                return false
              }
              const lines = getLines(editor, node.children)
              const line = ([] as Descendant[]).concat(...lines)
              const tableContentElement: TableContentElement = {
                type: "table-content",
                children: line,
              }
              Editor.withoutNormalizing(editor, () => {
                Transforms.removeNodes(editor, { at: entry[1] })
                Transforms.insertNodes(
                  editor,
                  {
                    type: "table-cell",
                    children: [tableContentElement],
                  },
                  { at: entry[1] }
                )
              })
              return true
            }
          }
          return false
        },
      },
      editableProps: {
        renderElement,
        onKeyDown: createHotkeyHandler({
          /**
           * navigation
           */
          tab: p.tabForward,
          "shift+tab": p.tabBackward,
          down: p.down,
          up: p.up,
          /**
           * insert
           */
          "mod+shift+enter": () => p.insertRow({ offset: 0 }),
          "mod+enter": () => p.insertRow({ offset: 1 }),
          "super+[": () => p.insertColumn({ offset: 0 }),
          "super+]": () => p.insertColumn({ offset: 1 }),
          /**
           * remove
           */
          "super+backspace": p.removeTable,
          "mod+backspace": p.removeRow,
          "mod+shift+backspace": p.removeColumn,
        }),
      },
    }
  })
