import nodemailer from 'nodemailer'

// Sends an email using SMTP credentials from .env.
// If SMTP is not configured (no SMTP_HOST/SMTP_USER/SMTP_PASS), it falls back
// to printing the email to the console so the flow still works in local/dev
// environments without an email account set up.
const sendEmail = async ({ to, subject, html }) => {
    const smtpConfigured = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS

    if (!smtpConfigured) {
        console.log('\n================ EMAIL (DEV MODE - SMTP NOT CONFIGURED) ================')
        console.log('To:', to)
        console.log('Subject:', subject)
        console.log('Body:\n', html)
        console.log('==========================================================================\n')
        return
    }

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    })

    await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to,
        subject,
        html
    })
}

export default sendEmail
