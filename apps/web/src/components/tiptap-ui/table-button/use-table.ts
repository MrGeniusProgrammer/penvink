"use client";

import { useCallback, useEffect, useState } from "react";
import { isNodeEmpty, type Editor } from "@tiptap/react";
import { NodeSelection, TextSelection } from "@tiptap/pm/state";

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor";

// --- Icons ---
import { TableIcon } from "@/components/tiptap-icons/table-icon";

// --- UI Utils ---
import {
  findNodePosition,
  getSelectedBlockNodes,
  isNodeInSchema,
  isNodeTypeSelected,
  isValidPosition,
  selectionWithinConvertibleTypes,
} from "@/lib/tiptap-utils";

export const TABLE_SHORTCUT_KEY = "mod+shift+b";

/**
 * Configuration for the table functionality
 */
export interface UseTableConfig {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null;
  /**
   * Whether the button should hide when table is not available.
   * @default false
   */
  hideWhenUnavailable?: boolean;
  /**
   * Callback function called after a successful toggle.
   */
  onToggled?: () => void;
}

/**
 * Checks if table can be toggled in the current editor state
 */
export function canToggleTable(
  editor: Editor | null,
  turnInto: boolean = true,
): boolean {
  if (!editor || !editor.isEditable) return false;
  if (!isNodeInSchema("table", editor)) return false;

  if (!turnInto) {
    return editor.can().toggleWrap("table");
  }

  // Either we can wrap in table directly on the selection,
  // or we can clear formatting/nodes to arrive at a table.
  return editor.can().toggleWrap("table") || editor.can().clearNodes();
}

/**
 * Toggles table formatting for a specific node or the current selection
 */
export function toggleTable(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false;
  if (!canToggleTable(editor)) return false;

  try {
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();

    return true;
  } catch {
    return false;
  }
}

/**
 * Determines if the table button should be shown
 */
export function shouldShowButton(props: {
  editor: Editor | null;
  hideWhenUnavailable: boolean;
}): boolean {
  const { editor, hideWhenUnavailable } = props;

  if (!editor || !editor.isEditable) return false;

  if (!hideWhenUnavailable) {
    return true;
  }

  if (!isNodeInSchema("table", editor)) return false;

  if (!editor.isActive("code")) {
    return canToggleTable(editor);
  }

  return true;
}

/**
 * Custom hook that provides table functionality for Tiptap editor
 *
 * @example
 * ```tsx
 * // Simple usage - no params needed
 * function MySimpleTableButton() {
 *   const { isVisible, handleToggle, isActive } = useTable()
 *
 *   if (!isVisible) return null
 *
 *   return <button onClick={handleToggle}>Table</button>
 * }
 *
 * // Advanced usage with configuration
 * function MyAdvancedTableButton() {
 *   const { isVisible, handleToggle, label, isActive } = useTable({
 *     editor: myEditor,
 *     hideWhenUnavailable: true,
 *     onToggled: () => console.log('Table toggled!')
 *   })
 *
 *   if (!isVisible) return null
 *
 *   return (
 *     <MyButton
 *       onClick={handleToggle}
 *       aria-label={label}
 *       aria-pressed={isActive}
 *     >
 *       Toggle Table
 *     </MyButton>
 *   )
 * }
 * ```
 */
export function useTable(config?: UseTableConfig) {
  const {
    editor: providedEditor,
    hideWhenUnavailable = false,
    onToggled,
  } = config || {};

  const { editor } = useTiptapEditor(providedEditor);
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const canToggle = canToggleTable(editor);
  const isActive = editor?.isActive("table") || false;

  useEffect(() => {
    if (!editor) return;

    const handleSelectionUpdate = () => {
      setIsVisible(shouldShowButton({ editor, hideWhenUnavailable }));
    };

    handleSelectionUpdate();

    editor.on("selectionUpdate", handleSelectionUpdate);

    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate);
    };
  }, [editor, hideWhenUnavailable]);

  const handleToggle = useCallback(() => {
    if (!editor) return false;

    const success = toggleTable(editor);
    if (success) {
      onToggled?.();
    }
    return success;
  }, [editor, onToggled]);

  return {
    isVisible,
    isActive,
    handleToggle,
    canToggle,
    label: "Table",
    shortcutKeys: TABLE_SHORTCUT_KEY,
    Icon: TableIcon,
  };
}
