"""
Email service via Resend (https://resend.com — free tier: 3000 emails/month).
Uses httpx — no extra package needed.

Sign up at https://resend.com, get an API key, add to .env:
  RESEND_API_KEY=re_xxxxxxxxxxxx
"""
from __future__ import annotations

import httpx
from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger("email")

RESEND_API_URL = "https://api.resend.com/emails"
FROM_EMAIL = "CoachAI <noreply@coachai.dev>"


async def _send(to: str, subject: str, html: str) -> None:
    """Fire-and-forget email send. Silently fails if not configured."""
    if not settings.resend_api_key:
        logger.debug("Email skipped (no RESEND_API_KEY): %s → %s", subject, to)
        return
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                RESEND_API_URL,
                headers={"Authorization": f"Bearer {settings.resend_api_key}"},
                json={"from": FROM_EMAIL, "to": [to], "subject": subject, "html": html},
            )
            logger.info("Email sent: %s → %s (status=%d)", subject, to, resp.status_code)
    except Exception as e:
        logger.warning("Email failed: %s → %s — %s", subject, to, str(e)[:200])


def _base_template(content: str) -> str:
    return f"""
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>CoachAI</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1d4ed8,#2563eb);padding:28px 32px;border-radius:16px 16px 0 0;text-align:center;">
              <span style="font-size:24px;font-weight:900;color:#fff;letter-spacing:-0.5px;">CoachAI</span>
              <p style="color:rgba(255,255,255,0.7);font-size:13px;margin:4px 0 0;">La plateforme data/IA gamifiée</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="background:#fff;padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 16px 16px;">
              {content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 0;text-align:center;">
              <p style="color:#94a3b8;font-size:12px;margin:0;">
                © 2026 CoachAI SAS · Paris, France<br/>
                <a href="https://coachai.dev/privacy" style="color:#94a3b8;">Confidentialité</a> ·
                <a href="https://coachai.dev/terms" style="color:#94a3b8;">CGU</a> ·
                <a href="mailto:contact@coachai.dev" style="color:#94a3b8;">Contact</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""


async def send_welcome_email(to: str, username: str) -> None:
    content = f"""
      <h1 style="font-size:22px;font-weight:900;color:#0f172a;margin:0 0 8px;">Bienvenue, {username} ! 🎉</h1>
      <p style="color:#64748b;font-size:15px;line-height:1.6;margin:0 0 24px;">
        Ton compte CoachAI est créé. Tu commences avec <strong style="color:#2563eb;">1000 ELO</strong> — prêt à grimper dans le classement ?
      </p>

      <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:12px;padding:20px;margin-bottom:24px;">
        <p style="font-weight:700;color:#0369a1;font-size:14px;margin:0 0 12px;">🚀 Pour bien démarrer :</p>
        <ol style="color:#0369a1;font-size:14px;margin:0;padding-left:20px;line-height:2;">
          <li>Résous ton premier challenge SQL (5 min)</li>
          <li>Explore les formations Python/ML</li>
          <li>Consulte le classement pour voir où tu te situes</li>
        </ol>
      </div>

      <table cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
        <tr>
          <td style="background:#2563eb;border-radius:10px;padding:14px 28px;">
            <a href="https://coachai.dev/challenges" style="color:#fff;font-weight:700;font-size:15px;text-decoration:none;">
              Commencer mon premier challenge →
            </a>
          </td>
        </tr>
      </table>

      <p style="color:#94a3b8;font-size:13px;text-align:center;margin:0;">
        Des questions ? Réponds à cet email ou écris-nous à
        <a href="mailto:contact@coachai.dev" style="color:#2563eb;">contact@coachai.dev</a>
      </p>
    """
    await _send(to, "Bienvenue sur CoachAI 🎉", _base_template(content))


async def send_pro_welcome_email(to: str, username: str) -> None:
    content = f"""
      <h1 style="font-size:22px;font-weight:900;color:#0f172a;margin:0 0 8px;">Tu es maintenant Pro, {username} ! ⚡</h1>
      <p style="color:#64748b;font-size:15px;line-height:1.6;margin:0 0 24px;">
        Ton abonnement CoachAI Pro est actif. Tu as accès à tous les challenges, toutes les formations et des soumissions illimitées.
      </p>

      <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:12px;padding:20px;margin-bottom:24px;">
        <p style="font-weight:700;color:#166534;font-size:14px;margin:0 0 12px;">✅ Ce qui est débloqué :</p>
        <ul style="color:#166534;font-size:14px;margin:0;padding-left:20px;line-height:2;">
          <li>100+ challenges (ML, Deep Learning, NLP, SQL…)</li>
          <li>5 parcours de formation complets</li>
          <li>Soumissions illimitées chaque jour</li>
          <li>Streak bonus ELO +20%</li>
          <li>Certifications vérifiables</li>
        </ul>
      </div>

      <table cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
        <tr>
          <td style="background:#2563eb;border-radius:10px;padding:14px 28px;">
            <a href="https://coachai.dev/challenges" style="color:#fff;font-weight:700;font-size:15px;text-decoration:none;">
              Explorer les challenges Pro →
            </a>
          </td>
        </tr>
      </table>

      <p style="color:#94a3b8;font-size:13px;text-align:center;margin:0;">
        Gère ton abonnement depuis ton
        <a href="https://coachai.dev/profile" style="color:#2563eb;">profil</a>.
        Merci pour ta confiance !
      </p>
    """
    await _send(to, "Bienvenue dans CoachAI Pro ⚡", _base_template(content))


async def send_password_reset_email(to: str, username: str, reset_token: str, frontend_url: str) -> None:
    reset_url = f"{frontend_url}/reset-password?token={reset_token}"
    content = f"""
      <h1 style="font-size:22px;font-weight:900;color:#0f172a;margin:0 0 8px;">Réinitialisation du mot de passe</h1>
      <p style="color:#64748b;font-size:15px;line-height:1.6;margin:0 0 24px;">
        Bonjour {username}, tu as demandé à réinitialiser ton mot de passe. Clique sur le bouton ci-dessous pour en choisir un nouveau.
      </p>

      <table cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
        <tr>
          <td style="background:#2563eb;border-radius:10px;padding:14px 28px;">
            <a href="{reset_url}" style="color:#fff;font-weight:700;font-size:15px;text-decoration:none;">
              Réinitialiser mon mot de passe →
            </a>
          </td>
        </tr>
      </table>

      <div style="background:#fefce8;border:1px solid #fde047;border-radius:12px;padding:16px;margin-bottom:24px;">
        <p style="font-weight:700;color:#854d0e;font-size:13px;margin:0 0 4px;">⚠️ Ce lien expire dans 1 heure.</p>
        <p style="color:#854d0e;font-size:12px;margin:0;">Si tu n'as pas fait cette demande, ignore cet email.</p>
      </div>

      <p style="color:#94a3b8;font-size:12px;text-align:center;margin:0;">
        Lien direct (si le bouton ne marche pas) :<br/>
        <a href="{reset_url}" style="color:#2563eb;word-break:break-all;font-size:11px;">{reset_url}</a>
      </p>
    """
    await _send(to, "Réinitialisation de ton mot de passe — CoachAI", _base_template(content))


async def send_subscription_cancelled_email(to: str, username: str) -> None:
    content = f"""
      <h1 style="font-size:22px;font-weight:900;color:#0f172a;margin:0 0 8px;">Abonnement résilié</h1>
      <p style="color:#64748b;font-size:15px;line-height:1.6;margin:0 0 24px;">
        Bonjour {username}, ton abonnement CoachAI Pro a été résilié. Tu continueras à bénéficier de l&apos;accès Pro jusqu&apos;à la fin de ta période de facturation.
      </p>

      <div style="background:#fefce8;border:1px solid #fde047;border-radius:12px;padding:20px;margin-bottom:24px;">
        <p style="font-weight:700;color:#854d0e;font-size:14px;margin:0 0 8px;">Tu peux te réabonner à tout moment.</p>
        <p style="color:#854d0e;font-size:13px;margin:0;">
          Ton historique, tes badges et ton ELO sont conservés.
        </p>
      </div>

      <table cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
        <tr>
          <td style="background:#2563eb;border-radius:10px;padding:14px 28px;">
            <a href="https://coachai.dev/pricing" style="color:#fff;font-weight:700;font-size:15px;text-decoration:none;">
              Voir les offres →
            </a>
          </td>
        </tr>
      </table>

      <p style="color:#94a3b8;font-size:13px;text-align:center;margin:0;">
        Une question ? <a href="mailto:contact@coachai.dev" style="color:#2563eb;">contact@coachai.dev</a>
      </p>
    """
    await _send(to, "Ton abonnement CoachAI Pro a été résilié", _base_template(content))
