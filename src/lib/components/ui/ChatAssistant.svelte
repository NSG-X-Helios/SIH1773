<script lang="ts">
  import { globalState } from "$lib/state.svelte";
  import { sendChatMessage } from "$lib/utils/groq";
  import { fade, slide } from "svelte/transition";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import X from "lucide-svelte/icons/x";
  import Send from "lucide-svelte/icons/send";
  import Settings from "lucide-svelte/icons/settings";
  import Bot from "lucide-svelte/icons/bot";
  import User from "lucide-svelte/icons/user";
  import { marked } from "marked";
  import DOMPurify from "dompurify";

  let inputMessage = $state("");
  let isSending = $state(false);

  // Auto-scroll logic
  let chatContainer: HTMLElement;
  $effect(() => {
    if (globalState.chatMessages.length && chatContainer) {
      setTimeout(() => {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }, 50);
    }
  });

  const handleSend = async () => {
    if (!inputMessage.trim() || isSending) return;

    const userText = inputMessage.trim();
    inputMessage = "";
    isSending = true;

    globalState.chatMessages.push({ role: "user", content: userText });

    try {
      const responseMsg = await sendChatMessage(userText);
      globalState.chatMessages.push(responseMsg);
    } catch (err: any) {
      console.error(err);
      globalState.chatMessages.push({
        role: "assistant",
        content: `Error: ${err.message || "Failed to communicate with AI"}`,
      });
    } finally {
      isSending = false;
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
</script>

{#if globalState.isChatOpen}
  <div
    class="fixed bottom-6 right-6 w-96 max-h-[80vh] bg-background/95 backdrop-blur shadow-2xl border border-border rounded-xl flex flex-col z-50"
    transition:slide={{ duration: 250, axis: "y" }}
    onkeydown={(e) => e.stopPropagation()}
    onkeyup={(e) => e.stopPropagation()}
  >
    <!-- Header -->
    <div
      class="flex items-center justify-between px-4 py-3 border-b bg-muted/30 rounded-t-xl"
    >
      <div class="flex items-center gap-2 font-semibold text-primary">
        <Bot class="w-5 h-5" />
        AI Mission Planner
      </div>
      <div class="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          class="h-8 w-8 text-muted-foreground hover:text-destructive"
          onclick={() => (globalState.isChatOpen = false)}
          title="Close"
        >
          <X class="w-4 h-4" />
        </Button>
      </div>
    </div>

    <!-- Chat Messages -->
    <div class="flex-1 overflow-y-auto p-4 space-y-4" bind:this={chatContainer}>
      {#if globalState.chatMessages.length === 0}
        <div class="text-center text-sm text-muted-foreground my-8 space-y-2">
          <Bot class="w-8 h-8 mx-auto opacity-50" />
          <p>Ready to assist with mission planning.</p>
          <p class="text-xs opacity-70">
            Ask for tactical advice, entry points, or analysis of the uploaded
            blueprints.
          </p>
        </div>
      {/if}

      {#each globalState.chatMessages as msg}
        <div
          class="flex w-full {msg.role === 'user'
            ? 'justify-end'
            : 'justify-start'}"
        >
          <div
            class="max-w-[85%] rounded-lg px-3 py-2 text-sm {msg.role === 'user'
              ? 'bg-primary text-primary-foreground rounded-tr-sm'
              : 'bg-muted text-foreground rounded-tl-sm'}"
          >
            {#if msg.role === "user"}
              <div class="whitespace-pre-wrap leading-relaxed">
                {msg.content}
              </div>
            {:else}
              <div class="prose prose-sm dark:prose-invert max-w-none">
                {@html DOMPurify.sanitize(marked.parse(msg.content) as string)}
              </div>
            {/if}
          </div>
        </div>
      {/each}

      {#if isSending}
        <div class="flex w-full justify-start">
          <div
            class="bg-muted text-foreground rounded-lg rounded-tl-sm px-4 py-3 text-sm flex items-center gap-2"
          >
            <div
              class="w-1.5 h-1.5 bg-foreground/50 rounded-full animate-bounce"
            ></div>
            <div
              class="w-1.5 h-1.5 bg-foreground/50 rounded-full animate-bounce"
              style="animation-delay: 0.15s"
            ></div>
            <div
              class="w-1.5 h-1.5 bg-foreground/50 rounded-full animate-bounce"
              style="animation-delay: 0.3s"
            ></div>
          </div>
        </div>
      {/if}
    </div>

    <!-- Input Area -->
    <div class="p-3 border-t bg-background rounded-b-xl">
      <div class="flex items-center gap-2">
        <Input
          placeholder="Type your message..."
          bind:value={inputMessage}
          onkeydown={handleKeyDown}
          disabled={isSending}
          class="h-10"
        />
        <Button
          size="icon"
          class="h-10 w-10 shrink-0"
          disabled={!inputMessage.trim() || isSending}
          onclick={handleSend}
        >
          <Send class="w-4 h-4" />
        </Button>
      </div>
    </div>
  </div>
{/if}
