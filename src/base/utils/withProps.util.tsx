import { ComponentProps } from 'react';

/**
 * Returns a component with default `props` and `className`.
 * This is useful for extending components with additional props
 */
export function withProps<T extends React.ElementType>(
  Component: T,
  defaultProps: Partial<ComponentProps<T>>,
) {
  const ComponentWithClassName = Component as React.FC<ComponentProps<T> & { className: string }>;

  return function ExtendComponent(props: ComponentProps<T>) {
    return <ComponentWithClassName {...defaultProps} {...props} />;
  };
}
