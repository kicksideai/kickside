interface CustomElementRegistryLike {
  get(name: string): CustomElementConstructor | undefined
  whenDefined(name: string): Promise<CustomElementConstructor>
}

export async function waitForCustomElement(
  name: string,
  timeoutMs: number,
  registry: CustomElementRegistryLike = customElements,
): Promise<void> {
  if (registry.get(name)) return
  await Promise.race([
    registry.whenDefined(name),
    new Promise<never>((_, reject) => setTimeout(
      () => reject(new Error(`Web Host did not define <${name}> within ${timeoutMs / 1000} seconds.`)),
      timeoutMs,
    )),
  ])
}
