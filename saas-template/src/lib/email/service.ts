import { resend } from "./client";
import { createClient } from "@/lib/supabase/server";
import WelcomeEmail from "@/emails/welcome";
import ResetPasswordEmail from "@/emails/reset-password";
import TeamInvitationEmail from "@/emails/team-invitation";
import InvoiceEmail from "@/emails/invoice";
import VerificationEmail from "@/emails/verification";

import { z } from "zod";

// Email types
export const EmailType = {
  WELCOME: "welcome",
  RESET_PASSWORD: "reset_password",
  TEAM_INVITATION: "team_invitation",
  INVOICE: "invoice",
  SUBSCRIPTION_CREATED: "subscription_created",
  SUBSCRIPTION_UPDATED: "subscription_updated",
  SUBSCRIPTION_CANCELLED: "subscription_cancelled",
  PAYMENT_FAILED: "payment_failed",
  EMAIL_VERIFICATION: "email_verification",
} as const;

export type EmailType = (typeof EmailType)[keyof typeof EmailType];

// Email queue schema
const emailQueueSchema = z.object({
  id: z.string().optional(),
  to: z.union([z.string().email(), z.array(z.string().email())]),
  type: z.nativeEnum(EmailType),
  data: z.record(z.any()),
  status: z.enum(["pending", "sent", "failed"]).default("pending"),
  attempts: z.number().default(0),
  error: z.string().optional(),
  sent_at: z.string().optional(),
  created_at: z.string().optional(),
});

export type EmailQueueItem = z.infer<typeof emailQueueSchema>;

export class EmailService {
  // Queue an email for sending
  static async queue(email: Omit<EmailQueueItem, "id" | "created_at">) {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("email_queue")
      .insert({
        ...email,
        to: Array.isArray(email.to) ? email.to : [email.to],
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to queue email: ${error.message}`);
    }

    // Try to send immediately
    await this.processQueueItem(data);

    return data;
  }

  static async sendVerificationEmail({
    to,
    verificationLink,
    userName,
  }: {
    to: string;
    verificationLink: string;
    userName?: string;
  }) {
    return this.queue({
      to,
      type: EmailType.EMAIL_VERIFICATION,
      data: {
        verificationLink,
        userName,
      },
      status: "pending",
      attempts: 0,
    });
  }

  // Process a single queue item
  static async processQueueItem(item: EmailQueueItem) {
    const supabase = createClient();

    try {
      // Get email template based on type
      const { subject, react, text } = await this.getEmailTemplate(
        item.type,
        item.data
      );

      // Send email
      const result = await resend.emails.send({
        from: process.env.FROM_EMAIL!,
        to: item.to,
        subject,
        react,
        text,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      // Update queue item as sent
      await supabase
        .from("email_queue")
        .update({
          status: "sent",
          sent_at: new Date().toISOString(),
        })
        .eq("id", item.id);

      return { success: true };
    } catch (error: any) {
      // Update queue item with error
      await supabase
        .from("email_queue")
        .update({
          status: "failed",
          attempts: item.attempts + 1,
          error: error.message,
        })
        .eq("id", item.id);

      throw error;
    }
  }

  // Process all pending emails in queue
  static async processQueue() {
    const supabase = createClient();

    // Get pending emails (max 3 attempts)
    const { data: items } = await supabase
      .from("email_queue")
      .select("*")
      .eq("status", "pending")
      .lt("attempts", 3)
      .order("created_at", { ascending: true })
      .limit(10);

    if (!items) return;

    // Process each item
    const results = await Promise.allSettled(
      items.map((item) => this.processQueueItem(item))
    );

    return results;
  }

  // Get email template based on type
  static async getEmailTemplate(type: EmailType, data: any) {
    switch (type) {
      case EmailType.WELCOME:
        return {
          subject: "Welcome to Our Platform!",
          react: WelcomeEmail({
            userFirstName: data.name || "there",
            loginLink: `${process.env.NEXT_PUBLIC_APP_URL}/login`,
          }),
          text: `Welcome ${
            data.name || ""
          }! We're excited to have you on board.`,
        };

      case EmailType.RESET_PASSWORD:
        return {
          subject: "Reset Your Password",
          react: ResetPasswordEmail({
            resetLink: data.resetLink,
            userName: data.name,
          }),
          text: `Click here to reset your password: ${data.resetLink}`,
        };

      case EmailType.TEAM_INVITATION:
        return {
          subject: `You're invited to join ${data.teamName}`,
          react: TeamInvitationEmail({
            inviteLink: data.inviteLink,
            inviterName: data.inviterName,
            teamName: data.teamName,
            recipientEmail: data.recipientEmail,
          }),
          text: `${data.inviterName} has invited you to join ${data.teamName}. Click here to accept: ${data.inviteLink}`,
        };

      case EmailType.INVOICE:
        return {
          subject: `Invoice #${data.invoiceNumber}`,
          react: InvoiceEmail({
            invoiceNumber: data.invoiceNumber,
            customerName: data.customerName,
            amount: data.amount,
            dueDate: data.dueDate,
            items: data.items,
            downloadLink: data.downloadLink,
          }),
          text: `Your invoice #${data.invoiceNumber} for ${data.amount} is ready.`,
        };

      case EmailType.SUBSCRIPTION_CREATED:
        return {
          subject: "Subscription Activated",
          react: (
            <div>
              <h1>Welcome to Pro!</h1>
              <p>Your subscription has been activated successfully.</p>
              <p>You now have access to all Pro features.</p>
            </div>
          ),
          text: "Your Pro subscription has been activated.",
        };

      case EmailType.SUBSCRIPTION_UPDATED:
        return {
          subject: "Subscription Updated",
          react: (
            <div>
              <h1>Subscription Updated</h1>
              <p>Your subscription has been updated successfully.</p>
            </div>
          ),
          text: "Your subscription has been updated.",
        };

      case EmailType.SUBSCRIPTION_CANCELLED:
        return {
          subject: "Subscription Cancelled",
          react: (
            <div>
              <h1>Subscription Cancelled</h1>
              <p>
                Your subscription has been cancelled and will end on{" "}
                {data.endDate}.
              </p>
              <p>You'll continue to have access until then.</p>
            </div>
          ),
          text: `Your subscription has been cancelled and will end on ${data.endDate}.`,
        };

      case EmailType.PAYMENT_FAILED:
        return {
          subject: "Payment Failed",
          react: (
            <div>
              <h1>Payment Failed</h1>
              <p>
                We couldn't process your payment. Please update your payment
                method.
              </p>
              <a href={`${process.env.NEXT_PUBLIC_APP_URL}/billing`}>
                Update Payment Method
              </a>
            </div>
          ),
          text: "Your payment failed. Please update your payment method.",
        };

      case EmailType.EMAIL_VERIFICATION:
        return {
          subject: "Verify your email address",
          react: VerificationEmail({
            verificationLink: data.verificationLink,
            userName: data.userName,
          }),
          text: `Please verify your email by clicking this link: ${data.verificationLink}`,
        };
      default:
        throw new Error(`Unknown email type: ${type}`);
    }
  }

