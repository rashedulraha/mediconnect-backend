export const emailVerificationT = (otp: string) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Email Verification</title>
      </head>

      <body
        style="
          margin: 0;
          padding: 0;
          font-family: Arial, Helvetica, sans-serif;
          background-color: #f3f4f6;
        "
      >
        <div
          style="
            width: 100%;
            padding: 40px 0;
          "
        >
          <div
            style="
              max-width: 520px;
              margin: 0 auto;
              background-color: #ffffff;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            "
          >

            <!-- Header -->
            <div
              style="
                background-color: #2563eb;
                padding: 28px 20px;
                text-align: center;
              "
            >
              <h1
                style="
                  margin: 0;
                  color: #ffffff;
                  font-size: 26px;
                "
              >
                Email Verification
              </h1>
            </div>

            <!-- Content -->
            <div
              style="
                padding: 35px 30px;
                text-align: center;
              "
            >
              <h2
                style="
                  margin-top: 0;
                  color: #111827;
                  font-size: 22px;
                "
              >
                Verify Your Email Address
              </h2>

              <p
                style="
                  color: #6b7280;
                  font-size: 15px;
                  line-height: 1.6;
                  margin-bottom: 25px;
                "
              >
                Thank you for creating an account with us.
                Please use the verification code below to verify your email address.
              </p>

              <!-- OTP Box -->
              <div
                style="
                  display: inline-block;
                  background-color: #eff6ff;
                  border: 2px dashed #2563eb;
                  border-radius: 10px;
                  padding: 18px 35px;
                  margin: 10px 0 25px;
                "
              >
                <span
                  style="
                    display: block;
                    color: #6b7280;
                    font-size: 12px;
                    margin-bottom: 8px;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                  "
                >
                  Verification Code
                </span>

                <strong
                  style="
                    font-size: 32px;
                    letter-spacing: 8px;
                    color: #2563eb;
                  "
                >
                  ${otp}
                </strong>
              </div>

              <p
                style="
                  color: #6b7280;
                  font-size: 14px;
                  line-height: 1.6;
                "
              >
                This verification code is valid for a limited time.
                Please do not share this code with anyone.
              </p>

              <p
                style="
                  color: #9ca3af;
                  font-size: 13px;
                  margin-top: 25px;
                "
              >
                If you did not create an account with us, you can safely ignore this email.
              </p>
            </div>

            <!-- Footer -->
            <div
              style="
                background-color: #f9fafb;
                padding: 20px;
                text-align: center;
                border-top: 1px solid #e5e7eb;
              "
            >
              <p
                style="
                  margin: 0;
                  color: #9ca3af;
                  font-size: 12px;
                "
              >
                © 2026 Your Application. All rights reserved.
              </p>
            </div>

          </div>
        </div>
      </body>
    </html>
  `;
};
