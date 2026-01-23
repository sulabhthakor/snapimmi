'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

interface DatePickerProps {
    value?: Date;
    onChange: (date: Date | undefined) => void;
    placeholder?: string;
    label?: string;
    error?: string;
    disabled?: boolean;
}

export function DatePicker({ value, onChange, placeholder = 'Pick a date', label, error, disabled }: DatePickerProps) {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <div className="space-y-2 w-full">
            {label && <label className="text-sm font-semibold text-gray-900">{label}</label>}

            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        disabled={disabled}
                        className={cn(
                            "w-full justify-start text-left font-normal",
                            !value && "text-muted-foreground text-gray-500",
                            error ? "border-red-500 hover:bg-white" : ""
                        )}
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {value ? format(value, "PPP") : <span>{placeholder}</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={value}
                        onSelect={(date) => {
                            onChange(date);
                            setIsOpen(false);
                        }}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>

            {error && <p className="text-[0.8rem] font-medium text-red-500">{error}</p>}
        </div>
    );
}
