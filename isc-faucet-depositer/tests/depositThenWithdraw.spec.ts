import { BrowserContext, Page } from '@playwright/test';
import { test, expect } from './utils/fixtures';
import { importL1WalletFromMnemonic, createL2Wallet } from './utils/auth';
import {
    generate24WordMnemonic,
    deriveAddressFromMnemonic,
    checkL2BalanceWithRetries,
    closeBrowserTabsExceptLast,
    getExtensionUrl,
} from './utils/utils';

test.setTimeout(60_000);

test.describe.serial('Deposit then withdraw roundtrip', () => {
    let browserL1: BrowserContext;
    let browserL2: BrowserContext;
    let pageWithL1Wallet: Page;
    let pageWithL2Wallet: Page;
    let addressL1: string | null = null;
    let addressL2: string | null = null;

    test.beforeAll(
        'setup L1/L2 wallets',
        async ({ contextL1, l1ExtensionUrl, contextL2, l2ExtensionUrl }) => {
            const mnemonicL1 = generate24WordMnemonic();

            pageWithL1Wallet = await contextL1.newPage();
            await importL1WalletFromMnemonic(pageWithL1Wallet, l1ExtensionUrl, mnemonicL1);

            addressL1 = deriveAddressFromMnemonic(mnemonicL1);

            pageWithL2Wallet = await contextL2.newPage();
            addressL2 = await createL2Wallet(pageWithL2Wallet, l2ExtensionUrl);

            browserL1 = contextL1;
            browserL2 = contextL2;

            await pageWithL1Wallet.goto('/');
            await pageWithL2Wallet.goto('/');

            closeBrowserTabsExceptLast(browserL1);
            closeBrowserTabsExceptLast(browserL2);
        },
    );

    test('should successfully process an L1 deposit', async () => {
        if (addressL2 === null) {
            throw new Error('L2 address not found');
        }

        const connectButtonId = 'connect-l1-wallet';
        const connectButton = await pageWithL1Wallet.waitForSelector(
            `[data-testid="${connectButtonId}"]`,
            {
                state: 'visible',
            },
        );

        await connectButton.click();
        const approveWalletConnectPage = browserL1.waitForEvent('page');
        await pageWithL1Wallet.getByText('IOTA Wallet').click();

        const walletL1Page = await approveWalletConnectPage;
        await walletL1Page.getByRole('button', { name: 'Continue' }).click();
        await walletL1Page.getByRole('button', { name: 'Connect' }).click();

        // Add funds to L1
        await pageWithL1Wallet.getByTestId('request-l1-funds-button').click();
        await expect(pageWithL1Wallet.getByText('Funds successfully sent.')).toBeVisible();

        // Check the funds arrived (ui)
        const l1WalletExtension = await browserL1.newPage();
        const l1ExtensionUrl = await getExtensionUrl(browserL1);
        await l1WalletExtension.goto(l1ExtensionUrl, { waitUntil: 'commit' });
        await expect(l1WalletExtension.getByTestId('coin-balance')).toHaveText('10', {
            timeout: 15_000,
        });
        l1WalletExtension.close();

        const toggleManualInput = pageWithL1Wallet.getByTestId('toggle-receiver-address-input');
        await expect(toggleManualInput).toBeVisible();
        await toggleManualInput.click();

        const addressField = pageWithL1Wallet.getByTestId('receive-address');
        await expect(addressField).toBeVisible();
        addressField.fill(addressL2);

        const amountField = pageWithL1Wallet.getByTestId('bridge-amount');
        await expect(amountField).toBeVisible();
        amountField.fill('5');

        await expect(pageWithL1Wallet.getByText('Bridge Assets')).toBeEnabled();
        await pageWithL1Wallet.getByText('Bridge Assets').click();

        const approveTransactionPage = await browserL1.waitForEvent('page');
        await approveTransactionPage.waitForLoadState();
        await approveTransactionPage.getByRole('button', { name: 'Approve' }).click();

        const balance = await checkL2BalanceWithRetries(addressL2);

        expect(balance).toEqual('5.0');

        closeBrowserTabsExceptLast(browserL1);
    });

    test('should successfully process an L2 deposit', async () => {
        if (addressL1 === null) {
            throw new Error('L1 address not found');
        }

        const connectButtonId = 'connect-l2-wallet';
        const connectButton = await pageWithL2Wallet.waitForSelector(
            `[data-testid="${connectButtonId}"]`,
            {
                state: 'visible',
            },
        );

        await connectButton.click();
        const approveWalletL2ConnectDialog = browserL2.waitForEvent('page');
        await pageWithL2Wallet.getByTestId(/metamask/).click();

        const walletL2Modal = await approveWalletL2ConnectDialog;
        await walletL2Modal.waitForLoadState('networkidle');
        await walletL2Modal.getByRole('button', { name: 'Connect' }).click();
        await walletL2Modal.waitForLoadState('networkidle');
        await walletL2Modal.getByRole('button', { name: 'Approve' }).click();

        try {
            const retryButton = pageWithL2Wallet.getByText('Retry');
            await retryButton.waitFor({ timeout: 2500 });
            // If first "Connect" attempt fails, retry
            if (retryButton) {
                await retryButton.click();
                const secondAttemptDialog = await browserL2.waitForEvent('page');
                await secondAttemptDialog.waitForLoadState();
                await secondAttemptDialog.getByRole('button', { name: 'Connect' }).click();
                const secondAttemptClosePromise = secondAttemptDialog.waitForEvent('close');
                await secondAttemptClosePromise;
            }
        } catch {
            console.log('No retry button found, continuing test');
        }

        const toggleBridgeDirectionButton = pageWithL2Wallet.getByTestId('toggle-bridge-direction');
        await expect(toggleBridgeDirectionButton).toBeVisible();
        await toggleBridgeDirectionButton.click();

        const amountField = pageWithL2Wallet.getByTestId('bridge-amount');
        await expect(amountField).toBeVisible();
        amountField.fill('2');

        const toggleManualInput = pageWithL2Wallet.getByTestId('toggle-receiver-address-input');
        await expect(toggleManualInput).toBeVisible();
        await toggleManualInput.click();

        const addressField = pageWithL2Wallet.getByTestId('receive-address');
        await expect(addressField).toBeVisible();
        addressField.fill(addressL1);

        await expect(pageWithL2Wallet.getByText('Bridge Assets')).toBeEnabled();
        await pageWithL2Wallet.getByText('Bridge Assets').click();
        const approveTransactionPage = await browserL2.waitForEvent('page');
        await approveTransactionPage.getByRole('button', { name: 'Confirm' }).click();

        // Check funds on L1 wallet
        pageWithL1Wallet = await browserL1.newPage();
        const l1ExtensionUrl = await getExtensionUrl(browserL1);
        await pageWithL1Wallet.goto(l1ExtensionUrl, { waitUntil: 'commit' });

        await expect(pageWithL1Wallet.getByTestId('coin-balance')).toHaveText('6.99', {
            timeout: 15_000,
        });
    });
});
