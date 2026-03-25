'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    href?: string;
    className?: string;
}

const Button = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
    (
        {
            variant = 'primary',
            size = 'md',
            isLoading: isLoadingProp,
            leftIcon,
            rightIcon,
            href,
            onClick,
            children,
            className = '',
            disabled,
            ...props
        },
        ref
    ) => {
        const [internalLoading, setInternalLoading] = useState(false);
        const isLoading = isLoadingProp ?? internalLoading;

        const baseStyles = 'inline-flex items-center justify-center font-bold transition-all duration-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed active:scale-95';

        const variants = {
            primary: 'bg-accent-gold text-bg-primary hover:shadow-[0_10px_30px_rgba(212,175,55,0.3)] hover:-translate-y-0.5',
            secondary: 'border-2 border-accent-gold text-accent-gold hover:bg-accent-gold hover:text-bg-primary',
            outline: 'border border-border text-text-primary hover:border-accent-gold hover:text-accent-gold bg-transparent',
            ghost: 'bg-transparent text-text-secondary hover:text-accent-gold hover:bg-white/5',
            danger: 'bg-red-600 text-white hover:bg-red-700 hover:shadow-[0_10px_30px_rgba(220,38,38,0.3)]',
        };

        const sizes = {
            sm: 'px-4 py-2 text-xs',
            md: 'px-8 py-3 text-sm',
            lg: 'px-10 py-3.5 text-base',
            xl: 'px-12 py-5 text-lg uppercase tracking-widest',
        };

        const combinedClassName = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

        const isPromise = (value: unknown): value is Promise<unknown> => {
            return value !== null &&
                typeof value === 'object' &&
                'then' in value &&
                typeof (value as Record<string, unknown>).then === 'function';
        };

        const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
            if (isLoading || disabled) return;

            if (onClick) {
                const result = onClick(e);

                if (isPromise(result)) {
                    setInternalLoading(true);
                    try {
                        await result;
                    } finally {
                        setInternalLoading(false);
                    }
                }
            }
        };

        const content = (
            <>
                {isLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
                {children}
                {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
            </>
        );

        if (href) {
            return (
                <Link
                  
                    className={combinedClassName}
                    ref={ref as React.Ref<HTMLAnchorElement>}
                    {...props as React.ComponentPropsWithoutRef<typeof Link>}
                >
                    {content}
                </Link>
            );
        }

        return (
            <button
                ref={ref as React.Ref<HTMLButtonElement>}
                disabled={disabled || isLoading}
                onClick={handleClick}
                className={combinedClassName}
                {...props}
            >
                {content}
            </button>
        );
    }
);

Button.displayName = 'Button';

export default Button;