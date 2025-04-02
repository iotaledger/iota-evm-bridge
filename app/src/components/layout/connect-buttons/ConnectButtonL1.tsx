import { Button, ButtonType } from '@iota/apps-ui-kit';
import { ConnectModal, useCurrentAccount, useDisconnectWallet } from '@iota/dapp-kit';
import { shortenHash } from '../../../lib/utils';

export function ConnectButtonL1() {
    const account = useCurrentAccount();
    const { mutate: disconnectWallet } = useDisconnectWallet();

    return !account ? (
        <ConnectModal
            trigger={
                <div>
                    <Button
                        type={ButtonType.Outlined}
                        text="Connect L1 Wallet"
                        testId="connect-l1-wallet"
                    />
                </div>
            }
        />
    ) : (
        <Button
            type={ButtonType.Outlined}
            text={shortenHash(account.address)}
            onClick={() => disconnectWallet()}
        />
    );
}
