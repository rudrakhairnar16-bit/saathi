/**
 * BigButton — Saathi UI Component
 * Accessible, large touch target (min 64px), with icon + label
 */

'use client';

import { forwardRef, ButtonHTMLAttributes } from 'react';

export interface BigButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Icon emoji or component */
  icon?: React.ReactNode;
  /** Size variant */
  size?: 'default' | 'large' | 'xl';
  /** Full width */
  fullWidth?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Visual variant */
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
}

export const BigButton = forwardRef<HTMLButtonElement, BigButtonProps>(
  (
    {
      children,
      icon,
      size = 'default',
      fullWidth = false,
      loading = false,
      className = '',
      disabled,
      style,
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      inline-flex items-center justify-center gap-3
      font-semibold text-base leading-normal
      rounded-xl border-0
      transition-all duration-150 ease-out
      focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-2
      active:scale-[0.98]
      disabled:opacity-50 disabled:cursor-not-allowed
      min-h-[64px] min-w-[64px]
      px-6 py-4
    `;

const variantStyles = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500',
  secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:ring-gray-400 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500',
  success: 'bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-500',
};

    const sizeStyles = {
      default: 'text-lg min-h-[64px]',
      large: 'text-xl min-h-[72px] px-8',
      xl: 'text-2xl min-h-[88px] px-10',
    };

    const widthStyles = fullWidth ? 'w-full' : '';
    const variant = props.variant || 'primary';
    const variantStyle = variantStyles[variant];

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${sizeStyles[size]} ${widthStyles} ${variantStyle} ${className}`}
        style={{
          ...style,
        } as React.CSSProperties}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Loading...</span>
          </>
        ) : (
          <>
            {icon && <span aria-hidden="true" style={{ fontSize: '1.5em' }}>{icon}</span>}
            <span>{children}</span>
          </>
        )}
      </button>
    );
  }
);

BigButton.displayName = 'BigButton';