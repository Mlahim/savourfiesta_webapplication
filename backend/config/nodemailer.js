const sendEmail = async (options) => {
    try {
        const fromEmail = "noreply@savourfiesta.shop";
        const fromName = "Savour Fiesta";

        // Support single email or comma-separated emails
        const toList = options.to.split(',').map(e => ({ email: e.trim() }));

        const payload = {
            from: { email: fromEmail, name: fromName },
            to: toList,
            subject: options.subject,
            text: options.text || "",
            html: options.html || ""
        };

        // Bypasses Render's SMTP port block by using standard HTTPS (Port 443)
        const response = await fetch('https://send.api.mailtrap.io/api/send', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.MAILTRAP_PASS}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        
        if (!response.ok) {
            console.error('Mailtrap API Error:', data);
            throw new Error(`Email failed: ${JSON.stringify(data)}`);
        }

        console.log('Email sent successfully via API:', data);
        return data;
    } catch (error) {
        console.error('Error sending email via HTTP:', error);
        throw new Error('Email could not be sent');
    }
};

module.exports = sendEmail;
