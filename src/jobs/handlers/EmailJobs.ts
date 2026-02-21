import { resend } from '@app/utils/emailConfig';
import codeHtml from '@app/templates/code_template';
import inviteTemplate from '@app/templates/inviteManagerTemplate';
import rentalTemplates from '@app/templates/message_rental_templates';

import { logger, CustomError } from '@app/utils/logger';


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
            await resend.emails.send({
                from: "uepb.multi@gmail.com",
                to: email,
                subject: "Código de Verificação",
                html: codeHtml(code)
            });

            logger.info(`Verification code sent successfully to ${email}`);
            return { success: true };
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

    async handle({ data }: {
        data: { email: string, nameAdmin: string, enterpriseName: string, inviteLink: string }
    }) {
        const { email, nameAdmin: invitedBy, enterpriseName, inviteLink } = data;

        try {            
            await resend.emails.send({
                from: 'onboarding@resend.dev',
                to: email,
                subject: `Convite para administrar a empresa ${enterpriseName}`,
                html: inviteTemplate(inviteLink, enterpriseName, invitedBy),
            });

            logger.info(`Invite email sent successfully to ${email}`);
            return { success: true };
        } catch (error) {
            logger.error('Error sending invite email:', error);
            throw new CustomError('Error sending invite email', 500);
        }
    }
}

export const confirmableRental = {
    key: 'confirmableRental',

    async handle({ data }: {
        data: {
            email: string,
            rentalName: string,
            productTitle: string,
            startDate: Date,
            endDate: Date,
            response: string,
            userName: string
        }
    }) {
        const { email, rentalName, productTitle, startDate, endDate, response, userName } = data;

        try {
          await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: email,
            subject: `Confirmação de Aluguel: ${productTitle}`,
            html: rentalTemplates(userName, rentalName, productTitle, response),
          });
            
            return { success: true };
        } catch (error) {
            logger.error('Error sending confirmable rental email:', error);
            throw new CustomError('Error sending confirmable rental email', 500);
        }
    }
}
