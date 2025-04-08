import { BrowserContext, Page } from '@playwright/test';
import { Ed25519Keypair } from '@iota/iota-sdk/keypairs/ed25519';
import { createL1Wallet, createL2Wallet } from './utils/auth';
import { test, expect } from './utils/fixtures';
import {
    addL1FundsThroughBridgeUI,
    addNetworkToMetaMask,
    checkL1BalanceWithRetries,
    checkL2BalanceWithRetries,
    fundL2AddressWithIscClient,
    getRandomL2MnemonicAndAddress,
} from './utils/utils';

test.describe('Send MAX amount from L1', () => {
    let browser: BrowserContext;
    let testPage: Page;

    test.beforeAll('setup L1 wallet', async ({ contextL1, l1ExtensionUrl }) => {
        testPage = await contextL1.newPage();
        await createL1Wallet(testPage, l1ExtensionUrl);
        browser = contextL1;
    });

    test('should bridge successfully', async () => {
        await testPage.goto('/');

        await addL1FundsThroughBridgeUI(testPage, browser);

        const { address: addressL2 } = getRandomL2MnemonicAndAddress();

        const toggleManualInput = testPage.getByTestId('toggle-receiver-address-input');
        await expect(toggleManualInput).toBeVisible();
        await toggleManualInput.click();

        const addressField = testPage.getByTestId('receive-address');
        await expect(addressField).toBeVisible();
        addressField.fill(addressL2);

        await testPage.getByText('Max').click();

        const amountField = testPage.getByTestId('bridge-amount');
        await expect(amountField).toBeVisible();
        await expect(amountField).toHaveValue('~ 10');

        await expect(testPage.getByText('Bridge Assets')).toBeEnabled();
        await testPage.getByText('Bridge Assets').click();

        const approveTransactionPage = await browser.waitForEvent('page');
        await approveTransactionPage.waitForLoadState();
        await approveTransactionPage.getByRole('button', { name: 'Approve' }).click();

        const balance = await checkL2BalanceWithRetries(addressL2);

        expect(balance).toEqual('9.9913032');
    });
});

test.describe('Send MAX amount from L2', () => {
    let browser: BrowserContext;
    let testPage: Page;

    test.beforeAll('setup L2 wallet', async ({ contextL2, l2ExtensionUrl }) => {
        testPage = await contextL2.newPage();
        browser = contextL2;

        const addressL2 = await createL2Wallet(testPage, l2ExtensionUrl);
        await addNetworkToMetaMask(testPage);

        await fundL2AddressWithIscClient(addressL2, 9);

        const balance = await checkL2BalanceWithRetries(addressL2);
        expect(balance).toEqual('9.0');
    });

    test('should bridge successfully', async () => {
        await testPage.goto('/');

        const connectButtonId = 'connect-l2-wallet';
        const connectButtonL2 = await testPage.waitForSelector(
            `[data-testid="${connectButtonId}"]`,
            {
                state: 'visible',
            },
        );

        await connectButtonL2.click();
        const approveWalletL2ConnectDialog = browser.waitForEvent('page');
        await testPage.getByTestId(/metamask/).click();

        const walletL2Modal = await approveWalletL2ConnectDialog;
        await walletL2Modal.waitForLoadState();
        await walletL2Modal.getByRole('button', { name: 'Connect' }).click();

        const l2WalletConnectedButton = testPage.getByRole('button', {
            name: /Dropdown/,
        });

        await expect(l2WalletConnectedButton).toBeVisible();
        const balanceL2Display = l2WalletConnectedButton.getByText('9 IOTA');
        expect(balanceL2Display).toBeVisible();

        const toggleBridgeDirectionButton = testPage.getByTestId('toggle-bridge-direction');
        await expect(toggleBridgeDirectionButton).toBeVisible();
        await toggleBridgeDirectionButton.click();

        const keypair = new Ed25519Keypair();
        const addressL1 = keypair.toIotaAddress();

        const toggleManualInput = testPage.getByTestId('toggle-receiver-address-input');
        await expect(toggleManualInput).toBeVisible();
        await toggleManualInput.click();

        const addressField = testPage.getByTestId('receive-address');
        await expect(addressField).toBeVisible();
        await addressField.fill(addressL1);

        await testPage.waitForTimeout(2500);

        await testPage.getByText('Max').click();

        const amountField = testPage.getByTestId('bridge-amount');
        await expect(amountField).toBeVisible();
        await expect(amountField).toHaveValue('~ 9');

        await expect(testPage.getByText('Bridge Assets')).toBeEnabled();
        await testPage.getByText('Bridge Assets').click();
        const approveTransactionPage = await browser.waitForEvent('page');
        await approveTransactionPage.getByRole('button', { name: 'Confirm' }).click();

        const l1Balance = await checkL1BalanceWithRetries(addressL1);

        expect(l1Balance).toEqual('8.999966102');
    });
});
