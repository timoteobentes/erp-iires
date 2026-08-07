import { Resend } from 'resend';

const FROM_NAME = 'SIGETES';
const FRONTEND_URL = () => process.env.FRONTEND_URL || 'http://localhost:5173';

function wrapEmail(title: string, bodyHtml: string): string {
  return `
    <div style="background-color: #F8F9FA; padding: 40px 20px; font-family: Arial, sans-serif; color: #001F3D; line-height: 1.6;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <div style="background-color: #001F3D; padding: 24px; text-align: center;">
          <h1 style="color: #FFFFFF; margin: 0; font-size: 24px; font-weight: bold;">${title}</h1>
        </div>
        <div style="padding: 32px 24px;">
          ${bodyHtml}
        </div>
        <div style="border-top: 1px solid #E3E6EA; padding: 20px; text-align: center; background-color: #fafbfc;">
          <p style="font-size: 12px; color: #576B7F; margin: 0;">SIGETES — Sistema de Gestão do Terceiro Setor</p>
        </div>
      </div>
    </div>
  `;
}

function ctaButton(href: string, label: string): string {
  return `
    <div style="text-align: center; margin: 32px 0;">
      <a href="${href}" style="background-color: #009082; color: #FFFFFF; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 16px;">${label}</a>
    </div>
  `;
}

export class MailService {
  static async sendMail(options: { to: string; subject: string; text: string; html?: string; attachments?: any[] }): Promise<void> {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'suporte@seudominio.com';

      const payload: any = {
        from: `${FROM_NAME} <${fromEmail}>`,
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
      const resetLink = `${FRONTEND_URL()}/reset-password?token=${token}`;

      const html = wrapEmail('Recuperação de Senha', `
        <p style="font-size: 16px; margin-top: 0;">Olá, ${name},</p>
        <p style="font-size: 16px;">Recebemos uma solicitação para redefinir a senha da sua conta no SIGETES. Se foi você, clique no botão abaixo para criar uma nova senha.</p>
        <p style="font-size: 16px;"><strong>Atenção:</strong> Este link expira em 15 minutos por motivos de segurança.</p>
        ${ctaButton(resetLink, 'Redefinir Minha Senha')}
        <p style="font-size: 14px; color: #576B7F; margin-bottom: 0;">Caso não tenha sido você quem solicitou, desconsidere este e-mail. Nenhuma alteração será feita na sua conta.</p>
      `);

      const { data, error } = await resend.emails.send({
        from: `${FROM_NAME} <${fromEmail}>`,
        to: [to],
        subject: 'Recuperação de Senha - SIGETES',
        html,
      });

      if (error) {
        console.error('❌ Erro da API do Resend ao enviar e-mail de recuperação:', error);
        return;
      }

      console.log(`📩 E-mail de recuperação enviado via Resend para ${to}. ID: ${data?.id}`);
    } catch (err) {
      console.error('❌ Erro crítico no MailService ao enviar e-mail de recuperação:', err);
    }
  }

  static async sendInviteEmail(params: { organizationName: string; inviterName: string; to: string; roleName: string; token: string }): Promise<void> {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'suporte@seudominio.com';
      const acceptLink = `${FRONTEND_URL()}/accept-invite?token=${params.token}`;

      const html = wrapEmail('Convite para o SIGETES', `
        <p style="font-size: 16px; margin-top: 0;">Olá,</p>
        <p style="font-size: 16px;"><strong>${params.inviterName}</strong> convidou você para fazer parte da organização <strong>${params.organizationName}</strong> no SIGETES, com o papel de <strong>${params.roleName}</strong>.</p>
        ${ctaButton(acceptLink, 'Aceitar convite')}
        <p style="font-size: 14px; color: #576B7F; margin-bottom: 0;">Este convite expira em 7 dias. Se você não esperava este convite, pode ignorar este e-mail com segurança.</p>
      `);

      const { data, error } = await resend.emails.send({
        from: `${FROM_NAME} <${fromEmail}>`,
        to: [params.to],
        subject: `Convite para ${params.organizationName} no SIGETES`,
        html,
      });

      if (error) {
        console.error('❌ Erro da API do Resend ao enviar convite:', error);
        return;
      }

      console.log(`📩 Convite enviado via Resend para ${params.to}. ID: ${data?.id}`);
    } catch (err) {
      console.error('❌ Erro crítico no MailService ao enviar convite:', err);
    }
  }
}
