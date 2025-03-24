import { Page } from '@playwright/test';
import { test, expect } from './utils/fixtures';
import { createL1WalletAndAddFunds } from './utils/auth';
import { checkL2BalanceWithRetries, getRandomL2Address } from './utils/utils';
import { CONFIG } from './utils/config';

test.setTimeout(60_000);

let testPage: Page;

test.describe('Deposit L1', () => {
    test.beforeEach(async ({ contextL1, l1ExtensionUrl }) => {
        const page = await contextL1.newPage();
        await createL1WalletAndAddFunds(page, l1ExtensionUrl);

        testPage = await contextL1.newPage();

        await testPage.goto('/');
    });

    test('should successfully process a deposit', async ({ contextL1 }) => {
        const connectButtonId = 'connect-l1-wallet';
        const connectButton = await testPage.waitForSelector(`[data-testid="${connectButtonId}"]`, {
            state: 'visible',
            timeout: 30000,
        });

        await connectButton.click();
        const approveWalletConnectPage = contextL1.waitForEvent('page');
        await testPage.getByText('IOTA Wallet').click();

        const walletPage = await approveWalletConnectPage;
        await walletPage.waitForLoadState();
        await walletPage.getByRole('button', { name: 'Continue' }).click();
        await walletPage.getByRole('button', { name: 'Connect' }).click();

        const toggleManualInput = testPage.getByTestId('toggle-receiver-address-input');
        await expect(toggleManualInput).toBeVisible({
            timeout: 30_000,
        });
        await toggleManualInput.click();

        const addressField = testPage.getByTestId('receive-address');
        await expect(addressField).toBeVisible();
        const l2Address = getRandomL2Address();
        addressField.fill(l2Address);

        const amountField = testPage.getByTestId('bridge-amount');
        await expect(amountField).toBeVisible();
        amountField.fill('5');

        await expect(testPage.getByText('Bridge Assets')).toBeEnabled();
        await testPage.getByText('Bridge Assets').click();

        const approveTransactionPage = await contextL1.waitForEvent('page');
        await approveTransactionPage.waitForLoadState();
        await approveTransactionPage.getByRole('button', { name: 'Approve' }).click();

        const balance = await checkL2BalanceWithRetries(l2Address, CONFIG.L2.rpcUrl);

        expect(balance).toEqual('5.0');
    });
});
