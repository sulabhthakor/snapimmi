import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Option {
    value: string;
    label: string;
}

interface CustomSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: Option[];
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}

export function CustomSelect({
    value,
    onChange,
    options,
    placeholder = 'Select an option',
    className,
    disabled = false,
}: CustomSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find((opt) => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSelect = (optionValue: string) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    return (
        <div className={cn('relative', className)} ref={containerRef}>
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={cn(
                    'flex h-10 w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-black/5 focus:border-black disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-sm',
                    isOpen && 'border-black ring-4 ring-black/5',
                    !selectedOption && 'text-gray-400'
                )}
            >
                <span className="truncate">
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown
                    className={cn(
                        'h-4 w-4 opacity-50 transition-transform duration-200',
                        isOpen && 'rotate-180'
                    )}
                />
            </button>

            {isOpen && (
                <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-gray-200 bg-white p-1 text-gray-950 shadow-lg ring-1 ring-black/5 focus:outline-none animate-in fade-in-0 zoom-in-95">
                    {options.map((option) => (
                        <div
                            key={option.value}
                            className={cn(
                                'relative flex cursor-pointer select-none items-center rounded-lg py-2 pl-3 pr-9 text-sm outline-none transition-colors hover:bg-gray-50 focus:bg-gray-50',
                                option.value === value && 'bg-gray-50 font-medium'
                            )}
                            onClick={() => handleSelect(option.value)}
                        >
                            <span className="truncate">{option.label}</span>
                            {option.value === value && (
                                <span className="absolute right-3 flex items-center justify-center">
                                    <Check className="h-4 w-4 text-black" />
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
