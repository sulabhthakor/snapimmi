'use client';

import * as React from 'react';
import { Calendar } from 'lucide-react';
import { parse, format, isValid } from 'date-fns';
import { cn } from '@/lib/utils';

interface DateInputProps {
    value?: Date;
    onChange: (date: Date | undefined) => void;
    placeholder?: string;
    label?: string;
    error?: string;
    disabled?: boolean;
}

export function DateInput({ value, onChange, placeholder = 'DD-MM-YY', label, error, disabled }: DateInputProps) {
    // Convert Date to display string
    const formatDateToDisplay = (date: Date | undefined): string => {
        if (!date || !isValid(date)) return '';
        return format(date, 'dd-MM-yy');
    };

    const [inputValue, setInputValue] = React.useState(formatDateToDisplay(value));
    const [isFocused, setIsFocused] = React.useState(false);

    // Sync with external value changes
    React.useEffect(() => {
        if (!isFocused) {
            setInputValue(formatDateToDisplay(value));
        }
    }, [value, isFocused]);

    // Auto-format input as user types
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value;

        // Remove any non-digit characters except dashes
        val = val.replace(/[^\d-]/g, '');

        // Remove all dashes to work with pure digits
        const digits = val.replace(/-/g, '');

        // Auto-insert dashes at correct positions
        let formatted = '';
        for (let i = 0; i < digits.length && i < 6; i++) {
            if (i === 2 || i === 4) {
                formatted += '-';
            }
            formatted += digits[i];
        }

        setInputValue(formatted);

        // Try to parse when we have a complete date (6 digits)
        if (digits.length === 6) {
            const parsed = parse(formatted, 'dd-MM-yy', new Date());
            if (isValid(parsed)) {
                onChange(parsed);
            }
        } else if (digits.length === 0) {
            onChange(undefined);
        }
    };

    // Validate on blur
    const handleBlur = () => {
        setIsFocused(false);

        if (inputValue.length === 0) {
            onChange(undefined);
            return;
        }

        // Try to parse the input
        const parsed = parse(inputValue, 'dd-MM-yy', new Date());
        if (isValid(parsed)) {
            onChange(parsed);
            setInputValue(format(parsed, 'dd-MM-yy'));
        } else {
            // Reset to previous valid value or empty
            setInputValue(formatDateToDisplay(value));
        }
    };

    const isValidDate = inputValue.length === 8 && isValid(parse(inputValue, 'dd-MM-yy', new Date()));

    return (
        <div className="space-y-2 w-full">
            {label && <label className="text-sm font-semibold text-gray-900">{label}</label>}

            <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Calendar className="h-4 w-4 text-gray-400" />
                </div>
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    disabled={disabled}
                    maxLength={8}
                    className={cn(
                        "w-full pl-10 pr-3 py-2 text-sm rounded-md border bg-white shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                        error
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-200 focus:ring-gray-950 focus:border-gray-400 hover:border-gray-300"
                    )}
                />
                {inputValue.length > 0 && inputValue.length < 8 && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                        {placeholder}
                    </div>
                )}
            </div>

            {error && <p className="text-[0.8rem] font-medium text-red-500">{error}</p>}
        </div>
    );
}
