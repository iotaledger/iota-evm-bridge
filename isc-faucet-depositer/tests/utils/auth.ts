import { Page } from '@playwright/test';
import { expect } from './fixtures';
import { CONFIG } from './config';

const WALLET_CUSTOMRPC_PLACEHOLDER = 'http://localhost:3000/';

export async function createL1WalletAndAddFunds(page: Page, l1ExtensionUrl: string) {
    await page.goto(l1ExtensionUrl);
    await page.getByRole('button', { name: /Add Profile/ }).click();
    await page.getByText('Create New').click();
    await page.getByTestId('password.input').fill('iotae2etests');
    await page.getByTestId('password.confirmation').fill('iotae2etests');
    await page.getByText('I read and agree').click();
    await page.getByRole('button', { name: /Create Wallet/ }).click();
    await page.getByText('I saved my mnemonic').click();
    await page.getByRole('button', { name: /Open Wallet/ }).click();

    // We need to switch the network to alphanet (custom RPC) before requesting
    await page.getByLabel(/Open settings menu/).click();
    await page.getByText(/Network/).click();
    await page.getByText(/Custom RPC/).click();
    await page.getByPlaceholder(WALLET_CUSTOMRPC_PLACEHOLDER).fill(CONFIG.L1.rpcUrl);
    await page.getByText(/Save/).click();
    await page.getByTestId('close-icon').click();

    // Copy address to clipboard
    await page
        .locator('button.appearance-none.opacity-0.group-hover\\:opacity-100')
        .first()
        .click();
    const addressFromClipboard = await page.evaluate(() => navigator.clipboard.readText());
    await useAlphanetFaucet(addressFromClipboard);

    await expect(page.getByTestId('coin-balance')).not.toHaveText('0', { timeout: 30000 });
}

async function useAlphanetFaucet(address: string) {
    const url = CONFIG.L1.faucetUrl;

    const payload = {
        FixedAmountRequest: {
            recipient: address,
        },
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}
