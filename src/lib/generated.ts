import { bcs } from '@iota/bcs';

export const CoinType = bcs.string();

export const getMinCommonAccountBalanceOutputs = bcs.struct('getMinCommonAccountBalanceOutputs', {
	minimumAccountBalance: bcs.u64()
});

export const IscAddressAgentID = bcs.struct('IscAddressAgentID', {
	a: bcs.fixedArray(32, bcs.u8())
});

export const IscContractAgentID = bcs.struct('IscContractAgentID', {
	chainID: bcs.fixedArray(32, bcs.u8()),
	hname: bcs.u32()
});

export const IscEthereumAddressAgentID = bcs.struct('IscEthereumAddressAgentID', {
	chainID: bcs.fixedArray(32, bcs.u8()),
	eth: bcs.fixedArray(20, bcs.u8())
});

export const IscNilAgentID = bcs.struct('IscNilAgentID', {

});

export const IscAgentID = bcs.enum('IscAgentID', {
	NoType: null,
	AddressAgentID: IscAddressAgentID,
	ContractAgentID: IscContractAgentID,
	EthereumAddressAgentID: IscEthereumAddressAgentID,
	NilAgentID: IscNilAgentID
});

export const getChainOwnerOutputs = bcs.struct('getChainOwnerOutputs', {
	chainOwnerAgentID: IscAgentID
});

export const AtomicnoCopy = bcs.struct('AtomicnoCopy', {

});


export const IscAssets = bcs.struct('IscAssets', {
	coins: bcs.map(CoinType, bcs.u64()),
	//objects: bcs.map(bcs.fixedArray(32, bcs.u8()), )
});


export const CryptolibPublicKey = bcs.struct('CryptolibPublicKey', {
	key: bcs.vector(bcs.u8())
});

export const GovernanceAccessNodeData = bcs.struct('GovernanceAccessNodeData', {
	validatorAddr: bcs.fixedArray(32, bcs.u8()),
	certificate: bcs.vector(bcs.u8()),
	forCommittee: bcs.bool(),
	accessAPI: bcs.string()
});

export const GovernanceAccessNodeInfo = bcs.struct('GovernanceAccessNodeInfo', {
	nodePubKey: CryptolibPublicKey,
	accessNodeData: GovernanceAccessNodeData
});

export const getRequestIDsForBlockInputs = bcs.struct('getRequestIDsForBlockInputs', {
	blockIndex: bcs.option(bcs.u32())
});

export const getRequestIDsForBlockOutputs = bcs.struct('getRequestIDsForBlockOutputs', {
	blockIndex: bcs.u32(),
	requestIDsInBlock: bcs.vector(bcs.fixedArray(32, bcs.u8()))
});

export const isRequestProcessedInputs = bcs.struct('isRequestProcessedInputs', {
	requestID: bcs.fixedArray(32, bcs.u8())
});

export const isRequestProcessedOutputs = bcs.struct('isRequestProcessedOutputs', {
	isProcessed: bcs.bool()
});

export const IscPublicChainMetadata = bcs.struct('IscPublicChainMetadata', {
	eVMJsonRPCURL: bcs.string(),
	eVMWebSocketURL: bcs.string(),
	name: bcs.string(),
	description: bcs.string(),
	website: bcs.string()
});

export const setMetadataInputs = bcs.struct('setMetadataInputs', {
	publicURL: bcs.option(bcs.string()),
	metadata: bcs.option(IscPublicChainMetadata)
});

export const balanceBaseTokenInputs = bcs.struct('balanceBaseTokenInputs', {
	agentID: bcs.option(IscAgentID)
});

export const balanceBaseTokenOutputs = bcs.struct('balanceBaseTokenOutputs', {
	baseTokenBalance: bcs.u64()
});

export const registerERC721NFTCollectionInputs = bcs.struct('registerERC721NFTCollectionInputs', {
	collectionID: bcs.fixedArray(32, bcs.u8())
});

export const incAndRepeatManyInputs = bcs.struct('incAndRepeatManyInputs', {
	value: bcs.option(bcs.bytes(8)),
	nTimes: bcs.option(bcs.bytes(8))
});


export const BlocklogOutputRequestReceipt = bcs.struct('BlocklogOutputRequestReceipt', {

});

