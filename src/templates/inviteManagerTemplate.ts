const inviteAdminTemplate = (inviteLink: string, enterpriseName: string, invitedBy: string) => `
  <!DOCTYPE html>
  <html lang="pt-br">
  <head>
    <meta charset="UTF-8">
    <title>Convite para ser administrador - ${enterpriseName}</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f9f9f9;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding: 20px;">
      <tr>
        <td align="center">
          <table style="max-width: 600px; width: 100%; background-color: #ffffff; border: 1px solid #ddd; border-radius: 8px;">
            <tr>
              <td style="padding: 20px;">
                <h2 style="color: #333;">${invitedBy} convidou você para ser <span style="color: #196F79;">administrador</span> da empresa <strong>"${enterpriseName}"</strong></h2>
                <p style="font-size: 16px; color: #555;">Clique no botão abaixo para aceitar o convite:</p>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding: 10px;">
                <a href="${inviteLink}" style="background-color: #196F79; color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold;">
                  Aceitar Convite
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 20px;" align="center">
                <img src="https://cdn-icons-png.flaticon.com/512/3566/3566349.png" alt="Convite" style="max-width: 100%; height: auto; border-radius: 8px;" />
              </td>
            </tr>
            <tr>
              <td align="center" style="padding: 20px; font-size: 14px; color: #888;">
                Se você não reconhece este convite, ignore este e-mail.<br />
                © 2025 UEPB MULTI. Todos os direitos reservados.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
`;

export default inviteAdminTemplate;
