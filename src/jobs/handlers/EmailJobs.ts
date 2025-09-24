import { transporter } from '@app/utils/emailConfig';
import codeHtml from '@app/templates/code_template';
import inviteTemplate from '@app/templates/inviteManagerTemplate';
import rentalTemplates from '@app/templates/message_rental_templates';

import { logger, CustomError } from '@app/utils/logger';

const mailOptionsCode = (email: string, code: string) => {  
    const subject = 'Verification Code';
    const text = `Your verification code is: ${code}`;
    const html = codeHtml(code);

    return {to: email, subject, text, html};
};

const mailOptionsCompany = (email: string, companyName: string, invitedBy: string, enterpriseName: string, inviteLink: string) => {
    const subject = `Convite para administrar a empresa ${companyName}`;
    const text = `Você foi convidado por ${invitedBy} para se tornar administrador da empresa ${enterpriseName}. Acesse: ${inviteLink}`;
    const html = inviteTemplate(inviteLink, enterpriseName, invitedBy);

    return {to: email, subject, text, html};
};

const mailOptionsRental = (email: string, reponseAdmin: string, productTitle: string, startDate: Date, endDate: Date, userName: string, companyName: string) => {
    const subject = `Confirmação de Aluguel: ${productTitle}`;
    const text = `Olá, recebemos sua solicitação de aluguel para o produto ${productTitle} do dia ${startDate.toLocaleDateString()} ao dia ${endDate.toLocaleDateString()}.`;
    const html = rentalTemplates(userName, companyName, productTitle, reponseAdmin);

    return {to: email, subject, text, html};
}

export const verificationCodeEmail = {
    key: 'sendVerificationCode',
    async handle({ data }: { data: { email: string, code: string } }) {
        const { email, code } = data;
        try {
            await transporter.sendMail(mailOptionsCode(email, code));
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

export const inviteEnterpriseAdminEmail = {
    key: 'inviteEnterpriseAdminEmail',
    async handle({ data }: { data: { email: string, nameAdmin: string, enterpriseName: string, inviteLink: string } }) {
        const { email, nameAdmin: invitedBy, enterpriseName, inviteLink } = data;

        try {
            await transporter.sendMail(mailOptionsCompany(email, enterpriseName, invitedBy, enterpriseName, inviteLink));
            logger.info(`Invite email sent successfully to ${email}`);
        } catch (error) {
            logger.error('Error sending invite email:', error);
            throw new CustomError('Error sending invite email', 500);
        }
    }
}

export const confirmableRental = {
    key: 'confirmableRental',
    async handle({ data }: { data: { email: string, rentalName: string, productTitle: string, startDate: Date, endDate: Date, response: string, userName: string } }) {
        const { email, rentalName, productTitle, startDate, endDate, response, userName } = data;

        try {
          await transporter.sendMail(mailOptionsRental(email, response, productTitle, startDate, endDate, userName, rentalName));
            return { success: true };
        } catch (error) {
            logger.error('Error sending confirmable rental email:', error);
            throw new CustomError('Error sending confirmable rental email', 500);
        }
    }
}
