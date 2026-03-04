"use client";

import { Input } from "@/components/ui/input";
import { ChangeEvent, useState } from "react";

interface DateInputProps extends React.ComponentProps<"input"> {
    className?: string; // Explicitly allow className to be passed
}

export function DateInput({ className, ...props }: DateInputProps) {
    const [value, setValue] = useState(props.defaultValue || "");

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        let input = e.target.value.replace(/\D/g, ""); // Remove non-digit characters

        if (input.length > 8) input = input.slice(0, 8); // Limit to 8 digits

        let formatted = input;
        if (input.length > 4) {
            formatted = `${input.slice(0, 2)}/${input.slice(2, 4)}/${input.slice(4)}`;
        } else if (input.length > 2) {
            formatted = `${input.slice(0, 2)}/${input.slice(2)}`;
        }

        setValue(formatted);

        // Propagate change if needed, though for form submission 'name' prop usually handles it via FormData
        if (props.onChange) {
            props.onChange(e);
        }
    };

    return (
        <Input
            {...props}
            value={value}
            onChange={handleChange}
            placeholder="DD/MM/YYYY"
            maxLength={10}
            className={className}
        />
    );
}
