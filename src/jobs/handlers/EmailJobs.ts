import { transporter } from '@app/utils/emailConfig';
import codeHtml from '@app/templates/code_template';
import { logger, CustomError } from '@app/utils/logger';

const mailOptions = (email: string, code: string) => {  
    const subject = 'Verification Code';
    const text = `Your verification code is: ${code}`;
    const html = codeHtml(code);

    return {to: email, subject, text, html};
};

export const verificationCodeEmail = {
    key: 'sendVerificationCode',
    async handle({ data }: { data: { email: string, code: string } }) {
        const { email, code } = data;
        try {
            await transporter.sendMail(mailOptions(email, code));
            logger.info(`Verification code sent suceccessfully`);
        } catch (error) {
            logger.error('Error sending verification code to email:', error);
            throw new CustomError('Error sending verification code to email', 500);
        }
    }
}

export const welcomeEmail = {
    key: 'WelcomeEmail',
    async handle({data}: {data: {email:string, name: string}}) {
        try {
            // Implementação do envio de email de boas-vindas
            // ...
            return { success: true };
        } catch (error) {
            logger.error('Error sending welcome email:', error);
            throw new CustomError('Error sending welcome email', 500);
        }
    }
}
