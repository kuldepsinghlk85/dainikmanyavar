import nodemailer from 'nodemailer';

export interface InquiryData {
  id: string;
  name: string;
  email?: string | null;
  phone: string;
  location?: string | null;
  category: string;
  subject: string;
  message: string;
  createdAt?: Date;
}

export const CATEGORY_LABELS: Record<string, string> = {
  NEWS_TIP: '📰 समाचार / खबर / प्रेस विज्ञप्ति',
  ADVERTISEMENT: '📢 विज्ञापन पूछताछ',
  GRIEVANCE: '⚖️ शिकायत / सुधार / खंडन',
  EDITORIAL: '✍️ संपादकीय / लेख / विचार',
  CAREER: '💼 रिपोर्टर / संवाददाता आवेदन',
  GENERAL: '❓ सामान्य पूछताछ / अन्य',
};

export const EDITOR_EMAIL = 'editor.dainikmanyavar@gmail.com';
export const EDITOR_PHONE = '919336181297';
export const SITE_NAME = 'दैनिक मान्यवर';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3015';

/**
 * Builds a direct pre-filled WhatsApp link for the editor
 */
export function buildEditorWhatsAppUrl(inquiry: InquiryData): string {
  const catLabel = CATEGORY_LABELS[inquiry.category] || inquiry.category;
  const lines = [
    '*🔔 दैनिक मान्यवर - नया संपर्क संदेश*',
    '━━━━━━━━━━━━━━━━━━━━',
    `👤 *नाम:* ${inquiry.name}`,
    `📞 *मोबाइल:* ${inquiry.phone}`,
    inquiry.email ? `✉️ *ईमेल:* ${inquiry.email}` : null,
    inquiry.location ? `📍 *स्थान:* ${inquiry.location}` : null,
    `📂 *श्रेणी:* ${catLabel}`,
    `📌 *विषय:* ${inquiry.subject}`,
    '━━━━━━━━━━━━━━━━━━━━',
    `💬 *संदेश:*\n${inquiry.message}`,
    '━━━━━━━━━━━━━━━━━━━━',
    `🔗 *पोर्टल लिंक:* ${SITE_URL}/admin/inquiries`,
  ]
    .filter(Boolean)
    .join('\n');

  return `https://wa.me/${EDITOR_PHONE}?text=${encodeURIComponent(lines)}`;
}

/**
 * Builds user WhatsApp chat link for admin
 */
export function buildUserWhatsAppUrl(phone: string, replyText?: string): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const formatted = cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone;
  const text = replyText ? `?text=${encodeURIComponent(replyText)}` : '';
  return `https://wa.me/${formatted}${text}`;
}

function getTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
}

/**
 * Send notification email to the editor (editor.dainikmanyavar@gmail.com)
 */
