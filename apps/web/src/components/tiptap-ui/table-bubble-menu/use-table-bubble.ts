import { useTiptapEditor } from "@/hooks/use-tiptap-editor";
import { findParentNode, posToDOMRect, type Editor } from "@tiptap/core";
import React from "react";
import { CellSelection } from "@tiptap/pm/tables";
import type { Node as PMNode } from "@tiptap/pm/model";

/**
 * Return true if editor is inside a table.
 * Kept as a small helper in case detection logic changes later.
 */
function editorIsInTable(editor?: Editor | null) {
  return (
    !!editor &&
    typeof editor.isActive === "function" &&
    editor.isActive("table")
  );
}

/**
 * Find the table parent node entry `{ node, pos, start }` or null.
 */
function findTableParent(editor?: Editor | null) {
  if (!editor) return null;

  const res = findParentNode((node) => node.type.name === "table")(
    editor.state.selection,
  );
  // res contains { node, pos, start } when found
  return res ?? null;
}

/**
 * Find cell node and its position (closest ancestor that is a tableCell/tableHeader).
 */
function findCellNodeFromSelection(editor?: Editor | null) {
  if (!editor) return null;
  const { state } = editor;
  const { selection } = state;
  let $pos = selection.$from;

  for (let depth = $pos.depth; depth > 0; depth--) {
    const node = $pos.node(depth);
    if (!node) continue;
    const typeName = node.type?.name;
    if (typeName === "tableCell" || typeName === "tableHeader") {
      // compute absolute pos of that node's start
      const nodeStart = $pos.start(depth);
      return { node: node as PMNode, pos: nodeStart };
    }
  }

  // fallback: try nodeAt the selection.from
  try {
    const maybe = state.doc.nodeAt(selection.from);
    if (
      maybe &&
      (maybe.type.name === "tableCell" || maybe.type.name === "tableHeader")
    ) {
      return { node: maybe as PMNode, pos: selection.from };
    }
  } catch {
    // ignore
  }

  return null;
}

interface InsertTableOptions {
  rows?: number;
  cols?: number;
  withHeaderRow?: boolean;
}

export type UseTableBubbleConfig = {
  editor?: Editor | null;
};

