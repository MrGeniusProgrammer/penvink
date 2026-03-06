import React from "react";
import { useTiptapEditor } from "@/hooks/use-tiptap-editor";
import { type Editor } from "@tiptap/core";
import { BubbleMenu } from "@tiptap/react/menus";
import { useTableBubble } from "./use-table-bubble";
import { ButtonGroup } from "@/components/ui/button-group";
import ButtonShortcut from "@/components/ui/button-shortcut";

// lucide icons (used where available)
import {
  Table as IconTable,
  Columns as IconColumns,
  Plus as IconPlus,
  Minus as IconMinus,
  ChevronLeft,
  ChevronRight,
  Scissors,
  Trash2,
  Wrench,
  SlidersHorizontal,
  Hash,
} from "lucide-react";

import { CellSelection } from "@tiptap/pm/tables";
import type { Node as PMNode } from "@tiptap/pm/model";

/* -------------------------
   Custom small SVG icons
   (same as your previous code)
   ------------------------- */
const AddColumnIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" width="16" height="16" {...props}>
    <rect
      x="3"
      y="4"
      width="6"
      height="16"
      rx="1"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <rect
      x="15"
      y="4"
      width="6"
      height="16"
      rx="1"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M11 12h6"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M14 9v6"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const AddRowIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" width="16" height="16" {...props}>
    <rect
      x="3"
      y="4"
      width="18"
      height="6"
      rx="1"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <rect
      x="3"
      y="14"
      width="18"
      height="6"
      rx="1"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M6 11h12"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 8v6"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const DeleteColumnIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" width="16" height="16" {...props}>
    <rect
      x="3"
      y="4"
      width="6"
      height="16"
      rx="1"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <rect
      x="15"
      y="4"
      width="6"
      height="16"
      rx="1"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M11 12h6"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const DeleteRowIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" width="16" height="16" {...props}>
    <rect
      x="3"
      y="4"
      width="18"
      height="6"
      rx="1"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <rect
      x="3"
      y="14"
      width="18"
      height="6"
      rx="1"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M6 11h12"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const MergeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" width="16" height="16" {...props}>
    <rect
      x="3"
      y="4"
      width="8"
      height="8"
      rx="1"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <rect
      x="13"
      y="12"
      width="8"
      height="8"
      rx="1"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M11 9l2-2 2 2"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M11 15l2 2 2-2"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const MergeOrSplitIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" width="16" height="16" {...props}>
    <rect
      x="3"
      y="3"
      width="8.5"
      height="8.5"
      rx="1"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <rect
      x="12.5"
      y="3"
      width="8.5"
      height="8.5"
      rx="1"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <rect
      x="3"
      y="12.5"
      width="8.5"
      height="8.5"
      rx="1"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M12 12v0"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9 9l6 6"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M15 9l-6 6"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const HeaderColumnIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" width="16" height="16" {...props}>
    <rect
      x="3"
      y="4"
      width="6"
      height="16"
      rx="1"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <rect
      x="11"
      y="4"
      width="10"
      height="16"
      rx="1"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M6 7.5v0"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16 7.5v0"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/* -------------------------
   Helpers
   ------------------------- */
function isCellNode(node: PMNode | null | undefined) {
  if (!node) return false;
  const t = node.type && (node.type.name || "");
  return t === "tableCell" || t === "tableHeader";
}

function findCellNodeFromSelection(editor: Editor | null | undefined) {
  if (!editor) return null;
  const { state } = editor;
  const { selection } = state;
  let $pos = selection.$from;
  for (let depth = $pos.depth; depth > 0; depth--) {
    const node = $pos.node(depth);
    if (isCellNode(node))
      return { node, pos: $pos.pos - $pos.node(depth).nodeSize + 1 };
  }
  // as a fallback: try nodeAt the from.pos
  try {
    const maybe = state.doc.nodeAt(selection.$from.pos);
    if (isCellNode(maybe))
      return { node: maybe as PMNode, pos: selection.$from.pos };
  } catch {}
  return null;
}

/* -------------------------
   Component
   ------------------------- */
