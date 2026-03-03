import { forwardRef, useMemo } from "react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import { Button } from "@/components/ui/button";

import { parseShortcutKeys } from "@/lib/tiptap-utils";
import { Kbd, KbdGroup } from "@/components/ui/kbd";

export interface ButtonShortcutProps extends React.ComponentProps<typeof Button> {
  showTooltip?: boolean;
  tooltip?: React.ReactNode;
  shortcutKeys?: string;
}

export const ShortcutDisplay: React.FC<{ shortcuts: string[] }> = ({ shortcuts }) => {
  if (shortcuts.length === 0) return null;

  return (
    <KbdGroup>
      {shortcuts.map((key, index) => (
        <>
          {index > 0 && <span>+</span>}
          <Kbd>{key}</Kbd>
        </>
      ))}
    </KbdGroup>
  );
};

export const ButtonShortcut = forwardRef<HTMLButtonElement, ButtonShortcutProps>(
  ({ children, tooltip, showTooltip = true, shortcutKeys, ...props }, ref) => {
    const shortcuts = useMemo<string[]>(() => parseShortcutKeys({ shortcutKeys }), [shortcutKeys]);

    if (!tooltip || !showTooltip) {
      return (
        <Button ref={ref} {...props}>
          {children}
        </Button>
      );
    }

    return (
      <Tooltip>
        <TooltipTrigger
          render={
            <Button ref={ref} {...props}>
              {children}
            </Button>
          }
        />
        <TooltipContent>
          {tooltip}
          <ShortcutDisplay shortcuts={shortcuts} />
        </TooltipContent>
      </Tooltip>
    );
  },
);

ButtonShortcut.displayName = "ButtonShortcut";

export default ButtonShortcut;
