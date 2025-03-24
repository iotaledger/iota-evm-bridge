import { ethers, Wallet } from 'ethers';
import crypto from 'crypto';

export function getRandomL2Address(): string {
    const id = crypto.randomBytes(32).toString('hex');
    const privateKey = '0x' + id;
    const wallet = new Wallet(privateKey);

    return wallet.address;
}

export async function checkL2BalanceWithRetries(
    address: string,
    rpcUrl: string,
    maxRetries = 10,
    delay = 2500,
): Promise<string | null> {
    let balanceEth: string | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const provider = new ethers.JsonRpcProvider(rpcUrl);

            if (!ethers.isAddress(address)) {
                throw new Error('Invalid Ethereum address');
            }

            const balanceWei = await provider.getBalance(address);
            balanceEth = ethers.formatEther(balanceWei);
        } catch (error) {
            console.error('Error checking balance:', error);
        } finally {
            if (balanceEth === '0.0' && attempt < maxRetries) {
                console.log(
                    `Fetching L2 balance attempt ${attempt + 1} out of ${maxRetries} in ${delay} ms`,
                );
                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }
    }

    return balanceEth;
}
