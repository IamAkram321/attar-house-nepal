import { Resend } from "resend";
import type { Order, OrderItem } from "@workspace/db";

const { RESEND_API_KEY, EMAIL_FROM, FRONTEND_URL } = process.env;

if (!RESEND_API_KEY) {
  console.warn("[email] RESEND_API_KEY not set. Order emails will be skipped.");
}

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

const FROM = EMAIL_FROM || "Ayesha Fragrances <concierge@ayeshafragrances.com>";

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending Allocation",
  confirmed: "Confirmed by Maison",
  processing: "In Vault Curation",
  shipped: "Dispatched via White Glove Courier",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

/** Formats values in Nepalese Rupees (NPR) */
function currency(amount: string | number): string {
  const val = Number(amount) || 0;
  return `Rs. ${val.toLocaleString("ne-NP", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function orderItemsHtml(items: OrderItem[]): string {
  return items
    .map(
      (item) => `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #EAE6DF; color: #2C2A29; font-size: 14px;">
            <strong style="color: #1A1714;">${item.productName}</strong>
            ${item.material ? `<br/><span style="font-size: 12px; color: #8C6D37;">Concentration / Notes: ${item.material}</span>` : ""}
          </td>
          <td style="padding: 12px 0; border-bottom: 1px solid #EAE6DF; color: #787571; font-size: 14px; text-align: center;">
            x${item.quantity}
          </td>
          <td style="padding: 12px 0; border-bottom: 1px solid #EAE6DF; color: #1A1714; font-size: 14px; text-align: right; font-weight: 600;">
            ${currency(Number(item.price) * item.quantity)}
          </td>
        </tr>`
    )
    .join("");
}

export function emailShell(title: string, bodyHtml: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #FAF8F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #FAF8F5; padding: 40px 16px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" style="max-width: 520px; background: #FFFFFF; border-radius: 12px; border: 1px solid #E2DDD5; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.04);">
                
                <!-- Header Logo Bar -->
                <tr>
                  <td style="background: #121212; padding: 26px; text-align: center;">
                    <span style="color: #C5A265; font-family: Georgia, serif; font-size: 20px; letter-spacing: 0.18em; font-weight: 500; text-transform: uppercase;">
                      AYESHA FRAGRANCES
                    </span>
                    <br/>
                    <span style="color: #A3907C; font-size: 9px; letter-spacing: 0.25em; text-transform: uppercase;">
                      HAUTE PARFUMERIE
                    </span>
                  </td>
                </tr>

                <!-- Content Area -->
                <tr>
                  <td style="padding: 32px 28px;">
                    <h1 style="font-family: Georgia, serif; font-size: 22px; font-weight: 500; color: #121212; margin: 0 0 20px; line-height: 1.3;">
                      ${title}
                    </h1>
                    ${bodyHtml}
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background: #FAF8F5; padding: 22px 28px; border-top: 1px solid #EAE6DF; text-align: center;">
                    <p style="font-size: 11px; color: #8C8A84; margin: 0; line-height: 1.6;">
                      <strong>Ayesha Fragrances</strong> &middot; Haute Parfumerie &middot; Private Concierge<br/>
                      Mayfair, London &middot; Grasse, France &middot; Kathmandu<br/>
                      <a href="mailto:concierge@ayeshafragrances.com" style="color: #8C6D37; text-decoration: none;">concierge@ayeshafragrances.com</a>
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

/** Sends an order confirmation email right after checkout. */
export async function sendOrderConfirmationEmail(order: Order, items: OrderItem[]): Promise<void> {
  if (!resend) return;

  try {
    const trackingUrl = `${FRONTEND_URL || ""}/orders/${order.id}`;

    await resend.emails.send({
      from: FROM,
      to: order.customerEmail,
      subject: `Order #${order.id} confirmed — Ayesha Fragrances`,
      html: emailShell(
        "Thank you for your commission",
        `
        <p style="color: #4A4845; font-size: 15px; line-height: 1.6; margin: 0 0 20px;">
          Dear <strong>${order.customerName}</strong>, we have received your flacon order <span style="color: #1A1714; font-weight: 600;">#${order.id}</span>. Our vault team is preparing your creations for climate-controlled dispatch.
        </p>

        <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 24px 0 16px;">
          <thead>
            <tr style="border-bottom: 2px solid #1A1714;">
              <th style="text-align: left; padding-bottom: 8px; font-size: 12px; font-weight: 700; color: #1A1714; text-transform: uppercase; letter-spacing: 0.05em;">Flacon Selection</th>
              <th style="text-align: center; padding-bottom: 8px; font-size: 12px; font-weight: 700; color: #1A1714; text-transform: uppercase; letter-spacing: 0.05em;">Qty</th>
              <th style="text-align: right; padding-bottom: 8px; font-size: 12px; font-weight: 700; color: #1A1714; text-transform: uppercase; letter-spacing: 0.05em;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${orderItemsHtml(items)}
          </tbody>
        </table>

        <table role="presentation" style="width: 100%; margin-bottom: 24px;">
          <tr>
            <td style="font-size: 15px; font-weight: 700; color: #1A1714;">Total Investment</td>
            <td style="text-align: right; font-size: 18px; font-weight: 700; color: #8C6D37;">${currency(order.total)}</td>
          </tr>
        </table>

        <div style="background-color: #FAF8F5; border-left: 3px solid #8C6D37; padding: 12px 16px; margin-bottom: 28px; border-radius: 0 4px 4px 0;">
          <p style="margin: 0; color: #4A4845; font-size: 13px;">
            <strong>Maison Assurance:</strong> Every full-sized flacon includes a complimentary 2ml discovery vial. Test the vial first before breaking the presentation flacon wax seal.
          </p>
        </div>

        <div style="text-align: center; margin-top: 28px;">
          <a href="${trackingUrl}" style="display: inline-block; padding: 14px 28px; background-color: #121212; color: #FAF8F5; text-decoration: none; font-size: 12px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; border-radius: 24px;">
            Track Your Consignment
          </a>
        </div>
        `
      ),
    });
  } catch (err) {
    console.error("[email] Failed to send order confirmation", err);
  }
}

