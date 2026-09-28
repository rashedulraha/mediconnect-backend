export const changeSuccessfully = (name: string) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Password Changed Successfully</title>
</head>

<body style="
  margin: 0;
  padding: 0;
  font-family: Arial, Helvetica, sans-serif;
">

  <div style="
    width: 100%;
    padding: 40px 0;
  ">

    <div style="
      max-width: 520px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    ">

      <!-- Header -->
      <div style="
        background-color: #16a34a;
        padding: 28px 20px;
        text-align: center;
      ">
        <h1 style="
          margin: 0;
          color: #ffffff;
          font-size: 25px;
        ">
          Password Changed
        </h1>
      </div>

      <!-- Content -->
      <div style="
        padding: 35px 30px;
        text-align: center;
      ">

        <!-- Success Icon -->
        <div style="
          width: 60px;
          height: 60px;
          line-height: 60px;
          margin: 0 auto 20px;
          border-radius: 50%;
          background-color: #dcfce7;
          color: #16a34a;
          font-size: 32px;
          font-weight: bold;
        ">
          ✓
        </div>

        <h2 style="
          margin: 0 0 15px;
          color: #111827;
          font-size: 22px;
        ">
          Password Changed Successfully
        </h2>

        <p style="
          color: #6b7280;
          font-size: 15px;
          line-height: 1.7;
          margin: 0 0 20px;
        ">
          Hello ${name},
        </p>

        <p style="
          color: #6b7280;
          font-size: 15px;
          line-height: 1.7;
          margin: 0 0 25px;
        ">
          Your account password has been successfully changed.
          You can now use your new password to sign in to your account.
        </p>

        <!-- Security Notice -->
        <div style="
          background-color: #fff7ed;
          border: 1px solid #fed7aa;
          border-radius: 8px;
          padding: 16px;
          text-align: left;
          margin-bottom: 25px;
        ">

          <p style="
            margin: 0 0 8px;
            color: #c2410c;
            font-size: 14px;
            font-weight: bold;
          ">
            Security Notice
          </p>

          <p style="
            margin: 0;
            color: #7c2d12;
            font-size: 13px;
            line-height: 1.6;
          ">
            If you did not make this change, please contact our
            support team immediately and secure your account.
          </p>

        </div>

        <p style="
          color: #9ca3af;
          font-size: 13px;
          line-height: 1.6;
          margin: 0;
        ">
          For your security, never share your password with anyone.
        </p>

      </div>

      <!-- Footer -->
      <div style="
        background-color: #f9fafb;
        padding: 20px;
        text-align: center;
        border-top: 1px solid #e5e7eb;
      ">

        <p style="
          margin: 0;
          color: #9ca3af;
          font-size: 12px;
        ">
          © 2026 Your Application. All rights reserved.
        </p>

      </div>

    </div>

  </div>

</body>
</html>
`;
};
