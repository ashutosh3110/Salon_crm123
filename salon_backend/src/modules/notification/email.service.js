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

    /**
     * Send Login Credentials to New Staff Member
     * @param {string} to - Staff email
     * @param {string} name - Staff name
     * @param {string} role - Staff role
     * @param {string} salonName - Salon name
     * @param {string} password - Plain text password
     */
    async sendStaffCredentialsEmail(to, name, role, salonName, password) {
        const subject = `Login Credentials for ${salonName}`;
        const html = `
            <div style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
                <div style="background-color: #0A0A0A; color: #fff; padding: 25px; text-align: center; border-bottom: 3px solid #8B1A2D;">
                    <h1 style="margin: 0; text-transform: uppercase; letter-spacing: 2px;">Wapixo Salon CMS</h1>
                    <p style="margin: 5px 0 0; font-size: 14px; opacity: 0.8;">Premium Staff Onboarding</p>
                </div>
                <div style="padding: 30px; background-color: #fff;">
                    <p style="font-size: 16px;">Hello <strong>${name}</strong>,</p>
                    <p>You have been added as a <strong>${role.replace('_', ' ')}</strong> at <strong>${salonName}</strong>.</p>
                    <p>Welcome to the team! You can now access the Salon Management System using the following credentials:</p>
                    
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 12px; border: 1px solid #e9ecef; margin: 25px 0;">
                        <table style="width: 100%;">
                            <tr>
                                <td style="color: #6c757d; font-size: 12px; text-transform: uppercase; font-weight: bold; width: 100px;">Username</td>
                                <td style="font-weight: bold; font-family: monospace; color: #333;">${to}</td>
                            </tr>
                            <tr>
                                <td style="color: #6c757d; font-size: 12px; text-transform: uppercase; font-weight: bold; padding-top: 10px;">Password</td>
                                <td style="font-weight: bold; font-family: monospace; color: #8B1A2D; padding-top: 10px;">${password}</td>
                            </tr>
                        </table>
                    </div>

                    <p style="font-size: 14px; color: #666; font-style: italic;">Note: For security reasons, please do not share these credentials. You can change your password anytime from your profile settings.</p>
                    
                    <div style="text-align: center; margin: 35px 0;">
                        <a href="https://salon-crm123.vercel.app/login" style="background-color: #8B1A2D; color: #fff; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px rgba(139, 26, 45, 0.2);">Login to Dashboard</a>
                    </div>

                    <p style="border-top: 1px solid #eee; padding-top: 20px; font-size: 14px; color: #888;">Best Regards,<br/><strong>Team Wapixo</strong></p>
                </div>
                <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 11px; color: #999; border-top: 1px solid #eee;">
                    &copy; 2026 Wapixo Premium Salon Management. All rights reserved.
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
            logger.info(`[EmailService] Staff credentials email sent to ${to}`);
        } catch (error) {
            logger.error(`[EmailService] Failed to send staff email to ${to}:`, error.message);
        }
    }
}

export default new EmailService();
