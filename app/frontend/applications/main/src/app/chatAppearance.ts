/**
 * Appearance for the chat surface on `/sessions`.
 *
 * This is KickSide's look, so it lives in KickSide. It used to be split in two:
 * half here, injected into the chat's shadow root by hand, and half in the web
 * host behind `presentation="standalone"` — a mode the host carried on this
 * app's behalf. Product styling does not belong in a shared component, and the
 * split had already drifted: the two halves disagreed about which state they
 * applied to, so the blank chat got one and not the other.
 *
 * Delivered through the chat element's `custom-css` prop, which the host
 * appends last in the shadow cascade — the same position the hand-injected
 * `<style>` occupied, so the cascade is unchanged.
 *
 * The first block is what `presentation="standalone"` used to provide, carried
 * over as-is with the `--standalone` suffix dropped. It is deliberately not
 * pruned: several of these rules are already overridden by the KickSide rules
 * below, and deciding which by reading rather than rendering is how a
 * regression gets in.
 */
export const CHAT_APPEARANCE_CSS = `
[part="root"]:has([part="meta"]:empty) [part="composer"] {
  visibility: hidden;
}

.chat-container {
  --wippy-host-message-bg: transparent;
  --wippy-host-message-agent-bg: transparent;
  --wippy-host-message-border-width: 0;
  --wippy-host-message-shadow: none;
  --wippy-host-message-radius: 0;
  --wippy-host-message-padding-x: 0;
  --wippy-host-message-padding-y: 0;
  --wippy-host-message-font-size: var(--wippy-host-chat-font-size, 1rem);
  --wippy-host-message-user-bg: var(--p-surface-100);
  --wippy-host-message-user-radius: 1.5rem;
  --wippy-host-message-user-padding-x: 1.5rem;
  --wippy-host-message-user-padding-y: 0.75rem;
  --wippy-host-input-border-width: 0;
  --wippy-host-meta-bar-border-width: 0;
}

.chat-container .chat-message__avatar,
.chat-container .chat-tool-group__spacer {
  display: none;
}

.chat-container .chat-message,
.chat-container .chat-tool-group {
  gap: 0;
}

.chat-container .chat-message-list {
  padding-left: 0;
}

.chat-container .chat-message--user {
  margin-left: clamp(2.5rem, 8%, 4rem);
}

@media (prefers-color-scheme: dark) {
  :host(:not(.w-theme-light)) .chat-container {
    --wippy-host-message-user-bg: var(--p-surface-800);
  }
}

.w-theme-dark .chat-container {
  --wippy-host-message-user-bg: var(--p-surface-800);
}

.chat-container .chat-messages,
.chat-container .chat-composer-shell {
  --wippy-host-chat-content-gutter: clamp(0.75rem, 2vw, 1.5rem);
  width: min(
    100%,
    calc(
      var(--wippy-host-chat-content-max-width, 52rem)
      + (2 * var(--wippy-host-chat-content-gutter))
    )
  );
  padding-inline: var(--wippy-host-chat-content-gutter);
  box-sizing: border-box;
  margin-inline: auto;
}

.wippy-chat-host .chat-container--selected {
  font-size: 1.08rem;
}
.wippy-chat-host .chat-container--selected .chat-message__body,
.wippy-chat-host .chat-container--selected .chat-input {
  font-size: 1rem;
  line-height: 1.55;
}
.wippy-chat-host .chat-container--selected .chat-input__textarea {
  padding-block: calc(.5rem - 1px);
  font-size: 1rem;
  line-height: 1.55;
  scrollbar-width: none;
}
.wippy-chat-host .chat-container--selected .chat-input__textarea::-webkit-scrollbar {
  width: 0;
  height: 0;
}
.wippy-chat-host .chat-container--selected {
  grid-template-rows: minmax(0, 1fr) auto auto auto;
}
.wippy-chat-host .chat-container--selected > .chat-meta-list,
.wippy-chat-host .chat-container--selected > .chat-input,
.wippy-chat-host .chat-container--selected > .chat-input__prompts,
.wippy-chat-host .chat-container--selected > .chat-input__upload-list {
  width: min(100%, 48rem);
  justify-self: center;
}
.wippy-chat-host .chat-container--selected > .chat-message-list {
  grid-row: 1;
}
.wippy-chat-host .chat-container--selected > .chat-meta-list {
  grid-row: 2;
  box-sizing: border-box;
  padding: .375rem .5rem;
  border: 0;
  background: transparent;
  box-shadow: none;
}
.wippy-chat-host .chat-container--selected > .chat-meta-list > .chat-meta-list__item {
  border: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}
.wippy-chat-host .chat-container--selected > .chat-input__prompts {
  grid-row: 3;
}
.wippy-chat-host .chat-container--selected > .chat-input {
  grid-row: 4;
  border-top: 0;
}
.wippy-chat-host .chat-container--selected > .chat-message-list > * {
  width: min(100%, 48rem);
  margin-inline: auto;
  flex-shrink: 0;
}
.wippy-chat-host .chat-container--selected > .chat-message-list > .chat-message--user {
  width: min(calc(100% - 3rem), 45rem);
  margin-left: auto;
  margin-right: max(0px, calc((100% - 48rem) / 2));
}
.wippy-chat-host .chat-container--non-selected {
  min-height: 0;
  padding: 0;
  background: var(--p-content-background);
}
.wippy-chat-host .chat-container__empty-state {
  padding: 0;
}
.wippy-chat-host .chat-container__empty-state > .icon,
.wippy-chat-host .chat-container__empty-state-title,
.wippy-chat-host .chat-container__empty-state-description {
  display: none;
}
`
