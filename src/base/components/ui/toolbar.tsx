'use client';

import * as ToolbarPrimitive from '@radix-ui/react-toolbar';
import { type VariantProps, cva } from 'class-variance-authority';
import { ChevronDown } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/base/lib';
import { withCn, withVariants } from '@/base/utils';

import { Separator } from './separator';
import { withTooltip } from './tooltip';

export const Toolbar = withCn(ToolbarPrimitive.Root, 'relative flex items-center select-none');

export const ToolbarToggleGroup = withCn(ToolbarPrimitive.ToolbarToggleGroup, 'flex items-center');

export const ToolbarLink = withCn(
  ToolbarPrimitive.Link,
  'font-medium underline underline-offset-4',
);

export const ToolbarSeparator = withCn(
  ToolbarPrimitive.Separator,
  'mx-2 my-1 w-px shrink-0 bg-border',
);

const toolbarButtonVariants = cva(
  cn(
    'inline-flex cursor-pointer items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap text-foreground transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg:not([data-icon])]:size-4',
  ),
  {
    defaultVariants: {
      size: 'sm',
      variant: 'default',
    },
    variants: {
      size: {
        default: 'h-10 px-3',
        lg: 'h-11 px-5',
        sm: 'h-7 px-2',
      },
      variant: {
        default:
          'bg-transparent hover:bg-muted hover:text-muted-foreground aria-checked:bg-accent aria-checked:text-accent-foreground',
        outline: 'border border-input bg-transparent hover:bg-accent hover:text-accent-foreground',
      },
    },
  },
);

const dropdownArrowVariants = cva(
  cn(
    'inline-flex items-center justify-center rounded-r-md text-sm font-medium text-foreground transition-colors disabled:pointer-events-none disabled:opacity-50',
  ),
  {
    defaultVariants: {
      size: 'sm',
      variant: 'default',
    },
    variants: {
      size: {
        default: 'h-10 w-6',
        lg: 'h-11 w-8',
        sm: 'h-7 w-4',
      },
      variant: {
        default:
          'bg-transparent hover:bg-muted hover:text-muted-foreground aria-checked:bg-accent aria-checked:text-accent-foreground',
        outline:
          'border border-l-0 border-input bg-transparent hover:bg-accent hover:text-accent-foreground',
      },
    },
  },
);

const ToolbarButton = withTooltip(
  ({ children, className, isDropdown, pressed, size, variant, ...props }) => {
    return typeof pressed === 'boolean' ? (
      <ToolbarToggleGroup disabled={props.disabled} value="single" type="single">
        <ToolbarToggleItem
          className={cn(
            toolbarButtonVariants({
              size,
              variant,
            }),
            isDropdown && 'justify-between gap-1 pr-1',
            className,
          )}
          value={pressed ? 'single' : ''}
          {...props}
        >
          {isDropdown ? (
            <>
              <div className="flex flex-1 items-center gap-2 whitespace-nowrap">{children}</div>
              <div>
                <ChevronDown className="text-muted-foreground size-3.5" data-icon />
              </div>
            </>
          ) : (
            children
          )}
        </ToolbarToggleItem>
      </ToolbarToggleGroup>
    ) : (
      <ToolbarPrimitive.Button
        className={cn(
          toolbarButtonVariants({
            size,
            variant,
          }),
          isDropdown && 'pr-1',
          className,
        )}
        {...props}
      >
        {children}
      </ToolbarPrimitive.Button>
    );
  },
);

export { ToolbarButton };

export function ToolbarSplitButton({
  children,
  className,
  ...props
}: ToolbarPrimitive.ToolbarButtonProps) {
  return (
    <ToolbarButton
      className={cn('group flex gap-0 px-0 hover:bg-transparent', className)}
      {...props}
    >
      {children}
    </ToolbarButton>
  );
}

export const ToolbarSplitButtonPrimary = withTooltip(
  ({ children, className, size, variant, ...props }) => {
    return (
      <span
        className={cn(
          toolbarButtonVariants({
            size,
            variant,
          }),
          'rounded-r-none',
          'group-data-[pressed=true]:bg-accent group-data-[pressed=true]:text-accent-foreground',
          className,
        )}
        {...props}
      >
        {children}
      </span>
    );
  },
);

export function ToolbarSplitButtonSecondary({
  className,
  size,
  variant,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof dropdownArrowVariants>) {
  return (
    <span
      className={cn(
        dropdownArrowVariants({
          size,
          variant,
        }),
        'group-data-[pressed=true]:bg-accent group-data-[pressed=true]:text-accent-foreground',
        className,
      )}
      onClick={(e) => e.stopPropagation()}
      role="button"
      {...props}
    >
      <ChevronDown className="text-muted-foreground size-3.5" data-icon />
    </span>
  );
}

ToolbarSplitButton.displayName = 'ToolbarButton';

export const ToolbarToggleItem = withVariants(ToolbarPrimitive.ToggleItem, toolbarButtonVariants, [
  'variant',
  'size',
]);

export function ToolbarGroup({ children, className }: React.ComponentProps<'div'>) {
  return (
    <div className={cn('group/toolbar-group', 'relative hidden has-[button]:flex', className)}>
      <div className="flex items-center">{children}</div>

      <div className="mx-1.5 py-0.5 group-last/toolbar-group:hidden!">
        <Separator orientation="vertical" />
      </div>
    </div>
  );
}

export const FixedToolbar = withCn(
  Toolbar,
  'sticky top-0 left-0 z-50 scrollbar-hide w-full justify-between overflow-x-auto rounded-t-lg border-b border-b-border bg-background/95 p-1 backdrop-blur-sm supports-backdrop-blur:bg-background/60',
);
