import { env } from "$env/dynamic/private";

const KUBECONFIG_PATH = env.KUBECONFIG_PATH || "/root/.kube/config";

interface IngressConfig {
  domain: string;
  namespace: string;
  serviceName: string;
  servicePort: number;
}

function generateMailIngressManifest(config: IngressConfig): string {
  return `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: mail-${config.domain.replace(/\./g, "-")}
  namespace: mail-server
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
    external-dns.alpha.kubernetes.io/hostname: mail.${config.domain}
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - mail.${config.domain}
    secretName: mail-${config.domain.replace(/\./g, "-")}-tls
  rules:
  - host: mail.${config.domain}
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: ${config.serviceName}
            port:
              number: ${config.servicePort}
`;
}

export async function createMailIngress(domain: string): Promise<boolean> {
  try {
    const manifest = generateMailIngressManifest({
      domain,
      namespace: "mail-server",
      serviceName: "stalwart-mail-web",
      servicePort: 8080,
    });

    // Write manifest to temp file
    const tempFile = `/tmp/mail-ingress-${domain}.yaml`;
    await Bun.write(tempFile, manifest);

    // Apply using kubectl
    const proc = Bun.spawn({
      cmd: ["kubectl", "apply", "-f", tempFile],
      stdout: "pipe",
      stderr: "pipe",
    });

    const exitCode = await proc.exited;

    // Clean up temp file
    try {
      await Bun.file(tempFile).delete();
    } catch {}

    if (exitCode !== 0) {
      const stderr = await new Response(proc.stderr).text();
      throw new Error(`kubectl error: ${stderr}`);
    }

    return true;
  } catch (error: any) {
    console.error("Failed to create ingress:", error);
    throw error;
  }
}

export async function deleteMailIngress(domain: string): Promise<boolean> {
  try {
    const ingressName = `mail-${domain.replace(/\./g, "-")}`;

    const proc = Bun.spawn({
      cmd: ["kubectl", "delete", "ingress", ingressName, "-n", "mail-server"],
      stdout: "pipe",
      stderr: "pipe",
    });

    const exitCode = await proc.exited;

    if (exitCode !== 0) {
      const stderr = await new Response(proc.stderr).text();
      // If not found, that's okay
      if (stderr.includes("NotFound")) {
        return true;
      }
      throw new Error(`kubectl error: ${stderr}`);
    }

    return true;
  } catch (error: any) {
    console.error("Failed to delete ingress:", error);
    throw error;
  }
}

export async function getIngressStatus(domain: string): Promise<any> {
  try {
    const ingressName = `mail-${domain.replace(/\./g, "-")}`;

    const proc = Bun.spawn({
      cmd: [
        "kubectl",
        "get",
        "ingress",
        ingressName,
        "-n",
        "mail-server",
        "-o",
        "json",
      ],
      stdout: "pipe",
      stderr: "pipe",
    });

    const exitCode = await proc.exited;

    if (exitCode !== 0) {
      const stderr = await new Response(proc.stderr).text();
      if (stderr.includes("NotFound")) {
        return null;
      }
      throw new Error(`kubectl error: ${stderr}`);
    }

    const stdout = await new Response(proc.stdout).text();
    return JSON.parse(stdout);
  } catch (error: any) {
    console.error("Failed to get ingress status:", error);
    return null;
  }
}
