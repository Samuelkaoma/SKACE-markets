export class WalletService {
  static async getBalance(userId: string): Promise<number> {
    return Math.random() * 1000;
  }

  static async deposit(userId: string, amount: number) {
    return {
      success: true,
      balance: await this.getBalance(userId) + amount,
    };
  }

  static async withdraw(userId: string, amount: number) {
    return {
      success: true,
      balance: Math.max(0, await this.getBalance(userId) - amount),
    };
  }
}