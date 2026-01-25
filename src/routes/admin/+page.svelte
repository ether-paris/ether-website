<script lang="ts">
  import { enhance } from '$app/forms';
  import { onMount } from 'svelte';
  import { EditorView, basicSetup } from "codemirror"
  import { sql } from "@codemirror/lang-sql"
  import { oneDark } from "@codemirror/theme-one-dark"
  import { EditorState } from "@codemirror/state"
  import { toast } from '$lib/stores/toast.svelte';
  import Button from '$lib/components/button.svelte';

  interface Props {
      data: {
          authenticated: boolean;
          initialResult?: any;
      };
      form: any;
  }

  let { data, form }: Props = $props();
  let editorContainer = $state<HTMLDivElement | null>(null);
  let editorView = $state<EditorView | null>(null);
  let queryValue = $state('SELECT * FROM visitors ORDER BY timestamp DESC LIMIT 10;');
  
  // Initialize queryValue from form on mount
  $effect(() => {
    if (form?.query) {
      queryValue = form.query;
    }
  });
  let authenticated = $derived(data.authenticated);
  let result = $derived(form?.result ?? data.initialResult);

  onMount(() => {
    if (!editorContainer || !authenticated) return;

    const state = EditorState.create({
      doc: queryValue,
      extensions: [
        basicSetup,
        sql(),
        oneDark,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
             queryValue = update.state.doc.toString();
          }
        }),
        EditorView.theme({
          "&": { height: "100%", fontSize: "14px" },
          ".cm-scroller": { overflow: "auto" }
        })
      ]
    });

    editorView = new EditorView({
      state,
      parent: editorContainer
    });

    return () => {
      editorView?.destroy();
    };
  });

  $effect(() => {
    if (form?.error && !form.success) {
        toast.error(form.error);
    }
  });
</script>

<div class="min-h-screen bg-background text-foreground font-sans">
  {#if !authenticated}
    <div class="flex h-screen items-center justify-center p-4">
        <div class="retro-card w-full max-w-md p-8 space-y-6 bg-surface">
            <div class="space-y-2 text-center">
                <h1 class="font-display text-3xl">Ether Admin</h1>
                <p class="text-sm text-muted-foreground">Internal access only</p>
            </div>

            <form method="POST" action="?/login" use:enhance class="space-y-4">
                <div class="space-y-2">
                    <label for="password" class="text-xs uppercase tracking-[0.2em] text-muted-foreground">Password</label>
                    <input 
                        type="password" 
                        name="password" 
                        id="password" 
                        required
                        class="w-full rounded-lg border border-black/10 bg-surface/50 px-4 py-3 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand font-mono"
                        placeholder="••••••••"
                    />
                </div>
                <Button type="submit" class="w-full">
                    Enter System
                </Button>
            </form>
        </div>
    </div>
  {:else}
    <div class="container py-8 space-y-8">
      <header class="flex items-center justify-between">
          <h1 class="font-display text-3xl text-brand">Ether SQL Admin</h1>
          <div class="flex gap-4">
            <form method="POST" action="?/logout" use:enhance>
                <button type="submit" class="text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-red-500 transition-colors">
                    Log out
                </button>
            </form>
          </div>
      </header>
    
      <div class="grid gap-8">
        <!-- SQL Editor Section -->
        <div class="space-y-4">
            <div class="retro-card overflow-hidden bg-[#282c34] border-gray-700">
                <div class="bg-gray-800 px-4 py-2 text-xs text-gray-400 border-b border-gray-700 flex justify-between items-center font-mono">
                    <span>SQL Query</span>
                    <span>SQLite</span>
                </div>
                <div bind:this={editorContainer} class="h-[300px]"></div>
            </div>

            <form method="POST" action="?/query" use:enhance>
                <input type="hidden" name="query" value={queryValue} />
                <div class="flex gap-4">
                    <Button type="submit">
                        Execute Query
                    </Button>
                    <button
                        type="button"
                        onclick={() => {
                            const q = 'SELECT * FROM visitors ORDER BY timestamp DESC LIMIT 50;';
                            queryValue = q;
                            if (editorView) {
                                editorView.dispatch({
                                    changes: {from: 0, to: editorView.state.doc.length, insert: q}
                                });
                            }
                        }}
                        class="px-6 py-3 rounded-full border border-black/10 text-sm font-medium hover:bg-black/5 transition-colors"
                    >
                        Reset Default
                    </button>
                </div>
            </form>
        </div>

        <!-- Results Section -->
        <div class="retro-card min-h-[400px] flex flex-col overflow-hidden bg-surface">
             <div class="border-b border-black/5 bg-surface/50 px-6 py-4">
                <h2 class="text-sm uppercase tracking-[0.2em] text-muted-foreground">Query Results</h2>
             </div>
             
             <div class="flex-1 overflow-auto p-0">
                {#if result}
                    {#if Array.isArray(result)}
                        {#if result.length === 0}
                             <div class="flex h-64 items-center justify-center text-muted-foreground italic">
                                No results found.
                            </div>
                        {:else}
                            <table class="w-full text-left text-sm">
                            <thead class="bg-black/5 font-mono text-xs">
                                <tr>
                                {#each Object.keys(result[0]) as key}
                                    <th class="whitespace-nowrap px-6 py-3 font-medium text-brand">{key}</th>
                                {/each}
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-black/5">
                                {#each result as row}
                                <tr class="hover:bg-black/5 transition-colors">
                                    {#each Object.values(row) as value}
                                    <td class="whitespace-nowrap px-6 py-3 font-mono text-muted-foreground">{value}</td>
                                    {/each}
                                </tr>
                                {/each}
                            </tbody>
                            </table>
                        {/if}
                    {:else}
                         <div class="p-6">
                            <pre class="font-mono text-sm text-green-600 bg-green-50 p-4 rounded-lg">{JSON.stringify(result, null, 2)}</pre>
                         </div>
                    {/if}
                {:else if !form?.error}
                     <div class="flex h-full items-center justify-center text-muted-foreground/50">
                        <div class="text-center space-y-2">
                            <p>Ready to execute query</p>
                        </div>
                    </div>
                {/if}
             </div>
        </div>
      </div>
    </div>
  {/if}
</div>
