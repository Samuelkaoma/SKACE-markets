export interface EscrowTransaction {
  id: string;
  amount: number;
  status: 'PENDING' | 'LOCKED' | 'RELEASED' | 'DISPUTED';
  freelancerId: string;
  employerId: string;
}

export const simulateEscrowLock = (amount: number, balance: number) => {
  if (balance < amount) {
    throw new Error("Insufficient Kwacha balance in SKACE Wallet.");
  }
  
  return {
    success: true,
    newBalance: balance - amount,
    escrowStatus: 'LOCKED' as const,
    msg: `K${amount} successfully held in SKACE Escrow.`
  };
};