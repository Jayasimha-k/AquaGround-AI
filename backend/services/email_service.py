import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Optional
from config.settings import settings

logger = logging.getLogger("aquaground.email")

def send_smtp_email(to_email: str, subject: str, body_html: str, body_text: Optional[str] = None) -> bool:
    """
    Sends a real email to `to_email` using configured Gmail / SMTP credentials.
    Strips spaces from App Passwords and handles Windows console encodings safely.
    """
    clean_user = settings.smtp_user.strip() if settings.smtp_user else ""
    clean_password = settings.smtp_password.replace(" ", "").strip() if settings.smtp_password else ""

    if clean_user and clean_password:
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = settings.smtp_from_email or clean_user
            msg["To"] = to_email

            text_part = MIMEText(body_text or body_html, "plain")
            html_part = MIMEText(body_html, "html")

            msg.attach(text_part)
            msg.attach(html_part)

            with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=12) as server:
                server.starttls()
                server.login(clean_user, clean_password)
                server.sendmail(settings.smtp_from_email or clean_user, [to_email], msg.as_string())
            
            logger.info(f"Successfully sent real SMTP email to {to_email}")
            print(f"[SUCCESS] REAL SMTP EMAIL DELIVERED TO: {to_email}")
            return True
        except Exception as e:
            logger.error(f"Failed to send SMTP email to {to_email}: {str(e)}")
            print(f"[SMTP ERROR] Sending to {to_email}: {str(e)}")
            return False

    print(f"[DEV MOCK DISPATCH] Recipient: {to_email} | Subject: {subject}")
    return True

def send_otp_email(to_email: str, name: str, otp_code: str, purpose: str = "verification") -> bool:
    purpose_title = {
        "verification": "Account Email Verification",
        "login": "Secure Login Verification",
        "reset": "Password Reset Verification"
    }.get(purpose, "Verification Code")

    subject = f"AquaGround AI — {purpose_title} [OTP: {otp_code}]"

    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 12px; padding: 24px; background: #FFFFFF;">
        <div style="text-align: center; padding-bottom: 16px; border-bottom: 2px solid #2563EB;">
            <h2 style="color: #0F172A; margin: 0;">AquaGround AI Platform</h2>
            <p style="color: #64748B; font-size: 13px; margin: 4px 0 0 0;">Central Ground Water Board • Ministry of Jal Shakti</p>
        </div>
        <div style="padding: 24px 0;">
            <p style="color: #334155; font-size: 15px;">Respected <strong>{name}</strong>,</p>
            <p style="color: #475569; font-size: 14px; line-height: 1.5;">
                Your One-Time Password (OTP) for <strong>{purpose_title.lower()}</strong> is:
            </p>
            <div style="text-align: center; margin: 24px 0;">
                <span style="font-size: 34px; font-weight: 900; letter-spacing: 8px; color: #2563EB; background: #EFF6FF; border: 2px dashed #BFDBFE; padding: 14px 28px; border-radius: 12px; display: inline-block;">
                    {otp_code}
                </span>
            </div>
            <p style="color: #64748B; font-size: 12px; text-align: center;">
                This OTP is valid for 15 minutes. Please do not share this OTP with anyone.
            </p>
        </div>
        <div style="border-top: 1px solid #F1F5F9; padding-top: 16px; font-size: 11px; color: #94A3B8; text-align: center;">
            Central Ground Water Board (CGWB) • Government of India
        </div>
    </div>
    """

    text_content = f"Respected {name},\n\nYour AquaGround AI OTP for {purpose_title} is: {otp_code}\nThis OTP is valid for 15 minutes."
    return send_smtp_email(to_email, subject, html_content, text_content)

def send_multi_officer_dispatch_email(
    officer_emails: List[str],
    sender_name: str,
    title: str,
    message: str,
    district: str
) -> None:
    subject = f"CGWB DISPATCH ALERT: {title} ({district})"

    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; border: 1px solid #CBD5E1; border-radius: 12px; padding: 24px; background: #FFFFFF;">
        <div style="background: #1E293B; color: #FFFFFF; padding: 16px 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="margin: 0; font-size: 18px;">Central Ground Water Board — Dispatch Alert</h3>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #94A3B8;">Multi-Officer Notification System</p>
        </div>
        <div style="padding: 10px 0;">
            <div style="background: #FEF2F2; border-left: 4px solid #EF4444; padding: 14px; border-radius: 6px; margin-bottom: 16px;">
                <p style="margin: 0; font-weight: 700; color: #991B1B; font-size: 15px;">Directive / Report Dispatched</p>
                <p style="margin: 4px 0 0 0; color: #7F1D1D; font-size: 13px;">District Scope: <strong>{district}</strong></p>
            </div>
            <p style="color: #334155; font-size: 14px; line-height: 1.6;">
                <strong>Dispatched By:</strong> {sender_name}<br/>
                <strong>Action Directive:</strong> {title}<br/>
            </p>
            <div style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 14px; border-radius: 8px; font-size: 13px; color: #1E293B; margin-top: 12px;">
                {message}
            </div>
        </div>
        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #E2E8F0; font-size: 12px; color: #64748B;">
            Log into the AquaGround AI Command Center to view active alerts and telemetry diagnostics.
        </div>
    </div>
    """

    text_content = f"CGWB DISPATCH ALERT\nDispatched By: {sender_name}\nDistrict: {district}\nDirective: {title}\nMessage: {message}"

    for email in set(officer_emails):
        if email:
            send_smtp_email(email, subject, html_content, text_content)
