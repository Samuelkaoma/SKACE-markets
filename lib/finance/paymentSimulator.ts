export type PaymentProvider = 'AIRTEL' | 'MTN' | 'ZAMTEL';

export const simulateMobileMoneyDeposit = async (
  phoneNumber: string, 
  amount: number, 
  provider: PaymentProvider
) => {
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Basic Zambian number validation (simplified)
  const isValidNumber = /^(097|096|077|076)\d{7}$/.test(phoneNumber);

  if (!isValidNumber) {
    return { success: false, message: "Invalid Zambian mobile number." };
  }

  return {
    success: true,
    transactionId: `TX-${Math.random().toString(36).toUpperCase().substring(2, 10)}`,
    provider,
    amount,
    message: `Deposit of K${amount} initiated. Check your phone for the USSD prompt.`
  };
};