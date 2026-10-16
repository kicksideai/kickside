import { watch } from 'vue'
import type { ReadableValue } from './readableValue'

interface SubmitProps {
  submitNonce?: unknown
}

// Standard inbound submit command for embedded create/edit web components.
// WippyVueElement exposes `submit-nonce` as submitNonce.
export function useSubmitNonce(
  props: ReadableValue<SubmitProps>,
  submit: () => void | Promise<void>,
  busy?: ReadableValue<boolean>,
): void {
  watch(
    () => props.value?.submitNonce,
    (value, previous) => {
      if (value == null || value === '' || value === previous || busy?.value) return
      void submit()
    },
  )
}
