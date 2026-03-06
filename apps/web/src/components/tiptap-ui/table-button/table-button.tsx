import { forwardRef, useCallback } from "react";

// --- Tiptap UI ---
import type { UseTableConfig } from "@/components/tiptap-ui/table-button";
import {
  TABLE_SHORTCUT_KEY,
  useTable,
} from "@/components/tiptap-ui/table-button";

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor";

// --- Lib ---
import { parseShortcutKeys } from "@/lib/tiptap-utils";

// --- UI Primitives ---
import type { ButtonShortcutProps } from "@/components/ui/button-shortcut";
import { ButtonShortcut } from "@/components/ui/button-shortcut";
import { Badge } from "@/components/ui/badge";

export interface TableButtonProps
  extends Omit<ButtonShortcutProps, "type">, UseTableConfig {
  /**
   * Optional text to display alongside the icon.
   */
  text?: string;
  /**
   * Optional show shortcut keys in the button.
   * @default false
   */
  showShortcut?: boolean;
}

export function TableShortcutBadge({
  shortcutKeys = TABLE_SHORTCUT_KEY,
}: {
  shortcutKeys?: string;
}) {
  return <Badge>{parseShortcutKeys({ shortcutKeys })}</Badge>;
}

/**
 * Button component for toggling table in a Tiptap editor.
 *
 * For custom button implementations, use the `useTable` hook instead.
 */
export const TableButton = forwardRef<HTMLButtonElement, TableButtonProps>(
  (
    {
      editor: providedEditor,
      text,
      hideWhenUnavailable = false,
      onToggled,
      showShortcut = false,
      onClick,
      children,
      ...buttonProps
    },
    ref,
  ) => {
    const { editor } = useTiptapEditor(providedEditor);
    const {
      isVisible,
      canToggle,
      isActive,
      handleToggle,
      label,
      shortcutKeys,
      Icon,
    } = useTable({
      editor,
      hideWhenUnavailable,
      onToggled,
    });

    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        handleToggle();
      },
      [handleToggle, onClick],
    );

    if (!isVisible) {
      return null;
    }

    return (
      <ButtonShortcut
        type="button"
        variant="ghost"
        data-active-state={isActive ? "on" : "off"}
        role="button"
        tabIndex={-1}
        disabled={!canToggle}
        data-disabled={!canToggle}
        aria-label={label}
        aria-pressed={isActive}
        tooltip="Table"
        onClick={handleClick}
        {...buttonProps}
        ref={ref}
      >
        {children ?? (
          <>
            <Icon className="tiptap-button-icon" />
            {text && <span className="tiptap-button-text">{text}</span>}
            {showShortcut && <TableShortcutBadge shortcutKeys={shortcutKeys} />}
          </>
        )}
      </ButtonShortcut>
    );
  },
);

TableButton.displayName = "TableButton";
