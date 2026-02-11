<script lang="ts">
  import type { PageData } from './$types';
  import Button from '$lib/components/button.svelte';
  
  interface Props {
    data: PageData;
  }
  
  let { data }: Props = $props();
  let { user, tenants } = $derived(data);
</script>

<svelte:head>
  <title>Dashboard | Ether</title>
</svelte:head>

<div class="min-h-screen bg-background">
  <!-- Header -->
  <header class="border-b border-border bg-surface">
    <div class="container mx-auto px-4 py-4 flex items-center justify-between">
      <div class="flex items-center gap-4">
        <a href="/" class="text-xl font-bold text-foreground">Ether</a>
      </div>
      
      <div class="flex items-center gap-4">
        {#if user}
          <div class="flex items-center gap-2">
            {#if user.avatar_url}
              <img src={user.avatar_url} alt={user.github_username} class="w-8 h-8 rounded-full" />
            {/if}
            <span class="text-sm text-muted-foreground">{user.github_username}</span>
          </div>
        {/if}
        
        <form method="POST" action="/logout">
          <Button type="submit" variant="ghost" size="sm">Logout</Button>
        </form>
      </div>
    </div>
  </header>

  <!-- Main Content -->
  <main class="container mx-auto px-4 py-8">
    <div class="max-w-4xl mx-auto space-y-8">
      <!-- Welcome Section -->
      <div class="space-y-2">
        <h1 class="text-3xl font-bold text-foreground">Dashboard</h1>
        <p class="text-muted-foreground">
          Welcome back{user ? `, ${user.github_username}` : ''}! Manage your domains and deployments.
        </p>
      </div>

      <!-- Quick Actions -->
      <div class="grid gap-4 md:grid-cols-2">
        <a 
          href="/admin/tenant-onboarding" 
          class="p-6 rounded-lg border border-border bg-surface hover:border-brand transition-colors group"
        >
          <div class="flex items-start justify-between">
            <div class="space-y-2">
              <h3 class="text-lg font-semibold text-foreground group-hover:text-brand">Register New Domain</h3>
              <p class="text-sm text-muted-foreground">Set up a new domain with email service and deployment</p>
            </div>
            <svg class="w-6 h-6 text-muted-foreground group-hover:text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
          </div>
        </a>

        <div class="p-6 rounded-lg border border-border bg-surface">
          <div class="space-y-2">
            <h3 class="text-lg font-semibold text-foreground">Documentation</h3>
            <p class="text-sm text-muted-foreground">Learn how to deploy and manage your sites</p>
          </div>
          <div class="mt-4 space-y-2 text-sm">
            <a href="/docs/getting-started" class="block text-brand hover:underline">Getting Started Guide</a>
            <a href="/docs/deployment" class="block text-brand hover:underline">Deployment Workflow</a>
            <a href="/docs/email-setup" class="block text-brand hover:underline">Email Configuration</a>
          </div>
        </div>
      </div>

      <!-- Tenants List -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold text-foreground">Your Domains</h2>
        
        {#if tenants && tenants.length > 0}
          <div class="space-y-4">
            {#each tenants as tenant}
              <div class="p-6 rounded-lg border border-border bg-surface">
                <div class="flex items-start justify-between">
                  <div class="space-y-1">
                    <div class="flex items-center gap-2">
                      <h3 class="text-lg font-semibold text-foreground">{tenant.domain}</h3>
                      <span 
                        class="px-2 py-0.5 text-xs rounded-full {tenant.status === 'completed' ? 'bg-green-100 text-green-700' : tenant.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}"
                      >
                        {tenant.status}
                      </span>
                    </div>
                    <p class="text-sm text-muted-foreground">{tenant.brand_name}</p>
                    {#if tenant.github_repo}
                      <a href={tenant.github_repo} target="_blank" rel="noopener" class="text-sm text-brand hover:underline flex items-center gap-1">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                        View Repository
                      </a>
                    {/if}
                  </div>
                  
                  <div class="text-right space-y-1 text-sm">
                    {#if tenant.stalwart_username}
                      <p class="text-muted-foreground">
                        Email: {tenant.stalwart_username}
                      </p>
                    {/if}
                    <p class="text-muted-foreground">
                      Created: {new Date(tenant.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <!-- Status Details -->
                <div class="mt-4 pt-4 border-t border-border">
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div class="flex items-center gap-2">
                      <span class="w-2 h-2 rounded-full {tenant.github_repo ? 'bg-green-500' : 'bg-gray-300'}"></span>
                      <span class="text-muted-foreground">GitHub Repo</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="w-2 h-2 rounded-full {tenant.aws_ses_verified ? 'bg-green-500' : 'bg-gray-300'}"></span>
                      <span class="text-muted-foreground">Email Service</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="w-2 h-2 rounded-full {tenant.stalwart_user_created ? 'bg-green-500' : 'bg-gray-300'}"></span>
                      <span class="text-muted-foreground">Mail Account</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="w-2 h-2 rounded-full {tenant.k8s_ingress_created ? 'bg-green-500' : 'bg-gray-300'}"></span>
                      <span class="text-muted-foreground">Deployment</span>
                    </div>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        {:else}
          <div class="p-8 text-center rounded-lg border border-dashed border-border">
            <p class="text-muted-foreground mb-4">You haven't registered any domains yet.</p>
            <a href="/admin/tenant-onboarding" class="text-brand hover:underline">Register your first domain →</a>
          </div>
        {/if}
      </div>
    </div>
  </main>
</div>
