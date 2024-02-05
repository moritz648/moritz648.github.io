// Function to initiate WebAuthn registration
async function registerWebAuthn(uid, email) {
  const resp = await fetch(
    "https://generateregistration-nfxpj44ofq-uc.a.run.app",
    {
      method: "POST",
      headers: {
        Accept: "*/*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: uid,
        user_name: email,
      }),
    }
  );

  const opts = await resp.json();
  const { startRegistration } = SimpleWebAuthnBrowser;

  let regResp;
  try {
    regResp = await startRegistration(opts);
  } catch (err) {
    throw new Error(err);
  }

  const verificationResp = await fetch(
    "https://verifyregistration-nfxpj44ofq-uc.a.run.app",
    {
      method: "POST",
      headers: {
        Accept: "*/*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        resp: regResp, // Assuming attResp is already a JSON object
        user: {
          id: uid,
          name: email,
        },
      }),
    }
  );

  // Wait for the results of verification
  const verificationJSON = await verificationResp.json();
  if (verificationJSON && verificationJSON.verified) {
    window.handleWebAuthnRegisterResult("Successfully registered this device with Webauthn.");
  } else {
    window.handleWebAuthnRegisterResult("Something went wrong, please try again.");
  }
}

// Function to initiate WebAuthn login
async function loginWebAuthn(email) {
  const { startAuthentication } = SimpleWebAuthnBrowser;
  const resp = await fetch(
    "https://generatelogin-nfxpj44ofq-uc.a.run.app",
    {
      method: "POST",
      headers: {
        Accept: "*/*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
      }),
    }
  );

  const opts = await resp.json();

  let authResp;
  try {
    authResp = await startAuthentication(opts);
    console.log("Auth Worked");
  } catch (err) {
    throw new Error(err);
  }

  const verificationResp = await fetch(
    "https://verifylogin-nfxpj44ofq-uc.a.run.app",
    {
      method: "POST",
      headers: {
        Accept: "*/*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        resp: authResp, // Assuming attResp is already a JSON object
        email: email,
      }),
    }
  );

  const verificationRespJSON = await verificationResp.json();
  const { verified, msg, token } = verificationRespJSON;
  if (verified) {
    console.log(msg);
    window.handleWebAuthnLoginResult(token);
  } else {
    window.handleWebAuthnLoginFailure(msg);
  }
}
