import { Dispatch, FunctionComponent, SetStateAction } from "react"

export type Modal<T extends Record<string, unknown> = Record<string, unknown>> =
  {
    /**
     * The `type` identifies the use case for the modal and is special in that
     * only one modal can be open for each type.
     *
     * For example, let's say a user opens a tooltip then opens another tooltip.
     * The first opened tooltip will automatically be closed. This reflects how
     * user interface usually work in that only one of each type of Modal can
     * be opened at a time but modals at different levels can be open at the same
     * time like a pop up form and a tooltip for a component in the popup form.
     *
     * Examples of different types are:
     *
     * - toolbar
     * - dialog box
     * - error box
     */
    type: string
    /**
     * The React Component (currently supported as only a FunctionComponent)
     * to render.
     */
    Component: FunctionComponent<T>
    /**
     * The Props to be passed to the FunctionComponent
     */
    props: T
  }

/**
 * A Lookup Record that contains all the currently opened Compnent objects.
 *
 * NOTE:
 *
 * The structure is designed such that only one Component object can exist at
 * any given key. The `key` represents the `type` of the Modal. So, for example,
 * only one "tooltip" type can be open at once.
 */
export type ModalsRecord = Record<string, Modal>

/**
 * The value of the `ModalsContext` that is passed around.
 *
 * NOTE:
 *
 * This is an implementation detail and wouldn't be used directly. Instead,
 * the interface to this library should be through the `useModal` method.
 */
export type ModalsContextValue = {
  modals: ModalsRecord
  setModals: Dispatch<SetStateAction<ModalsRecord>>
}
