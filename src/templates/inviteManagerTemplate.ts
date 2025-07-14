const inviteAdminTemplate = (inviteLink: string, companyName: string, userName: string) => `
  <!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <title>Convite para ser administrador - Tech Solutions LTDA</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f9f9f9;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 20px;">
    <tr >
      <td align="center">
        <table style="max-width: 600px; width: 100%; background-color: #54A3AC; border: 1px solid #ddd; border-radius: 8px;">
            <tr>
              <td align="center" style="padding: 20px 20px;">
                <img src="https://avatars.githubusercontent.com/u/174046595?s=200&v=4" alt="Logo UEPB MULTI" style="width: 100px; height: 100px; display: block; margin: 0 auto;">
              </td>
            </tr>
          <tr>
            <td style="padding: 10px;" align="center">
              <h2 style="color: #333;"> <span>Olá, </span>${userName}. Você foi convidado para ser <span style="color: #fc630a; ">administrador</span> da empresa <strong>${companyName}</strong> <span> dentro da plataforma UEPB MULTI.</span></h2>
              <p style="font-size: 16px; color: #555;">Clique no botão abaixo para aceitar o convite:</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 50px;">
              <a href="${inviteLink}" style="background-color: #E97938; color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold;">
                Aceitar Convite
              </a>
            </td>
          </tr>
         
              <td align="center" style="background-color: #196F79; padding: 20px; color: #ffffff; font-size: 14px; line-height: 1.5;">
                <p style="margin: 0;">Se você não reconhece esta solicitação, por favor ignore este e-mail.</p>
                <p style="margin: 0;">&copy; 2025 UEPB MULTI. Todos os direitos reservados.</p>
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
