import { Lead } from '../types';

/**
 * ========================================
 * NOTIFICATION CONFIGURATION
 * Update these values with your credentials
 * ========================================
 */

// Email notification via EmailJS (https://www.emailjs.com)
const EMAILJS_CONFIG = {
  serviceId: 'YOUR_EMAILJS_SERVICE_ID',      // Get from EmailJS dashboard
  templateId: 'YOUR_EMAILJS_TEMPLATE_ID',    // Create a template in EmailJS
  publicKey: 'YOUR_EMAILJS_PUBLIC_KEY',       // Get from EmailJS dashboard
  adminEmail: 'admin@dthstore.shop'           // Your email to receive notifications
};

// Telegram Bot notification
const TELEGRAM_CONFIG = {
  botToken: 'YOUR_TELEGRAM_BOT_TOKEN',        // Get from @BotFather
  chatId: 'YOUR_TELEGRAM_CHAT_ID'             // Your personal/group chat ID
};

// WhatsApp notification (using CallMeBot or similar service)
const WHATSAPP_CONFIG = {
  phoneNumber: '919311252564',                // Your WhatsApp number
  apiKey: 'YOUR_CALLMEBOT_API_KEY'            // Get from https://www.callmebot.com/
};

// Web3Forms for reliable email delivery (https://web3forms.com)
const WEB3FORMS_CONFIG = {
  accessKey: 'YOUR_WEB3FORMS_ACCESS_KEY'      // Get free key from web3forms.com
};

/**
 * ========================================
 * NOTIFICATION FUNCTIONS
 * ========================================
 */

/**
 * Send Email via EmailJS
 */
const sendEmailNotification = async (lead: Lead): Promise<boolean> => {
  // Check if EmailJS is configured
  if (EMAILJS_CONFIG.serviceId === 'YOUR_EMAILJS_SERVICE_ID') {
    console.log('[Email] EmailJS not configured - skipping email notification');
    return false;
  }

  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: EMAILJS_CONFIG.serviceId,
        template_id: EMAILJS_CONFIG.templateId,
        user_id: EMAILJS_CONFIG.publicKey,
        template_params: {
          to_email: EMAILJS_CONFIG.adminEmail,
          lead_name: lead.name,
          lead_mobile: lead.mobile,
          lead_service: lead.serviceType,
          lead_operator: lead.operator,
          lead_location: lead.location,
          lead_source: lead.source,
          lead_date: new Date().toLocaleString('en-IN')
        }
      })
    });

    if (response.ok) {
      console.log('✅ [Email] Notification sent successfully');
      return true;
    }
    throw new Error('Email send failed');
  } catch (error) {
    console.error('❌ [Email] Failed to send:', error);
    return false;
  }
};

/**
 * Send Email via Web3Forms (simpler alternative)
 */
const sendWeb3FormsNotification = async (lead: Lead): Promise<boolean> => {
  if (WEB3FORMS_CONFIG.accessKey === 'YOUR_WEB3FORMS_ACCESS_KEY') {
    console.log('[Web3Forms] Not configured - skipping');
    return false;
  }

  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_key: WEB3FORMS_CONFIG.accessKey,
        subject: `🔔 New Lead: ${lead.name} - ${lead.serviceType}`,
        from_name: 'DTH Store Website',
        name: lead.name,
        mobile: lead.mobile,
        service: lead.serviceType,
        operator: lead.operator,
        location: lead.location,
        source: lead.source
      })
    });

    const data = await response.json();
    if (data.success) {
      console.log('✅ [Web3Forms] Email sent successfully');
      return true;
    }
    throw new Error(data.message);
  } catch (error) {
    console.error('❌ [Web3Forms] Failed:', error);
    return false;
  }
};

/**
 * Send Telegram notification
 */
