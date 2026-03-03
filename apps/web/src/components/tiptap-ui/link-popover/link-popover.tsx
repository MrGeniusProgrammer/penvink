"use client";

import { forwardRef, useCallback, useEffect, useState } from "react";
import type { Editor } from "@tiptap/react";

// --- Hooks ---
import { useIsBreakpoint } from "@/hooks/use-is-breakpoint";
import { useTiptapEditor } from "@/hooks/use-tiptap-editor";

// --- Icons ---
import { CornerDownLeftIcon } from "@/components/tiptap-icons/corner-down-left-icon";
import { ExternalLinkIcon } from "@/components/tiptap-icons/external-link-icon";
import { LinkIcon } from "@/components/tiptap-icons/link-icon";
import { TrashIcon } from "@/components/tiptap-icons/trash-icon";

// --- Tiptap UI ---
import type { UseLinkPopoverConfig } from "@/components/tiptap-ui/link-popover";
import { useLinkPopover } from "@/components/tiptap-ui/link-popover";

// --- UI Primitives ---
import type { ButtonShortcutProps } from "@/components/ui/button-shortcut";
import { ButtonShortcut } from "@/components/ui/button-shortcut";
import { ButtonGroup } from "@/components/ui/button-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { InputGroup } from "@/components/ui/input-group";

export interface LinkMainProps {
  /**
   * The URL to set for the link.
   */
  url: string;
  /**
   * Function to update the URL state.
   */
  setUrl: React.Dispatch<React.SetStateAction<string | null>>;
  /**
   * Function to set the link in the editor.
   */
  setLink: () => void;
  /**
   * Function to remove the link from the editor.
   */
  removeLink: () => void;
  /**
   * Function to open the link.
   */
  openLink: () => void;
  /**
   * Whether the link is currently active in the editor.
   */
  isActive: boolean;
}

export interface LinkPopoverProps extends Omit<ButtonShortcutProps, "type">, UseLinkPopoverConfig {
  /**
   * Callback for when the popover opens or closes.
   */
  onOpenChange?: (isOpen: boolean) => void;
  /**
   * Whether to automatically open the popover when a link is active.
   * @default true
   */
  autoOpenOnLinkActive?: boolean;
}

/**
 * Link button component for triggering the link popover
 */
export const LinkButton = forwardRef<HTMLButtonElement, ButtonShortcutProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <ButtonShortcut
        type="button"
        className={className}
        variant="ghost"
        role="button"
        tabIndex={-1}
        aria-label="Link"
        tooltip="Link"
        ref={ref}
        {...props}
      >
        {children || <LinkIcon className="tiptap-button-icon" />}
      </ButtonShortcut>
    );
  },
);

LinkButton.displayName = "LinkButton";

/**
 * Main content component for the link popover
 */
const LinkMain: React.FC<LinkMainProps> = ({
  url,
  setUrl,
  setLink,
  removeLink,
  openLink,
  isActive,
}) => {
  const isMobile = useIsBreakpoint();

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      setLink();
    }
  };

  return (
    <Card style={isMobile ? { boxShadow: "none", border: 0 } : {}}>
      <CardContent style={isMobile ? { padding: 0 } : {}}>
        <InputGroup>
          <Input
            type="url"
            placeholder="Paste a link..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
          />
        </InputGroup>

        <ButtonGroup orientation="horizontal">
          <ButtonShortcut
            type="button"
            onClick={setLink}
            title="Apply link"
            disabled={!url && !isActive}
            variant="ghost"
          >
            <CornerDownLeftIcon className="tiptap-button-icon" />
          </ButtonShortcut>
        </ButtonGroup>

        <Separator />

        <ButtonGroup orientation="horizontal">
          <ButtonShortcut
            type="button"
            onClick={openLink}
            title="Open in new window"
            disabled={!url && !isActive}
            variant="ghost"
          >
            <ExternalLinkIcon className="tiptap-button-icon" />
          </ButtonShortcut>

          <ButtonShortcut
            type="button"
            onClick={removeLink}
            title="Remove link"
            disabled={!url && !isActive}
            variant="ghost"
          >
            <TrashIcon className="tiptap-button-icon" />
          </ButtonShortcut>
        </ButtonGroup>
      </CardContent>
    </Card>
  );
};

/**
 * Link content component for standalone use
 */
export const LinkContent: React.FC<{
  editor?: Editor | null;
}> = ({ editor }) => {
  const linkPopover = useLinkPopover({
    editor,
  });

  return <LinkMain {...linkPopover} />;
};

/**
 * Link popover component for Tiptap editors.
 *
 * For custom popover implementations, use the `useLinkPopover` hook instead.
 */
export const LinkPopover = forwardRef<HTMLButtonElement, LinkPopoverProps>(
  (
    {
      editor: providedEditor,
      hideWhenUnavailable = false,
      onSetLink,
      onOpenChange,
      autoOpenOnLinkActive = true,
      onClick,
      children,
      ...buttonProps
    },
    ref,
  ) => {
    const { editor } = useTiptapEditor(providedEditor);
    const [isOpen, setIsOpen] = useState(false);

    const { isVisible, canSet, isActive, url, setUrl, setLink, removeLink, openLink, label, Icon } =
      useLinkPopover({
        editor,
        hideWhenUnavailable,
        onSetLink,
      });

    const handleOnOpenChange = useCallback(
      (nextIsOpen: boolean) => {
        setIsOpen(nextIsOpen);
        onOpenChange?.(nextIsOpen);
      },
      [onOpenChange],
    );

    const handleSetLink = useCallback(() => {
      setLink();
      setIsOpen(false);
    }, [setLink]);

    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        setIsOpen(!isOpen);
      },
      [onClick, isOpen],
    );

    useEffect(() => {
      if (autoOpenOnLinkActive && isActive) {
        setIsOpen(true);
      }
    }, [autoOpenOnLinkActive, isActive]);

    if (!isVisible) {
      return null;
    }

    return (
      <Popover open={isOpen} onOpenChange={handleOnOpenChange}>
        <PopoverTrigger
          render={
            <LinkButton
              disabled={!canSet}
              data-active-state={isActive ? "on" : "off"}
              data-disabled={!canSet}
              aria-label={label}
              aria-pressed={isActive}
              onClick={handleClick}
              {...buttonProps}
              ref={ref}
            >
              {children ?? <Icon className="tiptap-button-icon" />}
            </LinkButton>
          }
        />

        <PopoverContent>
          <LinkMain
            url={url}
            setUrl={setUrl}
            setLink={handleSetLink}
            removeLink={removeLink}
            openLink={openLink}
            isActive={isActive}
          />
        </PopoverContent>
      </Popover>
    );
  },
);

LinkPopover.displayName = "LinkPopover";

export default LinkPopover;
