const rentalAcceptedTemplate = (userName: string, companyName: string, spaceName: string, responseAdmin: string) => `
  <!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <title>Confirmação de Aluguel - ${companyName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f9f9f9;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 20px;">
    <tr>
      <td align="center">
        <table style="max-width: 600px; width: 100%; background-color: #54A3AC; border: 1px solid #ddd; border-radius: 8px;">
          <tr>
            <td align="center" style="padding: 20px 20px;">
              <img src="https://avatars.githubusercontent.com/u/174046595?s=200&v=4" alt="Logo UEPB MULTI" style="width: 100px; height: 100px; display: block; margin: 0 auto;">
            </td>
          </tr>
          <tr>
            <td style="padding: 10px;" align="center">
              <h2 style="color: #333;">Olá, ${userName}!</h2>
              <p style="font-size: 16px; color: #555;">
                Temos uma ótima notícia 🎉 A empresa <strong>${companyName}</strong> aceitou sua solicitação de aluguel para o espaço <span style="color: #fc630a; font-weight: bold;">${spaceName}</span>.
              </p>
              <p style="font-size: 16px; color: #555;">Clique no botão abaixo para visualizar os detalhes:</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 40px;">
              <a href="${responseAdmin}" style="background-color: #E97938; color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold;">
                Ver Detalhes do Aluguel
              </a>
            </td>
          </tr>
          <tr>
            <td align="center" style="background-color: #196F79; padding: 20px; color: #ffffff; font-size: 14px; line-height: 1.5; border-radius: 0 0 8px 8px;">
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

export default rentalAcceptedTemplate;
