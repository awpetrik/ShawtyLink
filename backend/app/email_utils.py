import os

def get_reset_password_template(reset_link: str, user_email: str, frontend_url: str) -> str:
    # Brand Colors
    brand_color = "#2563EB" # Blue-600
    bg_color = "#F9FAFB"
    container_bg = "#FFFFFF"
    text_color = "#1F2937"
    
    # Priority: Env Var > Frontend URL Path
    logo_url = os.getenv("LOGO_URL")
    if not logo_url:
        logo_url = f"{frontend_url}/logo.png"
    
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="color-scheme" content="light dark">
        <meta name="supported-color-schemes" content="light dark">
        <style>
            :root {{
                color-scheme: light dark;
                supported-color-schemes: light dark;
            }}
            body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: {bg_color}; margin: 0; padding: 0; }}
            .container {{ max-width: 500px; margin: 40px auto; background-color: {container_bg}; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden; }}
            .header {{ background-color: {brand_color}; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }}
            .logo {{ font-size: 24px; font-weight: 700; color: #FFFFFF; text-decoration: none; display: flex; align-items: center; justify-content: center; }}
            .logo-img {{ height: 32px; width: auto; display: block; }}
            .content {{ padding: 40px 30px; text-align: center; color: {text_color}; }}
            .title {{ font-size: 20px; font-weight: 600; color: {text_color}; margin-bottom: 16px; }}
            .text {{ font-size: 15px; color: #4B5563; line-height: 1.6; margin-bottom: 24px; }}
            .btn {{ display: inline-block; background-color: {brand_color}; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; margin: 10px 0 30px 0; transition: background-color 0.2s; }}
            .btn:hover {{ background-color: #1D4ED8; }}
            .footer {{ background-color: #F9FAFB; padding: 20px; text-align: center; font-size: 12px; color: #6B7280; border-top: 1px solid #E5E7EB; margin-top: 20px; border-radius: 0 0 12px 12px; }}
            .link-text {{ color: {brand_color}; word-break: break-all; font-size: 13px; }}

            /* Dark Mode Support */
            @media (prefers-color-scheme: dark) {{
                body {{ background-color: #111827 !important; }}
                .container {{ background-color: #1F2937 !important; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3) !important; }}
                .header {{ background-color: #1E40AF !important; }}  /* Darker Blue */
                .title {{ color: #F9FAFB !important; }}
                .text {{ color: #D1D5DB !important; }}
                .footer {{ background-color: #374151 !important; border-top: 1px solid #374151 !important; color: #9CA3AF !important; }}
                .link-text {{ color: #60A5FA !important; }} /* Lighter Blue */
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                 <!-- Logo Image (White Text friendly) -->
                 <img src="{logo_url}" alt="ShawtyLink" class="logo-img" style="margin: 0 auto;">
            </div>
            </div>
            <div class="content">
                <h1 class="title">Reset Your Password</h1>
                <p class="text">
                    Hello, we received a request to reset the password for your account associated with <strong>{user_email}</strong>.
                </p>
                
                <a href="{reset_link}" class="btn">Reset Password</a>
                
                <p class="text" style="font-size: 13px; margin-bottom: 0;">
                    Or copy and paste this link into your browser:
                    <br/>
                    <a href="{reset_link}" class="link-text">{reset_link}</a>
                </p>
            </div>
            <div class="footer">
                <p style="margin: 0 0 10px 0;">This link is valid for <strong>15 minutes</strong>.</p>
                <p style="margin: 0;">If you didn't request this, you can safely ignore this email.</p>
                <p style="margin: 10px 0 0 0;">© {os.getenv("YEAR", "2026")} Certified Lunatics.</p>
            </div>
        </div>
    </body>
    </html>
    """
