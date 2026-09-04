import http from "http";
import app from "./src/app";
import { prisma } from "./src/app/lib/prisma";

async function runE2ETests() {
  const server = http.createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(5001, () => {
      console.log("Test server running on port 5001");
      resolve();
    });
  });

  const baseUrl = "http://localhost:5001";
  const testEmail = `test_patient_${Date.now()}@example.com`;
  const testPassword = "Password123!";
  const newPassword = "NewPassword456!";

  let accessToken = "";
  let refreshToken = "";

  try {
    console.log("\n--- Starting E2E Verification Tests ---");

    // 1. Health Check
    console.log("\n[Test 1] Health Check GET /");
    const healthRes = await fetch(`${baseUrl}/`);
    const healthData = await healthRes.json();
    console.log("Status:", healthRes.status, "Response:", healthData);
    if (healthRes.status !== 200) throw new Error("Health check failed");

    // 2. Validation error test
    console.log(
      "\n[Test 2] Registration validation error (invalid email & short password)",
    );
    const badRegRes = await fetch(`${baseUrl}/api/v1/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "",
        email: "invalid-email",
        password: "123",
      }),
    });
    const badRegData = await badRegRes.json();
    console.log("Status:", badRegRes.status, "Response:", badRegData);
    if (badRegRes.status !== 400)
      throw new Error("Expected 400 Bad Request for invalid data");

    // 3. Successful Registration
    console.log("\n[Test 3] Successful Patient Registration");
    const regRes = await fetch(`${baseUrl}/api/v1/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Rahim Uddin",
        email: testEmail,
        password: testPassword,
        contactNumber: "01700000000",
        address: "Dhaka, Bangladesh",
      }),
    });
    const regData = await regRes.json();
    console.log("Status:", regRes.status, "Message:", regData.message);
    if (regRes.status !== 201 || !regData.data?.accessToken) {
      throw new Error(`Registration failed: ${JSON.stringify(regData)}`);
    }
    accessToken = regData.data.accessToken;
    refreshToken = regData.data.refreshToken;
    console.log("Created user ID:", regData.data.user.id);
    console.log("Created patient ID:", regData.data.patient?.id);

    // 4. Duplicate Registration
    console.log("\n[Test 4] Duplicate Email Registration");
    const dupRes = await fetch(`${baseUrl}/api/v1/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Rahim Duplicate",
        email: testEmail,
        password: testPassword,
      }),
    });

    const dupData = await dupRes.json();
    console.log("Status:", dupRes.status, "Response:", dupData);
    if (dupRes.status !== 409)
      throw new Error("Expected 409 Conflict for duplicate email");

    // 5. Invalid Login Credentials
    console.log("\n[Test 5] Invalid Password Login");
    const wrongLoginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: "WrongPassword!",
      }),
    });
    const wrongLoginData = await wrongLoginRes.json();
    console.log("Status:", wrongLoginRes.status, "Response:", wrongLoginData);
    if (wrongLoginRes.status !== 401)
      throw new Error("Expected 401 Unauthorized for wrong password");

    // 6. Successful Login
    console.log("\n[Test 6] Successful Login");
    const loginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
    });
    const loginData = await loginRes.json();
    console.log("Status:", loginRes.status, "Response:", loginData);
    if (loginRes.status !== 200 || !loginData.data?.accessToken) {
      throw new Error(`Login failed: ${JSON.stringify(loginData)}`);
    }
    accessToken = loginData.data.accessToken;
    refreshToken = loginData.data.refreshToken;

    // 7. Get Current User Profile (GET /api/v1/auth/me)
    console.log("\n[Test 7] Fetch Current Profile (GET /api/v1/auth/me)");
    const meRes = await fetch(`${baseUrl}/api/v1/auth/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const meData = await meRes.json();
    console.log("Status:", meRes.status, "User Profile:", meData);
    if (meRes.status !== 200 || meData.data?.email !== testEmail) {
      throw new Error("Get profile failed");
    }

    // 8. Refresh Token
    console.log(
      "\n[Test 8] Refresh Access Token (POST /api/v1/auth/refresh-token)",
    );
    const refreshRes = await fetch(`${baseUrl}/api/v1/auth/refresh-token`, {
      method: "POST",
      headers: {
        Cookie: `refreshToken=${refreshToken}`,
      },
    });
    const refreshData = await refreshRes.json();
    console.log("Status:", refreshRes.status, "Response:", refreshData);
    if (refreshRes.status !== 200 || !refreshData.data?.accessToken) {
      throw new Error("Refresh token failed");
    }
    accessToken = refreshData.data.accessToken;

    // 9. Change Password
    console.log(
      "\n[Test 9] Change Password (POST /api/v1/auth/change-password)",
    );
    const changePassRes = await fetch(
      `${baseUrl}/api/v1/auth/change-password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          currentPassword: testPassword,
          newPassword: newPassword,
        }),
      },
    );
    const changePassData = await changePassRes.json();
    console.log("Status:", changePassRes.status, "Response:", changePassData);
    if (changePassRes.status !== 200) throw new Error("Change password failed");

    // 10. Login with new password
    console.log("\n[Test 10] Login with New Password");
    const newLoginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: newPassword,
      }),
    });
    const newLoginData = await newLoginRes.json();
    console.log("Status:", newLoginRes.status, "Response:", newLoginData);
    if (newLoginRes.status !== 200)
      throw new Error("Login with new password failed");

    // 11. Logout
    console.log("\n[Test 11] Logout (POST /api/v1/auth/logout)");
    const logoutRes = await fetch(`${baseUrl}/api/v1/auth/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${newLoginData.data.accessToken}`,
      },
    });
    const logoutData = await logoutRes.json();
    console.log("Status:", logoutRes.status, "Response:", logoutData);
    if (logoutRes.status !== 200) throw new Error("Logout failed");

    console.log("\n✅ ALL 11 E2E TESTS PASSED SUCCESSFULLY! ✅");
  } finally {
    // Clean up test user
    console.log("\nCleaning up test user from DB...");
    await prisma.patient.deleteMany({ where: { email: testEmail } });
    await prisma.user.deleteMany({ where: { email: testEmail } });
    console.log("Test cleanup completed.");

    server.close();
    await prisma.$disconnect();
  }
}

runE2ETests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