export const IscVMErrorParam = bcs.enum('IscVMErrorParam', {
	NoType: null,
	uint64: bcs.u64(),
	string: bcs.string(),
	int32: bcs.bytes(4),
	uint8: bcs.u8(),
	uint16: bcs.u16(),
	uint32: bcs.u32(),
	int16: bcs.bytes(2),
	int64: bcs.bytes(8)
});

export const UtilRatio32 = bcs.struct('UtilRatio32', {
	a: bcs.u32(),
	b: bcs.u32()
});

export const GasFeePolicy = bcs.struct('GasFeePolicy', {
	eVMGasRatio: UtilRatio32,
	gasPerToken: UtilRatio32,
	validatorFeeShare: bcs.u8()
});

export const objectBCSInputs = bcs.struct('objectBCSInputs', {
	objectID: bcs.fixedArray(32, bcs.u8())
});

export const objectBCSOutputs = bcs.struct('objectBCSOutputs', {
	bcsEncodedBytes: bcs.vector(bcs.u8())
});

export const getEVMGasRatioOutputs = bcs.struct('getEVMGasRatioOutputs', {
	evmGasRatio: UtilRatio32
});

export const IscVMErrorCode = bcs.struct('IscVMErrorCode', {
	contractID: bcs.u32(),
	iD: bcs.u16()
});

export const getAllowedStateControllerAddressesOutputs = bcs.struct('getAllowedStateControllerAddressesOutputs', {
	stateControllerAddresses: bcs.vector(bcs.fixedArray(32, bcs.u8()))
});

export const RootContractRecord = bcs.struct('RootContractRecord', {
	name: bcs.string()
});

export const findContractInputs = bcs.struct('findContractInputs', {
	contractHName: bcs.u32()
});

export const findContractOutputs = bcs.struct('findContractOutputs', {
	exists: bcs.bool(),
	contractRecord: bcs.option(RootContractRecord)
});



export const totalAssetsOutputs = bcs.struct('totalAssetsOutputs', {
	coinBalances: bcs.map(CoinType, bcs.u64())
});

export const IotagoObjectRef = bcs.struct('IotagoObjectRef', {
	objectID: bcs.fixedArray(32, bcs.u8()),
	version: bcs.u64(),
	digest: bcs.vector(bcs.u8())
});

export const IscmoveAssetsBag = bcs.struct('IscmoveAssetsBag', {
	iD: bcs.fixedArray(32, bcs.u8()),
	size: bcs.u64()
});

export const IscmoveAnchor = bcs.struct('IscmoveAnchor', {
	iD: bcs.fixedArray(32, bcs.u8()),
	assets: IscmoveAssetsBag,
	stateMetadata: bcs.vector(bcs.u8()),
	stateIndex: bcs.u32()
});

export const IscmoveRefWithObject_Anchor = bcs.struct('IscmoveRefWithObject_Anchor', {
	objectRef: IotagoObjectRef,
	object: IscmoveAnchor,
	owner: bcs.fixedArray(32, bcs.u8())
});


export const balanceBaseTokenEVMInputs = bcs.struct('balanceBaseTokenEVMInputs', {
	agentID: bcs.option(IscAgentID)
});

export const balanceBaseTokenEVMOutputs = bcs.struct('balanceBaseTokenEVMOutputs', {
	evmBaseTokenBalance: bcs.u256()
});

export const GasBurnRecord = bcs.struct('GasBurnRecord', {
	code: bcs.u16(),
	gasBurned: bcs.u64()
});

export const GasBurnLog = bcs.struct('GasBurnLog', {
	records: bcs.vector(GasBurnRecord)
});

export const TypesAccessTuple = bcs.struct('TypesAccessTuple', {
	address: bcs.fixedArray(20, bcs.u8()),
	storageKeys: bcs.vector(bcs.fixedArray(32, bcs.u8()))
});

export const setEVMGasRatioInputs = bcs.struct('setEVMGasRatioInputs', {
	evmGasRatio: UtilRatio32
});

export const GasLimits = bcs.struct('GasLimits', {
	maxGasPerBlock: bcs.u64(),
	minGasPerRequest: bcs.u64(),
	maxGasPerRequest: bcs.u64(),
	maxGasExternalViewCall: bcs.u64()
});

