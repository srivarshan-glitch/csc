"use server";

export async function sendWhatsAppMessage(phone: string, invoiceNo: string, amount: number) {
    const WHATSAPP_API_TOKEN = process.env.WHATSAPP_API_TOKEN;
    const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!WHATSAPP_API_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
        console.error("WhatsApp credentials missing in .env");
        return { success: false, error: "Credentials missing" };
    }

    try {
        const response = await fetch(`https://graph.facebook.com/v17.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${WHATSAPP_API_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                messaging_product: "whatsapp",
                to: phone,
                type: "template",
                template: {
                    name: "payment_reminder",
                    language: {
                        code: "en_US"
                    },
                    components: [
                        {
                            type: "body",
                            parameters: [
                                { type: "text", text: invoiceNo },
                                { type: "text", text: amount.toString() }
                            ]
                        }
                    ]
                }
                // Fallback to text message for 24h window if template fails or for testing
                // type: "text",
                // text: { body: `Invoice ${invoiceNo} Payment Reminder: ₹${amount} is pending.` }
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("WhatsApp API Error:", data);
            return { success: false, error: data.error?.message || "Failed to send" };
        }

        return { success: true, data };
    } catch (error) {
        console.error("WhatsApp Send Exception:", error);
        return { success: false, error: "Network error" };
    }
}
