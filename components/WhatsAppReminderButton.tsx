"use client";

import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

interface WhatsAppReminderButtonProps {
    studentName: string;
    phone: string;
    balance: number;
    totalFee: number;
    paidAmount: number;
    course: string;
}

export function WhatsAppReminderButton({
    studentName,
    phone,
    balance,
    totalFee,
    paidAmount,
    course,
}: WhatsAppReminderButtonProps) {
    const handleSendReminder = () => {
        const message = `Hello ${studentName}, \n\nFee Payment Reminder \n\nThis is a gentle reminder that your fee payment of ₹${balance.toLocaleString()} is pending.\n\nCourse Name: ${course}\n\nFee Details:\nTotal Course Fee: ₹${totalFee.toLocaleString()}\nAmount Paid: ₹${paidAmount.toLocaleString()}\nPending Amount: ₹${balance.toLocaleString()}\n\nKindly clear the pending amount at the earliest to avoid any inconvenience.\n\nThank you,\nCSC Computer Education \nMaraimalai Nagar`;

        const cleanPhone = phone.replace(/[^0-9]/g, '');
        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/${cleanPhone}?text=${encodedMessage}`, '_blank');
    };

    return (
        <Button
            onClick={handleSendReminder}
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
            title="Send WhatsApp Reminder"
        >
            <MessageCircle className="h-4 w-4" />
            <span className="sr-only">Send Reminder</span>
        </Button>
    );
}