export const addCandidateNodeInputs = bcs.struct('addCandidateNodeInputs', {
	nodePublicKey: CryptolibPublicKey,
	nodeCertificate: bcs.vector(bcs.u8()),
	nodeAccessAPI: bcs.string(),
	isCommittee: bcs.bool()
});

export const getCounterOutputs = bcs.struct('getCounterOutputs', {
	counter: bcs.bytes(8)
});

export const getRequestReceiptInputs = bcs.struct('getRequestReceiptInputs', {
	requestID: bcs.fixedArray(32, bcs.u8())
});

export const getRequestReceiptOutputs = bcs.struct('getRequestReceiptOutputs', {
	requestReceipt: BlocklogOutputRequestReceipt
});

export const CryptolibSignature = bcs.struct('CryptolibSignature', {
	signatureScheme: bcs.u8(),
	publicKey: CryptolibPublicKey,
	signature: bcs.fixedArray(64, bcs.u8())
});

export const Go_ethereumCallMsg = bcs.struct('Go_ethereumCallMsg', {
	from: bcs.fixedArray(20, bcs.u8()),
	to: bcs.fixedArray(20, bcs.u8()),
	gas: bcs.u64(),
	gasPrice: bcs.u256(),
	gasFeeCap: bcs.u256(),
	gasTipCap: bcs.u256(),
	value: bcs.u256(),
	data: bcs.vector(bcs.u8()),
	accessList: bcs.vector(TypesAccessTuple),
	blobGasFeeCap: bcs.u256(),
	blobHashes: bcs.vector(bcs.fixedArray(32, bcs.u8()))
});

export const IscevmOffLedgerCallRequest = bcs.struct('IscevmOffLedgerCallRequest', {
	chainID: bcs.fixedArray(32, bcs.u8()),
	callMsg: Go_ethereumCallMsg
});

export const IscCallTarget = bcs.struct('IscCallTarget', {
	contract: bcs.u32(),
	entryPoint: bcs.u32()
});

export const IscMessage = bcs.struct('IscMessage', {
	target: IscCallTarget,
	params: bcs.vector(bcs.vector(bcs.u8()))
});

export const IscOffLedgerRequestDataEssence = bcs.struct('IscOffLedgerRequestDataEssence', {
	allowance: IscAssets,
	chainID: bcs.fixedArray(32, bcs.u8()),
	msg: IscMessage,
	gasBudget: bcs.u64(),
	nonce: bcs.u64()
});

export const IscOffLedgerRequestData = bcs.struct('IscOffLedgerRequestData', {
	offLedgerRequestDataEssence: IscOffLedgerRequestDataEssence,
	signature: CryptolibSignature
});

export const IscevmOffLedgerTxRequest = bcs.struct('IscevmOffLedgerTxRequest', {
	chainID: bcs.fixedArray(32, bcs.u8()),
	//tx: TypesTransaction,
	sender: IscEthereumAddressAgentID
});

export const IscRequest = bcs.enum('IscRequest', {
	NoType: null,
	OffLedgerRequestData: IscOffLedgerRequestData,
	evmOffLedgerTxRequest: IscevmOffLedgerTxRequest,
	evmOffLedgerCallRequest: IscevmOffLedgerCallRequest
});

export const IscUnresolvedVMError = bcs.struct('IscUnresolvedVMError', {
	errorCode: IscVMErrorCode,
	params: bcs.vector(IscVMErrorParam)
});

export const BlocklogRequestReceipt = bcs.struct('BlocklogRequestReceipt', {
	request: IscRequest,
	error: IscUnresolvedVMError,
	gasBudget: bcs.u64(),
	gasBurned: bcs.u64(),
	gasFeeCharged: bcs.u64(),
	gasBurnLog: GasBurnLog,
	blockIndex: bcs.u32(),
	requestIndex: bcs.u16()
});

export const removeAllowedStateControllerAddressInputs = bcs.struct('removeAllowedStateControllerAddressInputs', {
	stateControllerAddress: bcs.fixedArray(32, bcs.u8())
});

export const setPayoutAgentIDInputs = bcs.struct('setPayoutAgentIDInputs', {
	payoutAgentID: IscAgentID
});

export const balanceCoinInputs = bcs.struct('balanceCoinInputs', {
	agentID: bcs.option(IscAgentID),
	coinType: CoinType
});

export const balanceCoinOutputs = bcs.struct('balanceCoinOutputs', {
	coinBalance: bcs.u64()
});

