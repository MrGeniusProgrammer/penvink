import { forwardRef, useMemo, useRef, useState } from "react";
import { type Editor } from "@tiptap/react";

// --- Hooks ---
import { useMenuNavigation } from "@/hooks/use-menu-navigation";
import { useIsBreakpoint } from "@/hooks/use-is-breakpoint";
import { useTiptapEditor } from "@/hooks/use-tiptap-editor";

// --- Icons ---
import { BanIcon } from "@/components/tiptap-icons/ban-icon";
import { HighlighterIcon } from "@/components/tiptap-icons/highlighter-icon";

// --- UI Primitives ---
import type { ButtonShortcutProps } from "@/components/ui/button-shortcut";
import { ButtonShortcut } from "@/components/ui/button-shortcut";
import { ButtonGroup } from "@/components/ui/button-group";

import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";

// --- Tiptap UI ---
import type {
  HighlightColor,
  UseColorHighlightConfig,
} from "@/components/tiptap-ui/color-highlight-button";
import {
  ColorHighlightButton,
  pickHighlightColorsByValue,
  useColorHighlight,
} from "@/components/tiptap-ui/color-highlight-button";

export interface ColorHighlightPopoverContentProps {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null;
  /**
   * Optional colors to use in the highlight popover.
   * If not provided, defaults to a predefined set of colors.
   */
  colors?: HighlightColor[];
  /**
   * When true, uses the actual color value (colorValue) instead of CSS variable (value).
   * @default false
   */
  useColorValue?: boolean;
}

export interface ColorHighlightPopoverProps
  extends
    Omit<ButtonShortcutProps, "type">,
    Pick<UseColorHighlightConfig, "editor" | "hideWhenUnavailable" | "onApplied"> {
  /**
   * Optional colors to use in the highlight popover.
   * If not provided, defaults to a predefined set of colors.
   */
  colors?: HighlightColor[];
  /**
   * When true, uses the actual color value (colorValue) instead of CSS variable (value).
   * @default false
   */
  useColorValue?: boolean;
}

export const ColorHighlightPopoverButton = forwardRef<HTMLButtonElement, ButtonShortcutProps>(
  ({ className, children, ...props }, ref) => (
    <ButtonShortcut
      type="button"
      className={className}
      variant="ghost"
      data-appearance="default"
      role="button"
      tabIndex={-1}
      aria-label="Highlight text"
      tooltip="Highlight"
      ref={ref}
      {...props}
    >
      {children ?? <HighlighterIcon className="tiptap-button-icon" />}
    </ButtonShortcut>
  ),
);

ColorHighlightPopoverButton.displayName = "ColorHighlightPopoverButton";

export function ColorHighlightPopoverContent({
  editor,
  colors = pickHighlightColorsByValue([
    "var(--tt-color-highlight-green)",
    "var(--tt-color-highlight-blue)",
    "var(--tt-color-highlight-red)",
    "var(--tt-color-highlight-purple)",
    "var(--tt-color-highlight-yellow)",
  ]),
  useColorValue = false,
}: ColorHighlightPopoverContentProps) {
  const { handleRemoveHighlight } = useColorHighlight({ editor });
  const isMobile = useIsBreakpoint();
  const containerRef = useRef<HTMLDivElement>(null);

  const menuItems = useMemo(
    () => [...colors, { label: "Remove highlight", value: "none" }],
    [colors],
  );

  const { selectedIndex } = useMenuNavigation({
    containerRef,
    items: menuItems,
    orientation: "both",
    onSelect: (item) => {
      if (!containerRef.current) return false;
      const highlightedElement = containerRef.current.querySelector(
        '[data-highlighted="true"]',
      ) as HTMLElement;
      if (highlightedElement) highlightedElement.click();
      if (item.value === "none") handleRemoveHighlight();
      return true;
    },
    autoSelectFirstItem: false,
  });

  return (
    <Card ref={containerRef} tabIndex={0} style={isMobile ? { boxShadow: "none", border: 0 } : {}}>
      <CardContent style={isMobile ? { padding: 0 } : {}}>
        <ButtonGroup orientation="horizontal">
          {colors.map((color, index) => (
            <ColorHighlightButton
              key={color.value}
              editor={editor}
              highlightColor={useColorValue ? color.colorValue : color.value}
              tooltip={color.label}
              aria-label={`${color.label} highlight color`}
              tabIndex={index === selectedIndex ? 0 : -1}
              data-highlighted={selectedIndex === index}
              useColorValue={useColorValue}
            />
          ))}
        </ButtonGroup>
        <Separator />
        <ButtonGroup orientation="horizontal">
          <ButtonShortcut
            onClick={handleRemoveHighlight}
            aria-label="Remove highlight"
            tooltip="Remove highlight"
            tabIndex={selectedIndex === colors.length ? 0 : -1}
            type="button"
            role="menuitem"
            variant="ghost"
            data-highlighted={selectedIndex === colors.length}
          >
            <BanIcon className="tiptap-button-icon" />
          </ButtonShortcut>
        </ButtonGroup>
      </CardContent>
    </Card>
  );
}

export function ColorHighlightPopover({
  editor: providedEditor,
  colors = pickHighlightColorsByValue([
    "var(--tt-color-highlight-green)",
    "var(--tt-color-highlight-blue)",
    "var(--tt-color-highlight-red)",
    "var(--tt-color-highlight-purple)",
    "var(--tt-color-highlight-yellow)",
  ]),
  hideWhenUnavailable = false,
  useColorValue = false,
  onApplied,
  ...props
}: ColorHighlightPopoverProps) {
  const { editor } = useTiptapEditor(providedEditor);
  const [isOpen, setIsOpen] = useState(false);
  const { isVisible, canColorHighlight, isActive, label, Icon } = useColorHighlight({
    editor,
    hideWhenUnavailable,
    onApplied,
  });

  if (!isVisible) return null;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        render={
          <ColorHighlightPopoverButton
            disabled={!canColorHighlight}
            data-active-state={isActive ? "on" : "off"}
            data-disabled={!canColorHighlight}
            aria-pressed={isActive}
            aria-label={label}
            tooltip={label}
            {...props}
          >
            <Icon className="tiptap-button-icon" />
          </ColorHighlightPopoverButton>
        }
      />
      <PopoverContent aria-label="Highlight colors">
        <ColorHighlightPopoverContent
          editor={editor}
          colors={colors}
          useColorValue={useColorValue}
        />
      </PopoverContent>
    </Popover>
  );
}

export default ColorHighlightPopover;
