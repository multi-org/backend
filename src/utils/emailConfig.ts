import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
    host: String(process.env.EMAIL_HOST),
    port: Number(process.env.EMAIL_PORT),
    secure: true,
    auth: {
        user: String(process.env.EMAIL_USER),
        pass: String(process.env.EMAIL_PASSWORD)
    }
});

transporter.verify((error) => {
    if (error) {
        console.error('SMTP connection error:', error);
    } else {
        console.log('SMTP connection successful');
    }
    }
);