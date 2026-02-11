import { env } from "$env/dynamic/private";

const AWS_ACCESS_KEY_ID = env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = env.AWS_SECRET_ACCESS_KEY;
const AWS_REGION = env.AWS_REGION || "us-east-1";

// AWS SES v2 API endpoint
const BASE_URL = `https://email.${AWS_REGION}.amazonaws.com`;

interface AWSCredentials {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken?: string;
}

// Simple AWS Signature Version 4 signing
async function signRequest(
  method: string,
  path: string,
  payload: string,
  headers: Record<string, string> = {}
): Promise<Record<string, string>> {
  const now = new Date();
  const dateStamp = now.toISOString().replace(/[:-]|\.\d{3}/g, "").slice(0, 8);
  const timeStamp = now.toISOString().replace(/[:-]|\.\d{3}/g, "");

  const credentialScope = `${dateStamp}/${AWS_REGION}/ses/aws4_request`;

  // Canonical request
  const canonicalHeaders = Object.entries({
    host: `email.${AWS_REGION}.amazonaws.com`,
    "x-amz-date": timeStamp,
    ...headers,
  })
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k.toLowerCase()}:${v.trim()}`)
    .join("\n");

  const signedHeaders = Object.keys({
    host: true,
    "x-amz-date": true,
    ...headers,
  })
    .sort()
    .map((k) => k.toLowerCase())
    .join(";");

  const payloadHash = await sha256(payload);

  const canonicalRequest = [
    method,
    path,
    "",
    canonicalHeaders + "\n",
    signedHeaders,
    payloadHash,
  ].join("\n");

  // String to sign
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    timeStamp,
    credentialScope,
    await sha256(canonicalRequest),
  ].join("\n");

  // Calculate signature
  const signingKey = await getSigningKey(
    AWS_SECRET_ACCESS_KEY!,
    dateStamp,
    AWS_REGION
  );
  const signature = await hmacHex(signingKey, stringToSign);

  // Authorization header
  const authorization = `AWS4-HMAC-SHA256 Credential=${AWS_ACCESS_KEY_ID}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  return {
    Authorization: authorization,
    "X-Amz-Date": timeStamp,
    Host: `email.${AWS_REGION}.amazonaws.com`,
    ...headers,
  };
}

async function sha256(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function getSigningKey(
  secretKey: string,
  dateStamp: string,
  region: string
): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const secretKeyBytes = encoder.encode(`AWS4${secretKey}`);
  const kDate = await hmac(secretKeyBytes.buffer, dateStamp);
  const kRegion = await hmac(kDate, region);
  const kService = await hmac(kRegion, "ses");
  const kSigning = await hmac(kService, "aws4_request");
  return kSigning;
}

async function hmac(key: ArrayBuffer, message: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    key,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(message));
  return signature;
}

async function hmacHex(key: ArrayBuffer, message: string): Promise<string> {
  const signature = await hmac(key, message);
  const array = Array.from(new Uint8Array(signature));
  return array.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function verifyDomainIdentity(domain: string) {
  if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
    throw new Error("AWS credentials not configured");
  }

  const payload = JSON.stringify({
    EmailIdentity: domain,
  });

  const headers = await signRequest(
    "POST",
    "/v2/email/identities",
    payload,
    {
      "Content-Type": "application/json",
    }
  );

  const response = await fetch(`${BASE_URL}/v2/email/identities`, {
    method: "POST",
    headers,
    body: payload,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`AWS SES error: ${error}`);
  }

  const data = await response.json();
  return data;
}

export async function getDomainVerificationToken(domain: string) {
  if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
    throw new Error("AWS credentials not configured");
  }

  const headers = await signRequest(
    "GET",
    `/v2/email/identities/${domain}`,
    ""
  );

  const response = await fetch(`${BASE_URL}/v2/email/identities/${domain}`, {
    headers,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`AWS SES error: ${error}`);
  }

  const data = await response.json();
  return data;
}

export async function verifyDomainDkim(domain: string) {
  if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
    throw new Error("AWS credentials not configured");
  }

  const payload = JSON.stringify({});

  const headers = await signRequest(
    "POST",
    `/v2/email/identities/${domain}/dkim`,
    payload,
    {
      "Content-Type": "application/json",
    }
  );

  const response = await fetch(`${BASE_URL}/v2/email/identities/${domain}/dkim`, {
    method: "POST",
    headers,
    body: payload,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`AWS SES error: ${error}`);
  }

  const data = await response.json();
  return data;
}

export async function getIdentityVerificationAttributes(domain: string) {
  if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
    throw new Error("AWS credentials not configured");
  }

  const headers = await signRequest(
    "GET",
    `/v2/email/identities/${domain}`,
    ""
  );

  const response = await fetch(`${BASE_URL}/v2/email/identities/${domain}`, {
    headers,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`AWS SES error: ${error}`);
  }

  return response.json();
}