export function useTableBubble(config?: UseTableBubbleConfig) {
  const { editor: providedEditor } = config || {};
  const { editor } = useTiptapEditor(providedEditor);

  // visible only when inside a table (effect will update)
  const [isVisible, setIsVisible] = React.useState<boolean>(false);
  const isActive = editorIsInTable(editor);

  // update visibility on selection/focus/transaction changes
  React.useEffect(() => {
    if (!editor) {
      setIsVisible(false);
      return;
    }

    const update = () => {
      // show only when inside a table (you can refine: && editor.isEditable && editor.view.hasFocus())
      setIsVisible(editorIsInTable(editor));
    };

    // initial
    update();

    // subscribe to selection updates and focus events
    editor.on("selectionUpdate", update);
    editor.on("transaction", update); // keep synced after transformations
    editor.view?.dom?.addEventListener?.("focus", update);
    editor.view?.dom?.addEventListener?.("blur", update);

    return () => {
      editor.off("selectionUpdate", update);
      editor.off("transaction", update);
      editor.view?.dom?.removeEventListener?.("focus", update);
      editor.view?.dom?.removeEventListener?.("blur", update);
    };
  }, [editor]);

  /**
   * Returns a virtual element (DOMRect-like) that points to the current table in the editor.
   * Safe: returns null if DOM mapping fails.
   */
  const getReferencedVirtualElement = React.useCallback(() => {
    if (!editor) return null;
    const parentNode = findTableParent(editor);
    if (!parentNode) return null;

    try {
      const from = parentNode.start;
      const to = parentNode.start + parentNode.node.nodeSize - 1;
      const domRect = posToDOMRect(editor.view, from, to);
      if (!domRect) return null;
      return {
        getBoundingClientRect: () => domRect,
        getClientRects: () => [domRect],
      };
    } catch {
      return null;
    }
  }, [editor]);

  /* -------------------------
     Capability checks/helpers
     ------------------------- */

  // selection shorthand
  const selection = editor?.state.selection;

  // detect CellSelection (used for merging)
  const isCellSelection = React.useMemo(() => {
    if (!selection) return false;
    return selection instanceof CellSelection;
  }, [selection]);

  // currently selected/active cell node (for split detection)
  const currentCell = React.useMemo(
    () => findCellNodeFromSelection(editor),
    [editor, selection],
  );

  // get attrs for current cell (safely)
  const currentCellAttrs = (currentCell?.node?.attrs ?? {}) as {
    colspan?: number;
    rowspan?: number;
  };

  // canMerge: true when selection is a CellSelection with more than one cell
  const canMerge = React.useMemo(() => {
    if (!editor) return false;
    if (isCellSelection) {
      // CellSelection has .$anchorCell and .$headCell; but simpler: ranges length > 1 indicates multiple cells
      try {
        // @ts-ignore - prosemirror CellSelection shape
        const ranges = (selection as any)?.ranges ?? [];
        return (
          ranges.length > 1 ||
          Boolean(
            (selection as any)?.$anchorCell &&
            (selection as any)?.$headCell &&
            (selection as any).$anchorCell.pos !==
              (selection as any).$headCell.pos,
          )
        );
      } catch {
        return true;
      }
    }
    return false;
  }, [editor, isCellSelection, selection]);

  // canSplit: true if current cell has colspan>1 or rowspan>1 (i.e., merged)
  const canSplit = React.useMemo(() => {
    if (!currentCell) return false;
    const cols = Number(currentCellAttrs.colspan || 1);
    const rows = Number(currentCellAttrs.rowspan || 1);
    return cols > 1 || rows > 1;
  }, [currentCell, currentCellAttrs]);

  // generic "editor.can()" checks where possible (safer)
  const editorCan = React.useCallback(
    (commandName: string) => {
      if (!editor || typeof (editor as any).can !== "function") return false;
      try {
        // editor.can().<command>() is how tiptap exposes it, but we cannot call dynamic property easily.
        // we call editor.can() then try to run the corresponding chained command in a dry-run style:
        // Use editor.can().chain()?.<cmd>() would be ideal, but tiptap's `can()` returns a chainable proxy - we can attempt to call it dynamically.
        // Safer alternative: attempt to call `editor.can().<commandName>()` using bracket.
        const canApi = (editor as any).can();
        if (!canApi) return false;
        const fn = canApi[commandName];
        if (typeof fn === "function") {
          return fn.call(canApi);
        }
      } catch {
        // ignore and fallthrough
      }
      return false;
    },
    [editor],
  );

  const canAddColumn = React.useMemo(
    () =>
      editorIsInTable(editor) &&
      (editorCan("addColumnAfter") || editorCan("addColumnBefore")),
    [editor, editorCan],
  );
  const canDeleteColumn = React.useMemo(
    () => editorIsInTable(editor) && editorCan("deleteColumn"),
    [editor, editorCan],
  );
  const canAddRow = React.useMemo(
    () =>
      editorIsInTable(editor) &&
      (editorCan("addRowAfter") || editorCan("addRowBefore")),
    [editor, editorCan],
  );
  const canDeleteRow = React.useMemo(
    () => editorIsInTable(editor) && editorCan("deleteRow"),
    [editor, editorCan],
  );
  const canDeleteTable = React.useMemo(
    () => editorIsInTable(editor) && editorCan("deleteTable"),
    [editor, editorCan],
  );
  const canNavigateCells = React.useMemo(
    () =>
      editorIsInTable(editor) &&
      (editorCan("goToNextCell") || editorCan("goToPreviousCell")),
    [editor, editorCan],
  );
  const canFixTables = React.useMemo(
    () => editorIsInTable(editor) && editorCan("fixTables"),
    [editor, editorCan],
  );
  const canSetCellAttribute = React.useMemo(
    () => editorIsInTable(editor) && editorCan("setCellAttribute"),
    [editor, editorCan],
  );
  const canToggleHeader = React.useMemo(
    () =>
      editorIsInTable(editor) &&
      (editorCan("toggleHeaderCell") ||
        editorCan("toggleHeaderColumn") ||
        editorCan("toggleHeaderRow")),
    [editor, editorCan],
  );

  /* -------------------------
     Command wrappers (safe)
     ------------------------- */

  const safeRun = React.useCallback((fn?: () => any) => {
    try {
      fn?.();
    } catch (e) {
      // swallow so UI won't crash; optionally: console.warn(e)
      // console.warn("table bubble command failed", e);
    }
  }, []);

  const insertTable = React.useCallback(
    (options?: InsertTableOptions) => {
      if (!editor) return;
      safeRun(() => editor.chain().focus().insertTable(options).run());
    },
    [editor, safeRun],
  );

  const addColumnBefore = React.useCallback(() => {
    if (!editor) return;
    safeRun(() => editor.chain().focus().addColumnBefore().run());
  }, [editor, safeRun]);

  const addColumnAfter = React.useCallback(() => {
    if (!editor) return;
    safeRun(() => editor.chain().focus().addColumnAfter().run());
  }, [editor, safeRun]);

  const deleteColumn = React.useCallback(() => {
    if (!editor) return;
    safeRun(() => editor.chain().focus().deleteColumn().run());
  }, [editor, safeRun]);

  const addRowBefore = React.useCallback(() => {
    if (!editor) return;
    safeRun(() => editor.chain().focus().addRowBefore().run());
  }, [editor, safeRun]);

  const addRowAfter = React.useCallback(() => {
    if (!editor) return;
    safeRun(() => editor.chain().focus().addRowAfter().run());
  }, [editor, safeRun]);

  const deleteRow = React.useCallback(() => {
    if (!editor) return;
    safeRun(() => editor.chain().focus().deleteRow().run());
  }, [editor, safeRun]);

  const deleteTable = React.useCallback(() => {
    if (!editor) return;
    safeRun(() => editor.chain().focus().deleteTable().run());
  }, [editor, safeRun]);

  const mergeCells = React.useCallback(() => {
    if (!editor) return;
    safeRun(() => editor.chain().focus().mergeCells().run());
  }, [editor, safeRun]);

  const splitCell = React.useCallback(() => {
    if (!editor) return;
    safeRun(() => editor.chain().focus().splitCell().run());
  }, [editor, safeRun]);

  const mergeOrSplit = React.useCallback(() => {
    if (!editor) return;
    safeRun(() => editor.chain().focus().mergeOrSplit().run());
  }, [editor, safeRun]);

  const toggleHeaderColumn = React.useCallback(() => {
    if (!editor) return;
    safeRun(() => editor.chain().focus().toggleHeaderColumn().run());
  }, [editor, safeRun]);

  const toggleHeaderRow = React.useCallback(() => {
    if (!editor) return;
    safeRun(() => editor.chain().focus().toggleHeaderRow().run());
  }, [editor, safeRun]);

  const toggleHeaderCell = React.useCallback(() => {
    if (!editor) return;
    safeRun(() => editor.chain().focus().toggleHeaderCell().run());
  }, [editor, safeRun]);

  const setCellAttribute = React.useCallback(
    (name: string, value: any) => {
      if (!editor) return;
      safeRun(() => editor.chain().focus().setCellAttribute(name, value).run());
    },
    [editor, safeRun],
  );

  const fixTables = React.useCallback(() => {
    if (!editor) return;
    safeRun(() => editor.chain().focus().fixTables().run());
  }, [editor, safeRun]);

  const goToNextCell = React.useCallback(() => {
    if (!editor) return;
    safeRun(() => editor.chain().focus().goToNextCell().run());
  }, [editor, safeRun]);

  const goToPreviousCell = React.useCallback(() => {
    if (!editor) return;
    safeRun(() => editor.chain().focus().goToPreviousCell().run());
  }, [editor, safeRun]);

  /* -------------------------
     Return API
     ------------------------- */
  return {
    // visibility + active
    isVisible,
    isActive,

    // positioning helper for bubble
    getReferencedVirtualElement,

    // commands
    insertTable,
    addColumnAfter,
    addColumnBefore,
    addRowAfter,
    addRowBefore,
    mergeCells,
    mergeOrSplit,
    splitCell,
    deleteColumn,
    deleteRow,
    deleteTable,
    goToNextCell,
    goToPreviousCell,
    fixTables,
    setCellAttribute,
    toggleHeaderCell,
    toggleHeaderColumn,
    toggleHeaderRow,

    // computed capabilities for UI
    // these make it simple for the menu to enable/disable buttons and show helpful tooltips
    canMerge,
    canSplit,
    canAddColumn,
    canDeleteColumn,
    canAddRow,
    canDeleteRow,
    canDeleteTable,
    canNavigateCells,
    canFixTables,
    canSetCellAttribute,
    canToggleHeader,
  } as const;
}
