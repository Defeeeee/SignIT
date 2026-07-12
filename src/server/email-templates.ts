function logoUrl(): string | null {
  return process.env.AUTH_URL ? `${process.env.AUTH_URL}/logo-signit.png` : null;
}

export function magicLinkEmailHtml(url: string): string {
  const logo = logoUrl();
  const logoTag = logo
    ? `<img src="${logo}" alt="SignIT" width="120" style="display:block;margin:0 auto 24px auto;" />`
    : `<p style="margin:0 0 24px 0;font-size:20px;font-weight:800;color:#06167c;">SignIT</p>`;

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SignIT</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:40px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" style="max-width:440px;background-color:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #dadada;">
            <tr>
              <td style="padding:32px 32px 24px 32px;text-align:center;">
                ${logoTag}
                <h1 style="margin:0 0 12px 0;font-size:22px;line-height:1.3;color:#000000;">Ingresá a SignIT</h1>
                <p style="margin:0 0 28px 0;font-size:15px;line-height:1.5;color:#444444;">
                  Tocá el botón para entrar. El link vence en 24 horas y solo funciona una vez.
                </p>
                <a href="${url}" style="display:inline-block;background-color:#06167c;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:14px 32px;border-radius:12px;">
                  Ingresar a SignIT
                </a>
                <p style="margin:28px 0 0 0;font-size:12px;line-height:1.5;color:#444444;">
                  Si el botón no funciona, copiá y pegá este link:<br>
                  <a href="${url}" style="color:#06167c;word-break:break-all;">${url}</a>
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;background-color:#eeeeee;text-align:center;">
                <p style="margin:0;font-size:12px;color:#444444;">
                  Si no pediste este acceso, ignorá este mail.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function magicLinkEmailText(url: string): string {
  return `Ingresá a SignIT\n\nTocá el link para entrar (vence en 24 horas, uso único):\n${url}\n\nSi no pediste este acceso, ignorá este mail.`;
}
