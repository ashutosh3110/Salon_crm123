import nodemailer from 'nodemailer';
import { config } from '../../config/index.js';
import logger from '../../utils/logger.js';

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: config.email.host,
            port: config.email.port,
            secure: config.email.port === 465, // true for 465, false for other ports
            auth: {
                user: config.email.user,
                pass: config.email.pass,
            },
        });

        // Verify connection configuration
        this.transporter.verify((error) => {
            if (error) {
                logger.error('[EmailService] Connection failed:', error.message);
            } else {
                logger.info('[EmailService] SMTP Server is ready');
            }
        });
    }

    /**
     * Send Welcome Email to New Salon Owner
     * @param {string} to - Owner email
     * @param {string} ownerName - Owner name
     * @param {string} salonName - Salon name
     * @param {string} password - Default password
     */
    async sendWelcomeEmail(to, ownerName, salonName, password) {
        const subject = `Welcome to Wapixo! Your Salon "${salonName}" is Ready`;
        const html = `
            <div style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
                <div style="background-color: #8B1A2D; color: #fff; padding: 20px; text-align: center;">
                    <h1 style="margin: 0;">Welcome to Wapixo</h1>
                </div>
                <div style="padding: 20px;">
                    <p>Dear <strong>${ownerName}</strong>,</p>
                    <p>Congratulations! Your salon <strong>${salonName}</strong> has been successfully registered on Wapixo CRM.</p>
                    <p>You can now log in to your dashboard using the credentials below:</p>
                    
                    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; border-left: 4px solid #8B1A2D; margin: 20px 0;">
                        <p style="margin: 5px 0;"><strong>Username:</strong> ${to}</p>
                        <p style="margin: 5px 0;"><strong>Password:</strong> ${password}</p>
                    </div>

                    <p>For security reasons, we recommend that you change your password after your first login.</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="https://wapixo-crm.com/login" style="background-color: #8B1A2D; color: #fff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Login to Dashboard</a>
                    </div>

                    <p>If you have any questions, feel free to reply to this email.</p>
                    <p>Best Regards,<br/>Team Wapixo</p>
                </div>
                <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 12px; color: #777;">
                    &copy; 2026 Wapixo CRM. All rights reserved.
                </div>
            </div>
        `;

        try {
            await this.transporter.sendMail({
                from: `"${config.email.fromName}" <${config.email.fromEmail}>`,
                to,
                subject,
                html,
            });
            logger.info(`[EmailService] Welcome email sent to ${to}`);
        } catch (error) {
            logger.error(`[EmailService] Failed to send email to ${to}:`, error.message);
            // Don't throw error to avoid breaking the tenant creation flow, just log it
        }
    }
}

export default new EmailService();
