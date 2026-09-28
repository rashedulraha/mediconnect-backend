export const welcomeEmailT = (name: string) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Welcome</title>
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
                Welcome to Our Application
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
                Welcome, ${name}! 🎉
              </h2>

              <p
                style="
                  color: #6b7280;
                  font-size: 15px;
                  line-height: 1.6;
                  margin-bottom: 20px;
                "
              >
                We are excited to have you with us.
                Your account has been successfully created and
                you are now ready to get started.
              </p>

              <!-- Welcome Box -->
              <div
                style="
                  display: inline-block;
                  background-color: #eff6ff;
                  border: 2px dashed #2563eb;
                  border-radius: 10px;
                  padding: 18px 30px;
                  margin: 10px 0 25px;
                "
              >
                <span
                  style="
                    display: block;
                    color: #2563eb;
                    font-size: 14px;
                    font-weight: bold;
                    margin-bottom: 8px;
                  "
                >
                  ACCOUNT CREATED SUCCESSFULLY
                </span>

                <strong
                  style="
                    font-size: 20px;
                    color: #111827;
                  "
                >
                  You're all set!
                </strong>
              </div>

              <p
                style="
                  color: #6b7280;
                  font-size: 14px;
                  line-height: 1.6;
                "
              >
                Thank you for choosing us.
                We hope you have a great experience using our application.
              </p>

              <!-- Button -->
              <div style="margin: 30px 0;">
                <a
                  href="#"
                  style="
                    display: inline-block;
                    background-color: #2563eb;
                    color: #ffffff;
                    text-decoration: none;
                    padding: 13px 28px;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: bold;
                  "
                >
                  Get Started
                </a>
              </div>

              <p
                style="
                  color: #9ca3af;
                  font-size: 13px;
                  margin-top: 25px;
                  line-height: 1.6;
                "
              >
                If you have any questions or need help,
                feel free to contact our support team.
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
