import { Lead } from '../types';

// Configuration for email service
// In a production app, these would come from environment variables
const ADMIN_EMAIL = 'admin@dthstore.shop';

/**
 * Sends an email notification to the admin when a new lead is captured.
 * currently simulates the email sending process.
 */
export const sendLeadNotification = async (lead: Lead): Promise<boolean> => {
  console.log(`[NotificationService] Processing email for lead: ${lead.id}`);

  // In a real application, you would integrate with a service like EmailJS, SendGrid, or AWS SES.
  // Below is an example structure for how that integration would look.

  /* 
  // Example: Using EmailJS
  // import emailjs from '@emailjs/browser';
  
  const templateParams = {
    to_email: ADMIN_EMAIL,
    from_name: "DTH Store Website",
    lead_name: lead.name,
    lead_mobile: lead.mobile,
    lead_service: lead.serviceType,
    lead_location: lead.location,
    lead_operator: lead.operator
  };

  return emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams, 'YOUR_PUBLIC_KEY')
    .then((response) => {
       console.log('SUCCESS!', response.status, response.text);
       return true;
    }, (err) => {
       console.log('FAILED...', err);
       return false;
    });
  */

  // Mock Implementation for Demo purposes
  return new Promise((resolve) => {
    setTimeout(() => {
      console.group('%c 📧 Email Notification Sent', 'color: green; font-size: 14px; font-weight: bold;');
      console.log(`To: ${ADMIN_EMAIL}`);
      console.log(`Subject: New Lead Alert - ${lead.name}`);
      console.log('Body:', `
        New Lead Received!
        ------------------
        Name: ${lead.name}
        Mobile: ${lead.mobile}
        Service: ${lead.serviceType}
        Operator: ${lead.operator}
        Location: ${lead.location}
        Source: ${lead.source}
      `);
      console.groupEnd();
      resolve(true);
    }, 1000);
  });
};
