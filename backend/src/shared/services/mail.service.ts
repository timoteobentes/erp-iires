import { Resend } from 'resend';

export class MailService {
  static async sendMail(options: { to: string; subject: string; text: string; html?: string; attachments?: any[] }): Promise<void> {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'suporte@seudominio.com';

      const payload: any = {
        from: `ERP IIRes <${fromEmail}>`,
        to: [options.to],
        subject: options.subject,
        text: options.text,
      };

      if (options.html) {
        payload.html = options.html;
      }

      if (options.attachments && options.attachments.length > 0) {
        payload.attachments = options.attachments.map(att => ({
          filename: att.filename,
          content: att.content
        }));
      }

      const { data, error } = await resend.emails.send(payload);

      if (error) {
        console.error('❌ Erro da API do Resend:', error);
        return;
      }

      console.log(`📩 E-mail enviado via Resend para ${options.to}. ID: ${data?.id}`);
    } catch (err) {
      console.error('❌ Erro crítico no MailService:', err);
    }
  }

  static async sendResetPasswordEmail(name: string, to: string, token: string): Promise<void> {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'suporte@seudominio.com';
      const resetLink = `http://localhost:5173/reset-password?token=${token}`;

      const htmlContent = `
        <div style="background-color: #F8F9FA; padding: 40px 20px; font-family: Arial, sans-serif; color: #313450; line-height: 1.6;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
            <div style="background-color: #0047AF; padding: 24px; text-align: center;">
              <h1 style="color: #FFFFFF; margin: 0; font-size: 24px; font-weight: bold;">Recuperação de Senha</h1>
            </div>
            <div style="padding: 32px 24px;">
              <p style="font-size: 16px; margin-top: 0;">Olá, ${name},</p>
              <p style="font-size: 16px;">Recebemos uma solicitação para redefinir a senha da sua conta no ERP IIRes. Se foi você, clique no botão abaixo para criar uma nova senha.</p>
              <p style="font-size: 16px;"><strong>Atenção:</strong> Este link expira em 15 minutos por motivos de segurança.</p>
              
              <div style="text-align: center; margin: 32px 0;">
                <a href="${resetLink}" style="background-color: #389334; color: #FFFFFF; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 16px;">Redefinir Minha Senha</a>
              </div>
              
              <p style="font-size: 14px; color: #7a8296; margin-bottom: 0;">Caso não tenha sido você quem solicitou, desconsidere este e-mail. Nenhuma alteração será feita na sua conta.</p>
            </div>
            <div style="border-top: 1px solid #ebecef; padding: 20px; text-align: center; background-color: #fafbfc;">
              <p style="font-size: 12px; color: #7a8296; margin: 0;">IIRes - Instituto de Inovação e Responsabilidade Social da Amazônia</p>
            </div>
          </div>
        </div>
      `;

      const payload: any = {
        from: `ERP IIRes <${fromEmail}>`,
        to: [to],
        subject: 'Recuperação de Senha - ERP IIRes',
        html: htmlContent,
      };

      const { data, error } = await resend.emails.send(payload);

      if (error) {
        console.error('❌ Erro da API do Resend ao enviar e-mail de recuperação:', error);
        return;
      }

      console.log(`📩 E-mail de recuperação enviado via Resend para ${to}. ID: ${data?.id}`);
    } catch (err) {
      console.error('❌ Erro crítico no MailService ao enviar e-mail de recuperação:', err);
    }
  }
}
