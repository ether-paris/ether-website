<script lang="ts">
  import Button from "$lib/components/button.svelte";
  import { toast } from "$lib/stores/toast";
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  let domain = $state("");
  let email = $state("");
  let brandName = $state("");
  let loading = $state(false);
  let result: any = $state(null);

  async function handleSubmit() {
    if (!domain || !email || !brandName) {
      toast.error("Please fill in all fields");
      return;
    }

    loading = true;
    result = null;

    try {
      const response = await fetch("/api/tenant/onboard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ domain, email, brandName }),
      });

      const data = await response.json();

      if (response.ok) {
        result = data;
        toast.success("Domain registration started successfully!");
        // Clear form
        domain = "";
        email = "";
        brandName = "";
      } else {
        toast.error(data.error || "Failed to register domain");
        result = data;
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Register Domain | Ether</title>
</svelte:head>

<div class="min-h-screen bg-background">
  <!-- Header -->
  <header class="border-b border-border bg-surface">
    <div class="container mx-auto px-4 py-4 flex items-center justify-between">
      <div class="flex items-center gap-4">
        <a href="/" class="text-xl font-bold text-foreground">Ether</a>
        <span class="text-muted-foreground">/</span>
        <span class="text-foreground">Register Domain</span>
      </div>
      
      <div class="flex items-center gap-4">
        <a href="/dashboard" class="text-sm text-brand hover:underline">Dashboard</a>
        <form method="POST" action="/logout">
          <Button type="submit" variant="ghost" size="sm">Logout</Button>
        </form>
      </div>
    </div>
  </header>

  <main class="container mx-auto px-4 py-8">
    <div class="max-w-2xl mx-auto">
      <div class="bg-surface rounded-lg shadow-lg p-8 border border-border">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-foreground">Register New Domain</h1>
          <p class="mt-2 text-muted-foreground">
            Set up a new domain with email service and deployment infrastructure
          </p>
        </div>

        {#if data.user}
          <div class="mb-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
            <p class="text-sm text-blue-700">
              Registering as <strong>{data.user.github_username}</strong>. 
              The GitHub repository will be created in your personal account.
            </p>
          </div>
        {/if}

        <form on:submit|preventDefault={handleSubmit} class="space-y-6">
          <div>
            <label for="brandName" class="block text-sm font-medium text-foreground">
              Brand Name
            </label>
            <input
              type="text"
              id="brandName"
              bind:value={brandName}
              class="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              placeholder="e.g., My Business"
              required
            />
          </div>

          <div>
            <label for="domain" class="block text-sm font-medium text-foreground">
              Domain
            </label>
            <input
              type="text"
              id="domain"
              bind:value={domain}
              class="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              placeholder="e.g., mybusiness.com"
              required
            />
            <p class="mt-1 text-sm text-muted-foreground">
              The domain must already exist in Cloudflare
            </p>
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-foreground">
              Admin Email
            </label>
            <input
              type="email"
              id="email"
              bind:value={email}
              class="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              placeholder="e.g., admin@mybusiness.com"
              required
            />
            <p class="mt-1 text-sm text-muted-foreground">
              This will be the username for SMTP authentication
            </p>
          </div>

          <div class="pt-4">
            <Button
              type="submit"
              disabled={loading}
              class="w-full justify-center"
            >
              {#if loading}
                <svg
                  class="animate-spin -ml-1 mr-3 h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  />
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Registration in progress...
              {:else}
                Register Domain
              {/if}
            </Button>
          </div>
        </form>

        {#if result}
          <div class="mt-8 p-4 rounded-lg {result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}">
            <h3 class="text-lg font-medium {result.success ? 'text-green-800' : 'text-red-800'}">
              {result.success ? "Success!" : "Error"}
            </h3>
            <p class="mt-2 text-sm {result.success ? 'text-green-700' : 'text-red-700'}">
              {result.message || result.error}
            </p>
            
            {#if result.success}
              <div class="mt-4 space-y-2 text-sm text-green-700">
                <p><strong>Domain:</strong> {result.tenant.domain}</p>
                <p><strong>Email:</strong> {result.tenant.email}</p>
                <p><strong>Brand:</strong> {result.tenant.brandName}</p>
                <p><strong>Status:</strong> {result.tenant.status}</p>
              </div>
              <div class="mt-4 p-3 bg-white rounded border border-green-200">
                <p class="text-sm text-gray-600">
                  The registration process is running in the background. You will receive:
                </p>
                <ul class="mt-2 text-sm text-gray-600 list-disc list-inside space-y-1">
                  <li>A GitHub repository in your account at <code>github.com/{data.user?.github_username}/{result.tenant.domain.replace(/\./g, "-")}</code></li>
                  <li>Email service at <code>mail.{result.tenant.domain}</code></li>
                  <li>SMTP credentials for Gmail integration</li>
                  <li>Automatic deployment when you push to the repository</li>
                </ul>
              </div>
            {/if}
          </div>
        {/if}

        <div class="mt-8 border-t border-border pt-6">
          <h3 class="text-lg font-medium text-foreground">What happens during registration?</h3>
          <ol class="mt-4 space-y-3 text-sm text-muted-foreground list-decimal list-inside">
            <li>Creates a private GitHub repository in <strong>your account</strong> with website template and K8s manifests</li>
            <li>Verifies the domain in AWS SES for email sending</li>
            <li>Creates DNS records (mail.domain.com, SES verification, DKIM)</li>
            <li>Sets up the domain and user account in Stalwart Mail Server</li>
            <li>Creates Kubernetes Ingress for mail.domain.com with SSL certificate</li>
            <li>Generates SMTP credentials for Gmail "Send As" configuration</li>
          </ol>
        </div>

        <div class="mt-6 border-t border-border pt-6">
          <h3 class="text-lg font-medium text-foreground">Development Workflow</h3>
          <div class="mt-4 p-4 rounded-lg bg-surface border border-border">
            <ol class="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
              <li>Clone your repository locally</li>
              <li>Edit code using <strong>OpenCode</strong> on your machine</li>
              <li>Push changes to GitHub</li>
              <li>GitHub Actions builds Docker image automatically</li>
              <li>Kubernetes pulls and deploys the new image</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  </main>
</div>