/** Sends an email whenever an admin changes an order's status. */
export async function sendOrderStatusUpdateEmail(order: Order): Promise<void> {
  if (!resend) return;

  try {
    const trackingUrl = `${FRONTEND_URL || ""}/orders/${order.id}`;
    const label = STATUS_LABEL[order.status] ?? order.status;

    await resend.emails.send({
      from: FROM,
      to: order.customerEmail,
      subject: `Order #${order.id} update: ${label} — Ayesha Fragrances`,
      html: emailShell(
        `Order Update: ${label}`,
        `
        <p style="color: #4A4845; font-size: 15px; line-height: 1.6; margin: 0 0 20px;">
          Dear <strong>${order.customerName}</strong>, your flacon order <span style="color: #1A1714; font-weight: 600;">#${order.id}</span> has progressed to the next stage of fulfillment.
        </p>

        <div style="background-color: #FAF8F5; border: 1px solid #EAE6DF; padding: 16px; border-radius: 8px; text-align: center; margin: 24px 0;">
          <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; color: #8C6D37; display: block; margin-bottom: 4px;">Current Status</span>
          <strong style="font-size: 18px; color: #121212; font-family: Georgia, serif;">${label}</strong>
        </div>

        <div style="text-align: center; margin-top: 28px;">
          <a href="${trackingUrl}" style="display: inline-block; padding: 14px 28px; background-color: #121212; color: #FAF8F5; text-decoration: none; font-size: 12px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; border-radius: 24px;">
            View Consignment Details
          </a>
        </div>
        `
      ),
    });
  } catch (err) {
    console.error("[email] Failed to send status update", err);
  }
}

