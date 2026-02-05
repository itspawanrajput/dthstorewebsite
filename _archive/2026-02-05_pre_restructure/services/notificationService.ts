import { Lead, NotificationConfig } from '../types';
import { getNotificationConfig } from './storageService';

/**
 * ========================================
 * NOTIFICATION SERVICE
 * Sends notifications based on admin-configured settings
 * ========================================
 */

/**
 * Send Email via Web3Forms
 */
const sendEmailNotification = async (lead: Lead, config: NotificationConfig): Promise<boolean> => {
  if (!config.emailEnabled || !config.web3formsKey) {
    console.log('[Email] Not enabled or not configured');
    return false;
  }

  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_key: config.web3formsKey,
        subject: `🔔 New Lead: ${lead.name} - ${lead.serviceType}`,
        from_name: 'DTH Store Website',
        to_email: config.adminEmail,
        name: lead.name,
        mobile: lead.mobile,
        service: lead.serviceType,
        operator: lead.operator,
        location: lead.location,
        source: lead.source,
        time: new Date().toLocaleString('en-IN')
      })
    });

    const data = await response.json();
    if (data.success) {
      console.log('✅ [Email] Notification sent successfully');
      return true;
    }
    throw new Error(data.message);
  } catch (error) {
    console.error('❌ [Email] Failed:', error);
    return false;
  }
};

/**
 * Send Telegram notification
 */
const sendTelegramNotification = async (lead: Lead, config: NotificationConfig): Promise<boolean> => {
  if (!config.telegramEnabled || !config.telegramBotToken || !config.telegramChatId) {
    console.log('[Telegram] Not enabled or not configured');
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
      `https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: config.telegramChatId,
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
 * Send WhatsApp notification via self-hosted whatsapp-web.js API
 */
const sendWhatsAppNotification = async (lead: Lead, config: NotificationConfig): Promise<boolean> => {
  if (!config.whatsappEnabled || !config.whatsappApiUrl || !config.whatsappAdminNumber) {
    console.log('[WhatsApp] Not enabled or not configured');
    return false;
  }

  const message = `🔔 *New Lead - DTH Store*

👤 *Name:* ${lead.name}
📱 *Mobile:* ${lead.mobile}
🏠 *Location:* ${lead.location}
📺 *Service:* ${lead.serviceType} - ${lead.operator}
🌐 *Source:* ${lead.source}
⏰ *Time:* ${new Date().toLocaleString('en-IN')}

📞 Call: tel:+91${lead.mobile}
💬 WhatsApp: https://wa.me/91${lead.mobile}`;

  // Format: number@c.us (e.g., 919311252564@c.us)
  const chatId = `${config.whatsappAdminNumber}@c.us`;

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    // Add API key if configured
    if (config.whatsappApiKey) {
      headers['x-api-key'] = config.whatsappApiKey;
    }

    const response = await fetch(
      `${config.whatsappApiUrl}/client/sendMessage/${config.whatsappSessionId}`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          chatId,
          message
        })
      }
    );

    const data = await response.json();
    if (response.ok) {
      console.log('✅ [WhatsApp] Notification sent successfully');
      return true;
    }
    throw new Error(data.message || 'WhatsApp send failed');
  } catch (error) {
    console.error('❌ [WhatsApp] Failed to send:', error);
    return false;
  }
};

/**
 * Send Browser notification
 */
const sendBrowserNotification = (lead: Lead, config: NotificationConfig): void => {
  if (!config.browserNotificationsEnabled) {
    return;
  }

  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('🔔 New Lead Received!', {
      body: `${lead.name} - ${lead.mobile}\n${lead.serviceType} | ${lead.location}`,
      icon: '/favicon.ico',
      tag: 'new-lead'
    });
  }
};

/**
 * ========================================
 * MAIN NOTIFICATION FUNCTION
 * Sends notifications to all configured channels
 * ========================================
 */
export const sendLeadNotification = async (lead: Lead): Promise<boolean> => {
  console.log(`[NotificationService] Processing notifications for lead: ${lead.name}`);

  // Get notification config from storage
  const config = getNotificationConfig();

  // Send to all configured channels
  const results = await Promise.allSettled([
    sendEmailNotification(lead, config),
    sendTelegramNotification(lead, config),
    sendWhatsAppNotification(lead, config)
  ]);

  // Send browser notification (sync)
  sendBrowserNotification(lead, config);

  // Log results
  const successful = results.filter(r => r.status === 'fulfilled' && r.value === true).length;
  const total = results.length;

  console.log(`[NotificationService] Sent ${successful}/${total} notifications`);

  // Return true if at least one notification was sent, or if none were configured
  return successful > 0 || total === 0;
};