const sendTelegramNotification = async (lead: Lead): Promise<boolean> => {
  if (TELEGRAM_CONFIG.botToken === 'YOUR_TELEGRAM_BOT_TOKEN') {
    console.log('[Telegram] Bot not configured - skipping');
    return false;
  }

  const message = `
🔔 *New Lead Alert!*

👤 *Name:* ${lead.name}
📱 *Mobile:* ${lead.mobile}
🏠 *Location:* ${lead.location}
📺 *Service:* ${lead.serviceType}
🎯 *Operator:* ${lead.operator}
🌐 *Source:* ${lead.source}
📅 *Time:* ${new Date().toLocaleString('en-IN')}

[📞 Call Now](tel:+91${lead.mobile})
[💬 WhatsApp](https://wa.me/91${lead.mobile})
`;

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_CONFIG.botToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CONFIG.chatId,
          text: message,
          parse_mode: 'Markdown',
          disable_web_page_preview: true
        })
      }
    );

    const data = await response.json();
    if (data.ok) {
      console.log('✅ [Telegram] Notification sent successfully');
      return true;
    }
    throw new Error(data.description);
  } catch (error) {
    console.error('❌ [Telegram] Failed to send:', error);
    return false;
  }
};

/**
 * Send WhatsApp notification via CallMeBot
 */
const sendWhatsAppNotification = async (lead: Lead): Promise<boolean> => {
  if (WHATSAPP_CONFIG.apiKey === 'YOUR_CALLMEBOT_API_KEY') {
    console.log('[WhatsApp] CallMeBot not configured - skipping');
    return false;
  }

  const message = encodeURIComponent(`
🔔 *New Lead - DTH Store*

👤 ${lead.name}
📱 ${lead.mobile}
🏠 ${lead.location}
📺 ${lead.serviceType} - ${lead.operator}
🌐 ${lead.source}
⏰ ${new Date().toLocaleString('en-IN')}
`);

  try {
    const response = await fetch(
      `https://api.callmebot.com/whatsapp.php?phone=${WHATSAPP_CONFIG.phoneNumber}&text=${message}&apikey=${WHATSAPP_CONFIG.apiKey}`,
      { method: 'GET' }
    );

    if (response.ok) {
      console.log('✅ [WhatsApp] Notification sent successfully');
      return true;
    }
    throw new Error('WhatsApp send failed');
  } catch (error) {
    console.error('❌ [WhatsApp] Failed to send:', error);
    return false;
  }
};

/**
 * ========================================
 * MAIN NOTIFICATION FUNCTION
 * Sends notifications to all configured channels
 * ========================================
 */
export const sendLeadNotification = async (lead: Lead): Promise<boolean> => {
  console.log(`[NotificationService] Processing notifications for lead: ${lead.id}`);

  const results = await Promise.allSettled([
    sendEmailNotification(lead),
    sendWeb3FormsNotification(lead),
    sendTelegramNotification(lead),
    sendWhatsAppNotification(lead)
  ]);

  // Log results
  const successful = results.filter(r => r.status === 'fulfilled' && r.value === true).length;
  console.log(`[NotificationService] Sent ${successful}/${results.length} notifications`);

  // Show browser notification
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('🔔 New Lead Received!', {
      body: `${lead.name} - ${lead.mobile}\n${lead.serviceType}`,
      icon: '/favicon.ico'
    });
  }

  // Always return true (lead is saved regardless of notification status)
  return true;
};

/**
 * ========================================
 * SETUP INSTRUCTIONS
 * ========================================
 * 
 * 📧 EMAIL (EmailJS - Free 200 emails/month):
 * 1. Sign up at https://www.emailjs.com
 * 2. Add email service (Gmail, Outlook, etc.)
 * 3. Create template with variables: {{lead_name}}, {{lead_mobile}}, etc.
 * 4. Copy Service ID, Template ID, and Public Key
 * 5. Update EMAILJS_CONFIG above
 * 
 * 📧 EMAIL (Web3Forms - Free, simpler alternative):
 * 1. Go to https://web3forms.com
 * 2. Enter your email and get access key
 * 3. Update WEB3FORMS_CONFIG.accessKey above
 * 
 * 📱 TELEGRAM (Free, unlimited):
 * 1. Message @BotFather on Telegram
 * 2. Send /newbot and follow instructions
 * 3. Copy the bot token
 * 4. Message your bot and then visit: 
 *    https://api.telegram.org/bot<TOKEN>/getUpdates
 * 5. Find your chat_id from the response
 * 6. Update TELEGRAM_CONFIG above
 * 
 * 💬 WHATSAPP (CallMeBot - Free):
 * 1. Go to https://www.callmebot.com/blog/free-api-whatsapp-messages/
 * 2. Follow activation steps (send message to their number)
 * 3. Get your API key
 * 4. Update WHATSAPP_CONFIG above
 * 
 * ========================================
 */
