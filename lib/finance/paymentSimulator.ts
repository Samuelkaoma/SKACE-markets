import { randomUUID } from "node:crypto"

export type PaymentProvider = "AIRTEL" | "MTN" | "ZAMTEL"

const providerPrefixes: Record<PaymentProvider, RegExp> = {
  AIRTEL: /^(097|077)\d{7}$/,
  MTN: /^(096|076)\d{7}$/,
  ZAMTEL: /^(095|075)\d{7}$/,
}

export const simulateMobileMoneyDeposit = async (
  phoneNumber: string,
  amount: number,
  provider: PaymentProvider,
) => {
  await new Promise((resolve) => setTimeout(resolve, 1200))

  const normalizedPhone = phoneNumber.replace(/\s+/g, "")

  if (!Number.isFinite(amount) || amount <= 0) {
    return { success: false, message: "Deposit amount must be greater than zero." }
  }

  if (!providerPrefixes[provider].test(normalizedPhone)) {
    return {
      success: false,
      message: `Invalid ${provider} mobile money number.`,
    }
  }

  return {
    success: true,
    transactionId: `MM-${randomUUID().slice(0, 8).toUpperCase()}`,
    provider,
    amount,
    message: `Deposit of K${amount.toLocaleString()} initiated. Confirm the mobile money prompt on your phone.`,
  }
}