export function TableBubbleMenu({
  providedEditor,
}: {
  providedEditor?: Editor | null;
}) {
  const { editor } = useTiptapEditor(providedEditor);
  const {
    isActive,
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
    getReferencedVirtualElement,
  } = useTableBubble({
    editor: providedEditor,
  });

  // selection / table detection
  const selection = editor?.state.selection;
  const isInTable = !!editor && editor.isActive && editor.isActive("table");
  const isCellSelection =
    selection &&
    (selection instanceof CellSelection ||
      (selection as any).ranges?.length > 1);

  // determine merge/split availability
  const canMerge = !!isCellSelection && (selection as any)?.ranges?.length > 1;

  // find current cell to detect colspan/rowspan for splitting
  const currentCell = findCellNodeFromSelection(editor);
  const cellAttrs = (currentCell?.node?.attrs ?? {}) as {
    colspan?: number;
    rowspan?: number;
  };

  const canSplit =
    !!currentCell &&
    ((cellAttrs.colspan && cellAttrs.colspan > 1) ||
      (cellAttrs.rowspan && cellAttrs.rowspan > 1));

  // many actions only make sense inside a table
  const enableTableOps = !!isInTable;
  const enableNavigation = !!isInTable;

  // helper that returns a tooltip with reason when disabled
  const disabledTooltip = (
    enabled: boolean,
    enabledMsg: string,
    disabledMsg: string,
  ) => (enabled ? enabledMsg : disabledMsg);

  return (
    <BubbleMenu
      editor={editor ? editor : undefined}
      shouldShow={() => isActive}
      getReferencedVirtualElement={getReferencedVirtualElement}
      options={{ placement: "top", offset: 8 }}
    >
      <ButtonGroup>
        {/* Add / Delete columns */}
        <ButtonShortcut
          type="button"
          variant="ghost"
          aria-label="Add column before"
          tooltip={disabledTooltip(
            enableTableOps,
            "Add column before",
            "Place cursor inside a table",
          )}
          onClick={() => addColumnBefore?.()}
          disabled={!enableTableOps}
          aria-disabled={!enableTableOps}
        >
          <AddColumnIcon />
        </ButtonShortcut>

        <ButtonShortcut
          type="button"
          variant="ghost"
          aria-label="Add column after"
          tooltip={disabledTooltip(
            enableTableOps,
            "Add column after",
            "Place cursor inside a table",
          )}
          onClick={() => addColumnAfter?.()}
          disabled={!enableTableOps}
          aria-disabled={!enableTableOps}
        >
          <AddColumnIcon />
        </ButtonShortcut>

        <ButtonShortcut
          type="button"
          variant="ghost"
          aria-label="Delete column"
          tooltip={disabledTooltip(
            enableTableOps,
            "Delete column",
            "Place cursor inside a table",
          )}
          onClick={() => deleteColumn?.()}
          disabled={!enableTableOps}
          aria-disabled={!enableTableOps}
        >
          <DeleteColumnIcon />
        </ButtonShortcut>

        {/* Add / Delete rows */}
        <ButtonShortcut
          type="button"
          variant="ghost"
          aria-label="Add row before"
          tooltip={disabledTooltip(
            enableTableOps,
            "Add row before",
            "Place cursor inside a table",
          )}
          onClick={() => addRowBefore?.()}
          disabled={!enableTableOps}
          aria-disabled={!enableTableOps}
        >
          <AddRowIcon />
        </ButtonShortcut>

        <ButtonShortcut
          type="button"
          variant="ghost"
          aria-label="Add row after"
          tooltip={disabledTooltip(
            enableTableOps,
            "Add row after",
            "Place cursor inside a table",
          )}
          onClick={() => addRowAfter?.()}
          disabled={!enableTableOps}
          aria-disabled={!enableTableOps}
        >
          <AddRowIcon />
        </ButtonShortcut>

        <ButtonShortcut
          type="button"
          variant="ghost"
          aria-label="Delete row"
          tooltip={disabledTooltip(
            enableTableOps,
            "Delete row",
            "Place cursor inside a table",
          )}
          onClick={() => deleteRow?.()}
          disabled={!enableTableOps}
          aria-disabled={!enableTableOps}
        >
          <DeleteRowIcon />
        </ButtonShortcut>

        {/* Merge / Split */}
        <ButtonShortcut
          type="button"
          variant="ghost"
          aria-label="Merge cells"
          tooltip={disabledTooltip(
            canMerge,
            "Merge selected cells",
            "Select multiple cells to merge",
          )}
          onClick={() => mergeCells?.()}
          disabled={!canMerge}
          aria-disabled={!canMerge}
        >
          <MergeIcon />
        </ButtonShortcut>

        <ButtonShortcut
          type="button"
          variant="ghost"
          aria-label="Merge or Split"
          tooltip={
            canMerge
              ? "Merge selected cells"
              : canSplit
                ? "Split current cell"
                : "Select multiple cells or a merged cell"
          }
          onClick={() => mergeOrSplit?.()}
          disabled={!canMerge && !canSplit}
          aria-disabled={!canMerge && !canSplit}
        >
          <MergeOrSplitIcon />
        </ButtonShortcut>

        <ButtonShortcut
          type="button"
          variant="ghost"
          aria-label="Split cell"
          tooltip={disabledTooltip(
            canSplit ? canSplit : false,
            "Split this merged cell",
            "Cell is not merged (no colspan/rowspan > 1)",
          )}
          onClick={() => splitCell?.()}
          disabled={!canSplit}
          aria-disabled={!canSplit}
        >
          <Scissors size={16} />
        </ButtonShortcut>

        {/* Navigation */}
        <ButtonShortcut
          type="button"
          variant="ghost"
          aria-label="Previous cell"
          tooltip={disabledTooltip(
            enableNavigation,
            "Go to previous cell",
            "Place cursor inside a table",
          )}
          onClick={() => goToPreviousCell?.()}
          disabled={!enableNavigation}
          aria-disabled={!enableNavigation}
        >
          <ChevronLeft size={16} />
        </ButtonShortcut>

        <ButtonShortcut
          type="button"
          variant="ghost"
          aria-label="Next cell"
          tooltip={disabledTooltip(
            enableNavigation,
            "Go to next cell",
            "Place cursor inside a table",
          )}
          onClick={() => goToNextCell?.()}
          disabled={!enableNavigation}
          aria-disabled={!enableNavigation}
        >
          <ChevronRight size={16} />
        </ButtonShortcut>

        {/* Fix / set attributes */}
        <ButtonShortcut
          type="button"
          variant="ghost"
          aria-label="Fix tables"
          tooltip={disabledTooltip(
            enableTableOps,
            "Attempt to fix table structure",
            "Place cursor inside a table",
          )}
          onClick={() => fixTables?.()}
          disabled={!enableTableOps}
          aria-disabled={!enableTableOps}
        >
          <Wrench size={16} />
        </ButtonShortcut>

        {/* Toggle header */}
        <ButtonShortcut
          type="button"
          variant="ghost"
          aria-label="Toggle header cell"
          tooltip={disabledTooltip(
            enableTableOps,
            "Toggle header cell",
            "Place cursor inside a table",
          )}
          onClick={() => toggleHeaderCell?.()}
          disabled={!enableTableOps}
          aria-disabled={!enableTableOps}
        >
          <Hash size={16} />
        </ButtonShortcut>

        <ButtonShortcut
          type="button"
          variant="ghost"
          aria-label="Toggle header column"
          tooltip={disabledTooltip(
            enableTableOps,
            "Toggle header column",
            "Place cursor inside a table",
          )}
          onClick={() => toggleHeaderColumn?.()}
          disabled={!enableTableOps}
          aria-disabled={!enableTableOps}
        >
          <HeaderColumnIcon />
        </ButtonShortcut>

        <ButtonShortcut
          type="button"
          variant="ghost"
          aria-label="Toggle header row"
          tooltip={disabledTooltip(
            enableTableOps,
            "Toggle header row",
            "Place cursor inside a table",
          )}
          onClick={() => toggleHeaderRow?.()}
          disabled={!enableTableOps}
          aria-disabled={!enableTableOps}
        >
          <Hash size={16} />
        </ButtonShortcut>

        {/* Delete whole table */}
        <ButtonShortcut
          type="button"
          variant="ghost"
          aria-label="Delete table"
          tooltip={disabledTooltip(
            enableTableOps,
            "Delete entire table",
            "Place cursor inside a table",
          )}
          onClick={() => deleteTable?.()}
          disabled={!enableTableOps}
          aria-disabled={!enableTableOps}
        >
          <Trash2 size={16} />
        </ButtonShortcut>
      </ButtonGroup>
    </BubbleMenu>
  );
}