export async function sendAdminNotificationEmail(inquiry: InquiryData) {
  const catLabel = CATEGORY_LABELS[inquiry.category] || inquiry.category;
  const waUrl = buildEditorWhatsAppUrl(inquiry);
  const userWaUrl = buildUserWhatsAppUrl(inquiry.phone);

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 620px; margin: 0 auto; background: #FFF7ED; border: 1px solid #FED7AA; border-radius: 12px; overflow: hidden; color: #1E293B;">
      <div style="background: linear-gradient(135deg, #EA580C, #C2410C); padding: 22px; text-align: center; color: white;">
        <h2 style="margin: 0; font-size: 22px; font-weight: bold;">दैनिक मान्यवर</h2>
        <p style="margin: 5px 0 0 0; font-size: 13px; opacity: 0.9;">पोर्टल नया संपर्क सूचना (New Inquiry Alert)</p>
      </div>

      <div style="padding: 24px; background: #FFFFFF;">
        <div style="display: inline-block; background: #FFEDD5; color: #C2410C; padding: 4px 14px; border-radius: 9999px; font-weight: bold; font-size: 13px; margin-bottom: 16px;">
          ${catLabel}
        </div>

        <h3 style="margin: 0 0 16px 0; color: #0F172A; font-size: 18px; border-bottom: 2px solid #FED7AA; padding-bottom: 10px;">
          ${inquiry.subject}
        </h3>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
          <tr>
            <td style="padding: 8px 0; color: #64748B; width: 130px; font-weight: bold;">प्रेषक का नाम:</td>
            <td style="padding: 8px 0; color: #0F172A; font-weight: bold;">${inquiry.name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748B; font-weight: bold;">मोबाइल नंबर:</td>
            <td style="padding: 8px 0; color: #0F172A;">
              <a href="tel:${inquiry.phone}" style="color: #EA580C; font-weight: bold; text-decoration: none;">${inquiry.phone}</a>
              &nbsp;|&nbsp;
              <a href="${userWaUrl}" target="_blank" style="color: #16A34A; text-decoration: none; font-weight: bold;">WhatsApp पर चैट करें 💬</a>
            </td>
          </tr>
          ${
            inquiry.email
              ? `<tr>
            <td style="padding: 8px 0; color: #64748B; font-weight: bold;">ईमेल:</td>
            <td style="padding: 8px 0; color: #0F172A;"><a href="mailto:${inquiry.email}" style="color: #2563EB;">${inquiry.email}</a></td>
          </tr>`
              : ''
          }
          ${
            inquiry.location
              ? `<tr>
            <td style="padding: 8px 0; color: #64748B; font-weight: bold;">स्थान / शहर:</td>
            <td style="padding: 8px 0; color: #0F172A;">${inquiry.location}</td>
          </tr>`
              : ''
          }
          <tr>
            <td style="padding: 8px 0; color: #64748B; font-weight: bold;">तारीख व समय:</td>
            <td style="padding: 8px 0; color: #64748B;">${new Date().toLocaleString('hi-IN', { timeZone: 'Asia/Kolkata' })}</td>
          </tr>
        </table>

        <div style="background: #F8FAFC; border-left: 4px solid #EA580C; padding: 14px 16px; border-radius: 4px; margin-bottom: 24px;">
          <strong style="display: block; margin-bottom: 6px; color: #334155; font-size: 13px;">संदेश विवरण:</strong>
          <p style="margin: 0; color: #1E293B; line-height: 1.6; white-space: pre-wrap; font-size: 14px;">${inquiry.message}</p>
        </div>

        <div style="text-align: center; margin-top: 24px;">
          <a href="${SITE_URL}/admin/inquiries" style="display: inline-block; background: #EA580C; color: #FFFFFF; font-weight: bold; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-size: 13px; margin: 4px;">
            एडमिन पोर्टल में देखें
          </a>
          <a href="${waUrl}" target="_blank" style="display: inline-block; background: #16A34A; color: #FFFFFF; font-weight: bold; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-size: 13px; margin: 4px;">
            WhatsApp अलर्ट देखें
          </a>
        </div>
      </div>

      <div style="background: #FFF7ED; padding: 12px; text-align: center; font-size: 11px; color: #9A5A2E; border-top: 1px solid #FED7AA;">
        दैनिक मान्यवर पोर्टल स्वचालित सूचना प्रणाली | editor.dainikmanyavar@gmail.com
      </div>
    </div>
  `;

  const transporter = getTransporter();
  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"${SITE_NAME} पोर्टल" <${process.env.SMTP_FROM || process.env.SMTP_USER || EDITOR_EMAIL}>`,
        to: EDITOR_EMAIL,
        subject: `[दैनिक मान्यवर संपर्क] ${catLabel}: ${inquiry.subject} (प्रेषक: ${inquiry.name})`,
        html: htmlContent,
      });
      return { success: true, delivered: true };
    } catch (err) {
      console.error('[Mailer] Error sending admin notification email:', err);
      return { success: false, error: err };
    }
  } else {
    console.log('[Mailer] SMTP not configured in .env. Admin Notification Email payload simulated for:', {
      to: EDITOR_EMAIL,
      subject: `[दैनिक मान्यवर संपर्क] ${catLabel}: ${inquiry.subject}`,
      inquiryId: inquiry.id,
      fromName: inquiry.name,
      phone: inquiry.phone,
    });
    return { success: true, delivered: false, simulated: true };
  }
}

/**
 * Send Thank You / Acknowledgement email to the user if email provided
 */
