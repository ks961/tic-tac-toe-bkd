import * as nodemailer from "nodemailer";
import type Mail from "nodemailer/lib/mailer";


class MailService {
    #transporter;
    constructor(service: string) {
        this.#transporter = nodemailer.createTransport({
            service: service,
            auth: {
                user: process.env.MAIL_ID,
                pass: process.env.MAIL_PASS
            }
        });
    }

    async sendMail(toMail: string, subject: string, body: string): Promise<boolean> {
        const mailOptions: Mail.Options = {
            from: `Tic Tac Toe App <${process.env.MAIL_ID}>`,
            to: toMail,
            subject,
            html: body,
        };

        try {
            await this.#transporter.sendMail(mailOptions);
            return true;
        } catch(err) {
            console.log(err);
            
            return false;
        }
    }

};

const mailService = new MailService("gmail");

export default mailService;

