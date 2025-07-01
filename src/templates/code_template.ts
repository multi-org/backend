const codeHtml = (code: string) => `
  <!DOCTYPE html>
  <html lang="pt-br">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Código de Verificação - UEPB MULTI</title>
  </head>
  <body style="margin:0; padding:0; font-family: Arial, Helvetica, sans-serif;">
    <table border="0" width="100%" cellpadding="0" cellspacing="0" style="background-color: #FBF9FE; padding: 20px;">
      <tr>
        <td align="center">
          <table border="0" width="100%" max-width="600px" cellpadding="0" cellspacing="0" style="background-color: #54A3AC; border-radius: 10px; overflow: hidden;">
            <tr>
              <td align="center" style="padding: 60px 20px;">
                <img src="https://avatars.githubusercontent.com/u/174046595?s=200&v=4" alt="Logo UEPB MULTI" style="width: 100px; height: 100px; display: block; margin: 0 auto;">
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
                <h2 style="background-color: #E97938; color: #ffffff; padding: 15px 25px; border-radius: 5px; font-size: 20px; font-weight: bold; display: inline-block; margin: 0;">
                  ${code}
                </h2>
              </td>
            </tr>
            <tr>
              <td align="center" style="color: #ffffff; padding: 0 30px; font-size: 16px; line-height: 1.5;">
                <strong>Este código deve ser usado em até 3 minutos. NÃO compartilhe este código com ninguém.</strong>
              </td>
            </tr>
            <tr>
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

export default codeHtml;