export const IscStateAnchor = bcs.struct('IscStateAnchor', {
	anchor: IscmoveRefWithObject_Anchor,
	iscPackage: bcs.fixedArray(32, bcs.u8())
});

export const BlocklogBlockInfo = bcs.struct('BlocklogBlockInfo', {
	schemaVersion: bcs.u8(),
	blockIndex: bcs.u32(),
	timestamp: bcs.u64(),
	previousAnchor: IscStateAnchor,
	totalRequests: bcs.u16(),
	numSuccessfulRequests: bcs.u16(),
	numOffLedgerRequests: bcs.u16(),
	gasBurned: bcs.u64(),
	gasFeeCharged: bcs.u64()
});

export const getBlockInfoInputs = bcs.struct('getBlockInfoInputs', {
	blockIndex: bcs.option(bcs.u32())
});

export const getBlockInfoOutputs = bcs.struct('getBlockInfoOutputs', {
	blockIndex: bcs.u32(),
	blockInfo: BlocklogBlockInfo
});

export const IscChainInfo = bcs.struct('IscChainInfo', {
	chainID: bcs.fixedArray(32, bcs.u8()),
	chainOwnerID: IscAgentID,
	gasFeePolicy: GasFeePolicy,
	gasLimits: GasLimits,
	blockKeepAmount: bcs.bytes(4),
	publicURL: bcs.string(),
	metadata: IscPublicChainMetadata
});

export const transferAllowanceToInputs = bcs.struct('transferAllowanceToInputs', {
	agentID: IscAgentID
});

export const getMetadataOutputs = bcs.struct('getMetadataOutputs', {
	publicURL: bcs.string(),
	metadata: IscPublicChainMetadata
});

export const accountObjectsInCollectionInputs = bcs.struct('accountObjectsInCollectionInputs', {
	agentID: bcs.option(IscAgentID),
	collectionID: bcs.fixedArray(32, bcs.u8())
});

export const accountObjectsInCollectionOutputs = bcs.struct('accountObjectsInCollectionOutputs', {
	accountObjects: bcs.vector(bcs.fixedArray(32, bcs.u8()))
});



export const getGasLimitsOutputs = bcs.struct('getGasLimitsOutputs', {
	gasLimits: GasLimits
});

export const balanceInputs = bcs.struct('balanceInputs', {
	agentID: bcs.option(IscAgentID)
});

export const balanceOutputs = bcs.struct('balanceOutputs', {
	coinBalances: bcs.map(CoinType, bcs.u64())
});

export const getAccountNonceInputs = bcs.struct('getAccountNonceInputs', {
	agentID: bcs.option(IscAgentID)
});

export const getAccountNonceOutputs = bcs.struct('getAccountNonceOutputs', {
	nonce: bcs.u64()
});

export const getChainInfoOutputs = bcs.struct('getChainInfoOutputs', {
	chainInfo: IscChainInfo
});

export const getEventsForRequestInputs = bcs.struct('getEventsForRequestInputs', {
	requestID: bcs.fixedArray(32, bcs.u8())
});

export const IscEvent = bcs.struct('IscEvent', {
	contractID: bcs.u32(),
	topic: bcs.string(),
	timestamp: bcs.u64(),
	payload: bcs.vector(bcs.u8())
});

export const getEventsForRequestOutputs = bcs.struct('getEventsForRequestOutputs', {
	events: bcs.vector(IscEvent)
});

export const newL1DepositInputs = bcs.struct('newL1DepositInputs', {
	l1DepositOriginatorAgentID: IscAgentID,
	targetAddress: bcs.fixedArray(20, bcs.u8()),
	assets: IscAssets
});

export const transferAccountToChainInputs = bcs.struct('transferAccountToChainInputs', {
	optionalGasReserve: bcs.option(bcs.u64())
});

export const setMinCommonAccountBalanceInputs = bcs.struct('setMinCommonAccountBalanceInputs', {
	minimumAccountBalance: bcs.u64()
});

export const accountObjectsInputs = bcs.struct('accountObjectsInputs', {
	agentID: bcs.option(IscAgentID)
});

export const accountObjectsOutputs = bcs.struct('accountObjectsOutputs', {
	accountObjects: bcs.vector(bcs.fixedArray(32, bcs.u8()))
});

