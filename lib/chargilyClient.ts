import { ChargilyClient } from "@chargily/chargily-pay"

const apiKey = process.env.CHARGILY_PRIVATE_KEY
const modeEnv = process.env.CHARGILY_MODE

const mode = (modeEnv === "live" ? "live" : "test") as "test" | "live"

if (!apiKey) {
  // This will only run on the server; we fail fast if misconfigured.
  console.warn("CHARGILY_PRIVATE_KEY is not set. Chargily payments will not work until it is configured.")
}

export const chargilyClient =
  apiKey != null
    ? new ChargilyClient({
        api_key: apiKey,
        mode,
      })
    : null