/** Sends the email verification link. */
export async function sendVerificationEmail(email: string, name: string, rawToken: string): Promise<void> {
  if (!resend) return;

  try {
    const verifyUrl = `${FRONTEND_URL || ""}/verify-email?token=${rawToken}`;

    await resend.emails.send({
      from: FROM,
      to: email,
      subject: "Verify your email — Ayesha Fragrances",
      html: emailShell(
        "Confirm your email address",
        `
        <p style="color: #4A4845; font-size: 15px; line-height: 1.6;">
          Dear <strong>${name}</strong>, thank you for joining the Ayesha Fragrances circle. Please verify your email to access your private olfactive profile and order archives.
        </p>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${verifyUrl}" style="display: inline-block; padding: 14px 28px; background-color: #121212; color: #FAF8F5; text-decoration: none; font-size: 12px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; border-radius: 24px;">
            Verify Email
          </a>
        </div>

        <p style="color: #8C8A84; font-size: 13px; line-height: 1.5; margin-top: 24px; border-top: 1px solid #EAE6DF; padding-top: 16px;">
          This link expires in 24 hours. If you did not request this registration, please disregard this communication.
        </p>
        `
      ),
    });
  } catch (err) {
    console.error("[email] Failed to send verification email", err);
  }
}

/** Sends a password reset link. */
export async function sendPasswordResetEmail(email: string, name: string, rawToken: string): Promise<void> {
  if (!resend) return;

  try {
    const resetUrl = `${FRONTEND_URL || ""}/reset-password?token=${rawToken}`;

    await resend.emails.send({
      from: FROM,
      to: email,
      subject: "Reset your password — Ayesha Fragrances",
      html: emailShell(
        "Reset your password",
        `
        <p style="color: #4A4845; font-size: 15px; line-height: 1.6;">
          Dear <strong>${name}</strong>, we received a request to reset your password. Click below to proceed securely.
        </p>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetUrl}" style="display: inline-block; padding: 14px 28px; background-color: #121212; color: #FAF8F5; text-decoration: none; font-size: 12px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; border-radius: 24px;">
            Reset Password
          </a>
        </div>

        <p style="color: #8C8A84; font-size: 13px; line-height: 1.5; margin-top: 24px; border-top: 1px solid #EAE6DF; padding-top: 16px;">
          This link expires in 1 hour. If you did not request this change, your credentials remain secure.
        </p>
        `
      ),
    });
  } catch (err) {
    console.error("[email] Failed to send password reset email", err);
  }
}

/** Confirms a password change. */
export async function sendPasswordChangedEmail(email: string, name: string): Promise<void> {
  if (!resend) return;

  try {
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: "Your password was changed — Ayesha Fragrances",
      html: emailShell(
        "Password changed",
        `
        <p style="color: #4A4845; font-size: 15px; line-height: 1.6;">
          Dear <strong>${name}</strong>, your account password was successfully updated.
        </p>
        <p style="color: #8C8A84; font-size: 13px; margin-top: 16px;">
          If you did not make this change, please contact our concierge immediately at concierge@ayeshafragrances.com.
        </p>
        `
      ),
    });
  } catch (err) {
    console.error("[email] Failed to send password-changed notice", err);
  }
}

/** Sent when a user registers with an existing account email. */
export async function sendAccountAlreadyExistsEmail(email: string, name: string): Promise<void> {
  if (!resend) return;

  try {
    const loginUrl = `${FRONTEND_URL || ""}/login`;
    const forgotUrl = `${FRONTEND_URL || ""}/forgot-password`;

    await resend.emails.send({
      from: FROM,
      to: email,
      subject: "Sign-up attempt on your account — Ayesha Fragrances",
      html: emailShell(
        "Account notice",
        `
        <p style="color: #4A4845; font-size: 15px; line-height: 1.6;">
          Dear <strong>${name}</strong>, someone attempted to create an account with this email address, which is already registered with us.
        </p>
        <p style="color: #4A4845; font-size: 15px; line-height: 1.6;">
          You can <a href="${loginUrl}" style="color: #8C6D37; font-weight: 600;">sign in here</a> or <a href="${forgotUrl}" style="color: #8C6D37; font-weight: 600;">reset your password</a> if you have forgotten it.
        </p>
        <p style="color: #8C8A84; font-size: 13px; margin-top: 20px;">
          If this was not you, your account remains secure and no action is required.
        </p>
        `
      ),
    });
  } catch (err) {
    console.error("[email] Failed to send account-exists notice", err);
  }
}