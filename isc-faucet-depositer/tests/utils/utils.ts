import { ethers, Wallet, HDNodeWallet, JsonRpcProvider } from 'ethers';
import { Ed25519Keypair } from '@iota/iota-sdk/keypairs/ed25519';
import { CONFIG } from '../config/config';
import { BrowserContext } from '@playwright/test';

export function generate24WordMnemonic() {
    const entropy = ethers.randomBytes(32);
    return ethers.Mnemonic.fromEntropy(entropy).phrase;
}

export function deriveAddressFromMnemonic(mnemonic: string) {
    const keypair = Ed25519Keypair.deriveKeypair(mnemonic);
    const address = keypair.getPublicKey().toIotaAddress();
    return address;
}

export async function checkL2BalanceWithRetries(
    address: string,
    maxRetries = 10,
    delay = 2500,
): Promise<string | null> {
    let balanceEth: string | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            if (!ethers.isAddress(address)) {
                throw new Error('Invalid Ethereum address');
            }

            balanceEth = await getEVMBalanceForAddress(address);
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

export async function getEVMBalanceForAddress(address: string): Promise<string> {
    const provider = new JsonRpcProvider(CONFIG.L2.rpcUrl);
    const balanceWei = await provider.getBalance(address);

    return ethers.formatEther(balanceWei);
}

export function getRandomL2MnemonicAndAddress(): { mnemonic: string; address: string } {
    const mnemonic = Wallet.createRandom().mnemonic;

    if (!mnemonic) {
        throw new Error('Failed to generate mnemonic');
    }

    return {
        mnemonic: mnemonic.phrase,
        address: HDNodeWallet.fromMnemonic(mnemonic, `m/44'/60'/0'/0/0`).address,
    };
}

// Playwright
export async function closeBrowserTabsExceptLast(browserContext: BrowserContext) {
    const pages = browserContext.pages();
    if (pages.length > 1) {
        for (let i = 0; i < pages.length - 1; i++) {
            await pages[i].close();
        }
    }
}

export async function getExtensionUrl(browserContext: BrowserContext): Promise<string> {
    let [background] = browserContext.serviceWorkers();

    if (!background) {
        background = await browserContext.waitForEvent('serviceworker', { timeout: 30000 });
    }

    const extensionId = background.url().split('/')[2];
    return `chrome-extension://${extensionId}/ui.html`;
}
