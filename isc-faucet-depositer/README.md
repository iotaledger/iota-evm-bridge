# Test (Playwright)

Wallet extension build files should be downloaded into ./wallet-dist-L1 and ./wallet-dist-L2 for e2e tests to run. For this you can use:

`pnpm run test:prepare`

this command required a `GITHUB_TOKEN` set in the `.env` file or specified before the command.

To generate the github token go to Your github profile > Settings > Developer Settings > Personal access token > Fine-grained tokens,
then generate a new token with 'iotaledger' resource owner, 'Only selected repositories' (iota) repository access, and in repository permissions
set 'Actions' to 'read-only'.

To run the e2e tests (it also run all the services before running the tests, if they are not already running):

`pnpm run test:e2e`
