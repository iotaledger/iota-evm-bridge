import { BrowserContext, Page } from '@playwright/test';
import { Ed25519Keypair } from '@iota/iota-sdk/keypairs/ed25519';
import { createL1Wallet, createL2Wallet } from './utils/auth';
import { test, expect } from './utils/fixtures';
import {
    addL1FundsThroughBridgeUI,
    addNetworkToMetaMask,
    checkL1BalanceWithRetries,
    checkL2BalanceWithRetries,
    closeBrowserTabsExceptLast,
    fundL2AddressWithIscClient,
    getRandomL2MnemonicAndAddress,
} from './utils/utils';

const THREE_MINUTES = 180_000;

test.describe('Send MAX amount from L1', () => {
    test.describe.configure({ timeout: THREE_MINUTES });

    let browserL1: BrowserContext;
    let testPageL1: Page;

    test.beforeAll('setup L1 wallet', async ({ contextL1, l1ExtensionUrl }) => {
        test.setTimeout(THREE_MINUTES);

        testPageL1 = await contextL1.newPage();
        await createL1Wallet(testPageL1, l1ExtensionUrl);
        browserL1 = contextL1;

        await testPageL1.goto('/');
    });

    test('should bridge successfully', async () => {
        const connectButtonId = 'connect-l1-wallet';
        const connectButtonL1 = await testPageL1.waitForSelector(
            `[data-testid="${connectButtonId}"]`,
            {
                state: 'visible',
            },
        );

        await connectButtonL1.click();
        const approveWalletConnectPage = browserL1.waitForEvent('page');
        await testPageL1.getByText('IOTA Wallet').click();

        const walletL1Page = await approveWalletConnectPage;
        await walletL1Page.getByRole('button', { name: 'Continue' }).click();
        await walletL1Page.getByRole('button', { name: 'Connect' }).click();

        await addL1FundsThroughBridgeUI(testPageL1, browserL1);

        const { address: addressL2 } = getRandomL2MnemonicAndAddress();

        const toggleManualInput = testPageL1.getByTestId('toggle-receiver-address-input');
        await expect(toggleManualInput).toBeVisible();
        await toggleManualInput.click();

        const addressField = testPageL1.getByTestId('receive-address');
        await expect(addressField).toBeVisible();
        addressField.fill(addressL2);

        await testPageL1.getByText('Max').click();

        const amountField = testPageL1.getByTestId('bridge-amount');
        await expect(amountField).toBeVisible();
        await expect(amountField).toHaveValue('~ 10');

        await expect(testPageL1.getByText('Bridge Assets')).toBeEnabled();
        await testPageL1.getByText('Bridge Assets').click();

        const approveTransactionPage = await browserL1.waitForEvent('page');
        await approveTransactionPage.waitForLoadState();
        await approveTransactionPage.getByRole('button', { name: 'Approve' }).click();

        const balance = await checkL2BalanceWithRetries(addressL2);

        expect(balance).toEqual('9.991288');
    });
});

test.describe('Send MAX amount from L2', () => {
    test.describe.configure({ timeout: THREE_MINUTES });

    let browserL2: BrowserContext;
    let testPageL2: Page;

    test.beforeAll('setup L2 wallet', async ({ contextL2, l2ExtensionUrl }) => {
        test.setTimeout(THREE_MINUTES);

        testPageL2 = await contextL2.newPage();

        const addressL2 = await createL2Wallet(testPageL2, l2ExtensionUrl);

        await fundL2AddressWithIscClient(addressL2, 9);
        await addNetworkToMetaMask(testPageL2);

        const balance = await checkL2BalanceWithRetries(addressL2);
        expect(balance).toEqual('9.0');

        testPageL2 = await contextL2.newPage();
        browserL2 = contextL2;
        closeBrowserTabsExceptLast(browserL2);
        await testPageL2.goto('/');
    });

    test('should bridge successfully', async () => {
        const connectButtonId = 'connect-l2-wallet';
        const connectButtonL2 = await testPageL2.waitForSelector(
            `[data-testid="${connectButtonId}"]`,
            {
                state: 'visible',
            },
        );

        await connectButtonL2.click();

        // Add explicit waiting before clicking the button
        await testPageL2.waitForTimeout(1000);
        const approveWalletL2ConnectDialog = browserL2.waitForEvent('page', { timeout: 30000 });
        // Add logging to help debug
        console.log('Clicked Bridge Assets button, waiting for transaction approval page...');
        await testPageL2.getByTestId(/metamask/).click();

        const pageUrls = browserL2.pages().map((page) => page.url());
        console.log('Open pages:', pageUrls);

        const walletL2Modal = await approveWalletL2ConnectDialog;
        await walletL2Modal.waitForLoadState();
        await walletL2Modal.getByRole('button', { name: 'Connect' }).click();

        const l2WalletConnectedButton = testPageL2.getByRole('button', {
            name: /Dropdown/,
        });

        await expect(l2WalletConnectedButton).toBeVisible();
        const balanceL2Display = l2WalletConnectedButton.getByText('9 IOTA');
        await expect(balanceL2Display).toBeVisible();

        const toggleBridgeDirectionButton = testPageL2.getByTestId('toggle-bridge-direction');
        await expect(toggleBridgeDirectionButton).toBeVisible();
        await toggleBridgeDirectionButton.click();

        const keypair = new Ed25519Keypair();
        const addressL1 = keypair.toIotaAddress();

        const toggleManualInput = testPageL2.getByTestId('toggle-receiver-address-input');
        await expect(toggleManualInput).toBeVisible();
        await toggleManualInput.click();

        const addressField = testPageL2.getByTestId('receive-address');
        await expect(addressField).toBeVisible();
        await addressField.fill(addressL1);

        await testPageL2.waitForTimeout(5000);

        await testPageL2.getByText('Max').click();

        const amountField = testPageL2.getByTestId('bridge-amount');
        await expect(amountField).toBeVisible();
        await expect(amountField).toHaveValue('~ 9');

        await expect(testPageL2.getByText('Bridge Assets')).toBeEnabled();

        const approveTransacionPagePromise = browserL2.waitForEvent('page');
        await testPageL2.getByText('Bridge Assets').click();
        const approveTransactionPage = await approveTransacionPagePromise;

        await approveTransactionPage.getByRole('button', { name: 'Confirm' }).click();

        const l1Balance = await checkL1BalanceWithRetries(addressL1);

        expect(l1Balance).toEqual('8.999966114');
    });
});