export async function sendUserThankYouEmail(inquiry: InquiryData) {
  if (!inquiry.email || !inquiry.email.includes('@')) {
    return { success: false, reason: 'No valid user email provided' };
  }

  const catLabel = CATEGORY_LABELS[inquiry.category] || inquiry.category;

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #FFF7ED; border: 1px solid #FED7AA; border-radius: 12px; overflow: hidden; color: #1E293B;">
      <div style="background: linear-gradient(135deg, #EA580C, #C2410C); padding: 24px; text-align: center; color: white;">
        <h2 style="margin: 0; font-size: 24px; font-weight: bold;">दैनिक मान्यवर</h2>
        <p style="margin: 6px 0 0 0; font-size: 13px; opacity: 0.95;">सच के साथ... समाज के लिए...</p>
      </div>

      <div style="padding: 28px 24px; background: #FFFFFF;">
        <p style="font-size: 16px; margin: 0 0 16px 0; color: #0F172A;">
          प्रिय <strong>${inquiry.name}</strong> जी, सादर नमस्कार!
        </p>

        <p style="font-size: 14px; line-height: 1.7; color: #334155; margin: 0 0 16px 0;">
          <strong>दैनिक मान्यवर</strong> से संपर्क करने के लिए आपका बहुत-बहुत धन्यवाद। आपका संदेश हमारी संपादकीय व पाठक सेवा टीम को सफलतापूर्वक प्राप्त हो चुका है।
        </p>

        <div style="background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <h4 style="margin: 0 0 10px 0; color: #166534; font-size: 14px;">आपके संदेश का संक्षिप्त विवरण:</h4>
          <p style="margin: 4px 0; font-size: 13px; color: #14532D;"><strong>संदर्भ संख्या (Reference ID):</strong> #${inquiry.id.slice(0, 8).toUpperCase()}</p>
          <p style="margin: 4px 0; font-size: 13px; color: #14532D;"><strong>श्रेणी:</strong> ${catLabel}</p>
          <p style="margin: 4px 0; font-size: 13px; color: #14532D;"><strong>विषय:</strong> ${inquiry.subject}</p>
        </div>

        <p style="font-size: 14px; line-height: 1.7; color: #334155; margin: 0 0 20px 0;">
          हमारी संबंधित टीम आपके संदेश की समीक्षा कर रही है और आवश्यकतानुसार जल्द ही आपसे संपर्क करेगी।
        </p>

        <div style="border-top: 1px solid #F1F5F9; padding-top: 18px; margin-top: 24px; font-size: 13px; color: #64748B;">
          <p style="margin: 4px 0;"><strong>सीधे संपर्क के लिए:</strong></p>
          <p style="margin: 4px 0;">📞 फ़ोन / कॉल: <a href="tel:+919336181297" style="color: #EA580C; text-decoration: none; font-weight: bold;">+91 93361 81297</a></p>
          <p style="margin: 4px 0;">📲 WhatsApp: <a href="https://wa.me/919336181297" style="color: #16A34A; text-decoration: none; font-weight: bold;">+91 93361 81297</a></p>
          <p style="margin: 4px 0;">✉️ संपादकीय ईमेल: <a href="mailto:${EDITOR_EMAIL}" style="color: #EA580C; text-decoration: none; font-weight: bold;">${EDITOR_EMAIL}</a></p>
          <p style="margin: 4px 0;">🌐 वेबसाइट: <a href="https://dainikmanyawar.in" style="color: #EA580C; text-decoration: none;">dainikmanyawar.in</a></p>
        </div>
      </div>

      <div style="background: #FFF7ED; padding: 14px; text-align: center; font-size: 12px; color: #9A5A2E; border-top: 1px solid #FED7AA;">
        दैनिक मान्यवर डिजिटल नेटवर्क | सर्वाधिकार सुरक्षित
      </div>
    </div>
  `;

  const transporter = getTransporter();
  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"${SITE_NAME}" <${process.env.SMTP_FROM || process.env.SMTP_USER || EDITOR_EMAIL}>`,
        to: inquiry.email,
        subject: `दैनिक मान्यवर से संपर्क करने के लिए धन्यवाद (Ref #${inquiry.id.slice(0, 8).toUpperCase()})`,
        html: htmlContent,
      });
      return { success: true, delivered: true };
    } catch (err) {
      console.error('[Mailer] Error sending user thank-you email:', err);
      return { success: false, error: err };
    }
  } else {
    console.log('[Mailer] SMTP not configured in .env. User Thank-You Email payload simulated for:', {
      to: inquiry.email,
      name: inquiry.name,
      inquiryId: inquiry.id,
      subject: 'दैनिक मान्यवर से संपर्क करने के लिए धन्यवाद',
    });
    return { success: true, delivered: false, simulated: true };
  }
}
