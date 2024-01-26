async function registerWebAuthn {
  const opts = {
    attestation: 'none',
    authenticatorSelection: {
      authenticatorAttachment: 'platform',
      userVerification: 'required',
      requireResidentKey: false
    }
  };
  const options = await fetch(
                      "http://127.0.0.1:5001/noteit-4aa99/us-central1/generate_registration",
                      {
                        method: "POST",
                        headers: {
                          Accept: "*/*",
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify(opts),
                      }
                    );

  options.user.id = base64DecodeURL(options.user.id);
  options.challenge = base64DecodeURL(options.challenge);

  if (options.excludeCredentials) {
    for (let cred of options.excludeCredentials) {
      cred.id = base64DecodeURL(cred.id);
    }
  }

  const cred = await navigator.credentials.create({
    publicKey: options,
  });

  const credential = {};
  credential.id = cred.id;
  credential.rawId = base64EncodeURL(cred.rawId);
  credential.type = cred.type;

  if (cred.response) {
    const clientDataJSON =
      base64EncodeURL(cred.response.clientDataJSON);
    const attestationObject =
      base64EncodeURL(cred.response.attestationObject);
    credential.response = {
      clientDataJSON,
      attestationObject,
    };
  }


  const res = await fetch(
      "http://127.0.0.1:5001/noteit-4aa99/us-central1/verify_registration",
      {
        method: "POST",
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          credential: credential,
        }),
      }
    );
    console.log("RESULT:")
    console.log(res.json)
}


function base64EncodeURL(byteArray) {
  return btoa(Array.from(new Uint8Array(byteArray)).map(val => {
    return String.fromCharCode(val);
  }).join('')).replace(/\+/g, '-').replace(/\//g, '_').replace(/\=/g, '');
}

function base64DecodeURL(b64urlstring) {
  return new Uint8Array(atob(b64urlstring.replace(/-/g, '+').replace(/_/g, '/')).split('').map(val => {
    return val.charCodeAt(0);
  }));
}