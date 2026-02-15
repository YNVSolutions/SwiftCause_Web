import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();

export const emailService = {
  async sendVerificationEmail(
    email: string,
    templateId: string,
    templateData?: { verifyUrl?: string; year?: number }
  ): Promise<void> {
    try {
      const sendEmailFn = httpsCallable(functions, 'sendEmail');
      const result = await sendEmailFn({
        to: email,
        templateId,
        templateData: templateData || {},
      });
      
      if (!(result.data as any).success) {
        throw new Error('Failed to send verification email');
      }
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw error;
    }
  },

  async sendThankYouEmail(
    to: string,
    templateId: string,
    campaignName: string,
    transactionId: string,
    amount: string
  ): Promise<void> {
    try {
      const sendEmailFn = httpsCallable(functions, 'sendEmail');
      const result = await sendEmailFn({
        to,
        templateId,
        templateData: {
          campaignName,
          transactionId,
          amount,
        },
        emailType: 'thankYou',
      });
      
      if (!(result.data as any).success) {
        throw new Error('Failed to send thank you email');
      }
    } catch (error) {
      console.error('Error sending thank you email:', error);
      throw error;
    }
  },

  async sendCustomEmail(
    to: string,
    templateId: string,
    templateData: Record<string, any>,
    emailType?: string
  ): Promise<void> {
    try {
      const sendEmailFn = httpsCallable(functions, 'sendEmail');
      const result = await sendEmailFn({
        to,
        templateId,
        templateData,
        emailType: emailType || 'custom',
      });
      
      if (!(result.data as any).success) {
        throw new Error('Failed to send email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  },
};