  // Send email immediately (bypasses queue)
  static async send({
    to,
    subject,
    react,
    text,
  }: {
    to: string | string[];
    subject: string;
    react?: React.ReactElement;
    text?: string;
  }) {
    const result = await resend.emails.send({
      from: process.env.FROM_EMAIL!,
      to,
      subject,
      react,
      text,
    });

    if (result.error) {
      throw new Error(result.error.message);
    }

    return result;
  }

  // Helper methods for common emails
  static async sendWelcomeEmail(user: { email: string; name?: string }) {
    return this.queue({
      to: user.email,
      type: EmailType.WELCOME,
      data: { name: user.name },
      status: "pending",
      attempts: 0,
    });
  }

  static async sendPasswordResetEmail(
    email: string,
    resetLink: string,
    name?: string
  ) {
    return this.queue({
      to: email,
      type: EmailType.RESET_PASSWORD,
      data: { resetLink, name },
      status: "pending",
      attempts: 0,
    });
  }

  static async sendTeamInvitationEmail({
    to,
    inviteLink,
    inviterName,
    teamName,
  }: {
    to: string;
    inviteLink: string;
    inviterName: string;
    teamName: string;
  }) {
    return this.queue({
      to,
      type: EmailType.TEAM_INVITATION,
      data: {
        inviteLink,
        inviterName,
        teamName,
        recipientEmail: to,
      },
      status: "pending",
      attempts: 0,
    });
  }

  static async sendInvoiceEmail({
    to,
    invoice,
  }: {
    to: string;
    invoice: {
      number: string;
      customerName: string;
      amount: string;
      dueDate: string;
      items: any[];
      downloadLink: string;
    };
  }) {
    return this.queue({
      to,
      type: EmailType.INVOICE,
      data: {
        invoiceNumber: invoice.number,
        customerName: invoice.customerName,
        amount: invoice.amount,
        dueDate: invoice.dueDate,
        items: invoice.items,
        downloadLink: invoice.downloadLink,
      },
      status: "pending",
      attempts: 0,
    });
  }
}
