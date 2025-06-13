const codeHtml = (code: string) => `
<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Código de Verificação - RCC Paraíba</title>
</head>
<body style="margin:0; padding:0; font-family: Arial, Helvetica, sans-serif;">
  <table border="0" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table border="0" width="100%" max-width="600px" cellpadding="0" cellspacing="0" style="background-color: #02BA44; border-radius: 10px; overflow: hidden;">
          <tr>
            <td align="center" style="padding: 60px 20px;">
              <img src="https://diocesedeluz.org.br/wp-content/uploads/2016/06/m3.png" Logo RCC Paraíba" style="width: 100px; height: auto; display: block; margin: 0 auto;">
              <h1 style="color: #ffffff; font-size: 24px; margin: 20px 0;">Verificação de Email</h1>
            </td>
          </tr>
          <tr>
            <td align="center" style="color: #ffffff; padding: 0 30px; font-size: 16px; line-height: 1.5;">
              Olá, seu código de verificação é:
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 20px;">
              <h2 style="background-color: #ffeb3b; color: #02BA44; padding: 15px 25px; border-radius: 5px; font-size: 20px; font-weight: bold; display: inline-block; margin: 0;">
                ${code}
              </h2>
            </td>
          </tr>
          <tr>
            <td align="center" style="color: #ffffff; padding: 0 30px; font-size: 16px; line-height: 1.5;">
              <strong>Este código deve ser usado em até 3 minutos. NUNCA compartilhe este código com outras pessoas.</strong>
            </td>
          </tr>
          <tr>
            <td align="center" style="background-color: #029c39; padding: 20px; color: #ffffff; font-size: 14px; line-height: 1.5;">
              <p style="margin: 0;">Se você não reconhece esta solicitação, por favor ignore este e-mail.</p>
              <p style="margin: 0;">&copy; 2025 RCC Paraíba. Todos os direitos reservados.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

export default codeHtml;