export const getErrorMessageFormatInputs = bcs.struct('getErrorMessageFormatInputs', {
	vmErrorCode: IscVMErrorCode
});

export const getErrorMessageFormatOutputs = bcs.struct('getErrorMessageFormatOutputs', {
	errorMessageFormat: bcs.string()
});

export const setFeePolicyInputs = bcs.struct('setFeePolicyInputs', {
	feePolicy: GasFeePolicy
});



export const getPayoutAgentIDOutputs = bcs.struct('getPayoutAgentIDOutputs', {
	payoutAgentID: IscAgentID
});

export const getChainNodesOutputs = bcs.struct('getChainNodesOutputs', {
	accessNodeInfo: bcs.vector(GovernanceAccessNodeInfo),
	nodePublicKey: bcs.vector(CryptolibPublicKey)
});

export const incCounterInputs = bcs.struct('incCounterInputs', {
	value: bcs.option(bcs.bytes(8))
});

export const registerErrorInputs = bcs.struct('registerErrorInputs', {
	errorMessageFormat: bcs.string()
});

export const registerErrorOutputs = bcs.struct('registerErrorOutputs', {
	vmErrorCode: IscVMErrorCode
});

export const BlocklogRequestReceiptsResponse = bcs.struct('BlocklogRequestReceiptsResponse', {
	blockIndex: bcs.u32(),
	receipts: bcs.vector(BlocklogRequestReceipt)
});

export const LoTuple2_PublicKey_ChangeAccessNodeAction = bcs.struct('LoTuple2_PublicKey_ChangeAccessNodeAction', {
	a: CryptolibPublicKey,
	b: bcs.u8()
});

export const callContractInputs = bcs.struct('callContractInputs', {
	callMessage: Go_ethereumCallMsg
});

export const callContractOutputs = bcs.struct('callContractOutputs', {
	functionResult: bcs.vector(bcs.u8())
});

export const rotateStateControllerInputs = bcs.struct('rotateStateControllerInputs', {
	newStateControllerAddr: bcs.fixedArray(32, bcs.u8())
});

export const setGasLimitsInputs = bcs.struct('setGasLimitsInputs', {
	gasLimits: GasLimits
});

export const getRequestReceiptsForBlockInputs = bcs.struct('getRequestReceiptsForBlockInputs', {
	blockIndex: bcs.option(bcs.u32())
});

export const getRequestReceiptsForBlockOutputs = bcs.struct('getRequestReceiptsForBlockOutputs', {
	requestReceipts: BlocklogRequestReceiptsResponse
});

export const getEventsForBlockInputs = bcs.struct('getEventsForBlockInputs', {
	blockIndex: bcs.option(bcs.u32())
});

export const getEventsForBlockOutputs = bcs.struct('getEventsForBlockOutputs', {
	blockIndex: bcs.u32(),
	events: bcs.vector(IscEvent)
});

export const getChainIDOutputs = bcs.struct('getChainIDOutputs', {
	chainID: bcs.u16()
});

export const delegateChainOwnershipInputs = bcs.struct('delegateChainOwnershipInputs', {
	ownerAgentID: IscAgentID
});

export const getFeePolicyOutputs = bcs.struct('getFeePolicyOutputs', {
	feePolicy: GasFeePolicy
});

export const getMaintenanceStatusOutputs = bcs.struct('getMaintenanceStatusOutputs', {
	isMaintenance: bcs.bool()
});

export const LoTuple2_Hname_ContractRecord = bcs.struct('LoTuple2_Hname_ContractRecord', {
	a: bcs.u32(),
	b: RootContractRecord
});

export const revokeAccessNodeInputs = bcs.struct('revokeAccessNodeInputs', {
	nodePublicKey: CryptolibPublicKey,
	certificate: bcs.vector(bcs.u8())
});

export const registerERC20CoinInputs = bcs.struct('registerERC20CoinInputs', {
	coinType: CoinType
});

export const addAllowedStateControllerAddressInputs = bcs.struct('addAllowedStateControllerAddressInputs', {
	stateControllerAddress: bcs.fixedArray(32, bcs.u8())
});

export const CORE_CONTRACT_ACCOUNTS  = 0x3c4b5e02;
export const ACCOUNTS_TRANSFER_ALLOWANCE_TO = 0x23f4e3a1;