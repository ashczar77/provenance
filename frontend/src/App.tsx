import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import './App.css';

const CONTRACT_ABI = [
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "owner", "type": "address" },
      { "internalType": "uint256", "name": "index", "type": "uint256" }
    ],
    "name": "tokenOfOwnerByIndex",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "index", "type": "uint256" }],
    "name": "tokenByIndex",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
    "name": "tokenURI",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
    "name": "ownerOf",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
    "name": "getName",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
    "name": "getSerialNumber",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
    "name": "getOwnershipHistory",
    "outputs": [{ "internalType": "address[]", "name": "", "type": "address[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "from", "type": "address" },
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "uint256", "name": "tokenId", "type": "uint256" }
    ],
    "name": "safeTransferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "string", "name": "uri", "type": "string" },
      { "internalType": "string", "name": "name", "type": "string" },
      { "internalType": "string", "name": "serialNumber", "type": "string" }
    ],
    "name": "safeMint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

const CONTRACT_ADDRESS = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';

function DeedCard({ tokenId, onUpdate }: { tokenId: bigint, onUpdate?: () => void }) {
  const { address } = useAccount();
  const [recipient, setRecipient] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const { data: uri, isLoading: isUriLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'tokenURI',
    args: [tokenId],
  });

  const { data: name, isLoading: isNameLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getName',
    args: [tokenId],
  });

  const { data: serial, isLoading: isSerialLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getSerialNumber',
    args: [tokenId],
  });

  const { data: owner } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'ownerOf',
    args: [tokenId],
  });

  const { data: history } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getOwnershipHistory',
    args: [tokenId],
  });

  const { writeContract, data: hash, isPending, isError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const isOwner = address && owner && address.toLowerCase() === (owner as string).toLowerCase();

  useEffect(() => {
    if (isError) {
      toast.error('Transfer failed');
      setIsTransferring(false);
    }
  }, [isError]);

  useEffect(() => {
    if (isSuccess) {
      toast.success('Deed transferred!');
      setIsTransferring(false);
      setRecipient('');
      if (onUpdate) onUpdate();
    }
  }, [isSuccess, onUpdate]);

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !recipient) return;

    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'safeTransferFrom',
      args: [address, recipient as `0x${string}`, tokenId],
    });
  };

  const isLoading = isUriLoading || isSerialLoading || isNameLoading;

  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-blue-500 transition-all hover:shadow-2xl hover:shadow-blue-500/10 group flex flex-col">
      <div className="h-40 bg-gray-700/50 flex items-center justify-center relative overflow-hidden shrink-0">
        {isLoading ? (
          <div className="animate-pulse flex flex-col items-center">
             <div className="h-4 w-48 bg-gray-600 rounded mb-2"></div>
             <div className="h-3 w-32 bg-gray-600 rounded"></div>
          </div>
        ) : uri ? (
          <span className="text-gray-400 text-[10px] break-all p-4 text-center z-10 font-mono opacity-50 group-hover:opacity-100 transition-opacity">
            {uri}
          </span>
        ) : (
          <span className="text-gray-500 italic">No Metadata</span>
        )}
        <div className="absolute top-3 right-3 bg-blue-600/80 backdrop-blur-sm text-[10px] px-2 py-0.5 rounded-full font-bold border border-blue-400/50 shadow-sm">
          #{tokenId.toString()}
        </div>
      </div>
      <div className="p-4 bg-gradient-to-b from-gray-800 to-gray-800/50 flex-1 flex flex-col">
        <h3 className="font-bold text-blue-400 text-sm tracking-tight uppercase truncate">
          {name || 'Digital Deed'}
        </h3>
        
        <div className="mt-3 space-y-3">
          <div className="space-y-1">
            <p className="text-[9px] uppercase text-gray-500 font-bold tracking-widest">Physical Serial</p>
            <p className="text-xs font-mono text-white bg-gray-950/50 px-2 py-1.5 rounded border border-gray-700/50 shadow-inner group-hover:border-blue-500/30 transition-colors">
              {serial || '...'}
            </p>
          </div>
          
          <div className="space-y-1">
            <p className="text-[9px] uppercase text-gray-500 font-bold tracking-widest">Current Owner</p>
            <p className="text-[10px] font-mono text-gray-300 truncate bg-gray-900/40 px-2 py-1 rounded">
              {owner ? (isOwner ? 'You' : owner as string) : '...'}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className="text-[10px] uppercase font-bold text-blue-500/70 hover:text-blue-400 transition-colors flex items-center gap-1"
          >
            {showHistory ? 'Hide History' : 'View Provenance History'}
          </button>

          {showHistory && (
            <div className="bg-gray-950/50 rounded-lg p-3 border border-gray-700/30 space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
              {history && (history as string[]).map((addr, i) => (
                <div key={i} className="flex items-center gap-2 text-[9px] font-mono">
                  <span className="text-gray-600">[{i}]</span>
                  <span className={i === (history as string[]).length - 1 ? "text-blue-400 font-bold" : "text-gray-400"}>
                    {addr === address ? 'You' : `${addr.slice(0, 6)}...${addr.slice(-4)}`}
                  </span>
                  {i === (history as string[]).length - 1 && (
                    <span className="text-[8px] bg-blue-500/20 text-blue-400 px-1 rounded">CURRENT</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {isOwner && (
          <div className="mt-auto pt-4 border-t border-gray-700/50">
            {isTransferring ? (
              <form onSubmit={handleTransfer} className="space-y-2">
                <input 
                  type="text" 
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="Recipient Address (0x...)"
                  className="w-full bg-gray-950 text-[10px] p-2 rounded border border-gray-700 focus:ring-1 focus:ring-blue-500 outline-none font-mono"
                  disabled={isPending || isConfirming}
                />
                <div className="flex gap-2">
                  <button 
                    type="submit"
                    disabled={isPending || isConfirming}
                    className="flex-1 bg-blue-600 text-[10px] font-bold py-1.5 rounded disabled:opacity-50"
                  >
                    {isPending ? 'Signing...' : isConfirming ? 'Confirming...' : 'Send'}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setIsTransferring(false)}
                    className="px-3 bg-gray-700 text-[10px] font-bold py-1.5 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button 
                onClick={() => setIsTransferring(true)}
                className="w-full bg-gray-700 hover:bg-blue-600/20 hover:text-blue-400 text-[10px] font-bold py-2 rounded transition-all flex items-center justify-center gap-2"
              >
                Transfer Deed
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function DeedIdFetcherWrapper({ index, owner, onUpdate }: { index: number, owner: `0x${string}`, onUpdate: () => void }) {
  const { data: tokenId } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'tokenOfOwnerByIndex',
    args: [owner, BigInt(index)],
  });

  if (tokenId === undefined) return null;
  return <DeedCard tokenId={tokenId as bigint} onUpdate={onUpdate} />;
}

function App() {
  const { isConnected, address } = useAccount();
  const [imageUri, setImageUri] = useState('');
  const [name, setName] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [view, setView] = useState<'all' | 'mine'>('all');

  const { data: totalSupply, refetch: refetchTotal } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'totalSupply',
  });

  const { data: myBalance, refetch: refetchBalance } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  const { writeContract, data: hash, isPending, error, isError } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const handleGlobalUpdate = () => {
    refetchTotal();
    refetchBalance();
  };

  useEffect(() => {
    if (isError && error) {
      const errorMessage = error.message.includes('SerialNumberAlreadyUsed') 
        ? 'Error: This serial number is already registered!'
        : 'Error: Transaction failed.';
      toast.error(errorMessage);
    }
  }, [isError, error]);

  useEffect(() => {
    if (isConfirmed) {
      toast.success('Deed successfully minted!');
      setImageUri('');
      setSerialNumber('');
      setName('');
      handleGlobalUpdate();
    }
  }, [isConfirmed]);

  useEffect(() => {
    if (isPending) {
      toast.loading('Confirm in wallet...', { id: 'mint' });
    } else if (isConfirming) {
      toast.loading('Minting on blockchain...', { id: 'mint' });
    } else {
      toast.dismiss('mint');
    }
  }, [isPending, isConfirming]);

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !imageUri || !serialNumber || !name) {
      toast.error('Please fill in all fields');
      return;
    }

    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'safeMint',
      args: [address, imageUri, name, serialNumber],
    });
  };

  const marketIndices = totalSupply 
    ? Array.from({ length: Number(totalSupply) }, (_, i) => BigInt(i)).reverse() 
    : [];

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans selection:bg-blue-500/30">
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#1f2937',
            color: '#fff',
            border: '1px solid #374151',
          },
        }}
      />
      
      <div className="max-w-7xl mx-auto p-8">
        <header className="flex justify-between items-center mb-16">
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tighter text-blue-500 flex items-center gap-3">
              PROVENANCE
              <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-1 rounded tracking-widest font-bold">RWA PROTOCOL</span>
            </h1>
            <p className="text-gray-500 text-sm font-medium">Immutable physical asset tokenization.</p>
          </div>
          <ConnectButton />
        </header>

        {isConnected ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-5">
              <div className="bg-gray-900 p-8 rounded-3xl shadow-2xl border border-gray-800/50 h-fit sticky top-8">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold mb-2">Mint Digital Deed</h2>
                  <p className="text-gray-500 text-sm">Create a secure digital record for your physical item.</p>
                </div>
                
                <form onSubmit={handleMint} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Asset Reference Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-gray-950 border border-gray-800 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 transition-all text-sm"
                      placeholder="e.g. 1st Edition Charizard"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Physical Serial Number</label>
                    <input
                      type="text"
                      value={serialNumber}
                      onChange={(e) => setSerialNumber(e.target.value)}
                      className="w-full bg-gray-950 border border-gray-800 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 transition-all text-sm font-mono"
                      placeholder="e.g. SN-992-001"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Metadata URI (IPFS)</label>
                    <input
                      type="text"
                      value={imageUri}
                      onChange={(e) => setImageUri(e.target.value)}
                      className="w-full bg-gray-950 border border-gray-800 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 transition-all text-sm font-mono"
                      placeholder="ipfs://..."
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isPending || isConfirming}
                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black text-sm uppercase tracking-widest py-4 rounded-xl transition-all shadow-xl shadow-blue-900/40 mt-4 active:scale-95"
                  >
                    {isPending ? 'Check Wallet...' : isConfirming ? 'Processing...' : 'Mint Provenance Deed'}
                  </button>
                </form>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-8">
              <div className="flex bg-gray-900 p-1.5 rounded-2xl border border-gray-800/50 shadow-lg">
                <button 
                  onClick={() => setView('all')}
                  className={`flex-1 py-3 px-6 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${view === 'all' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                >
                  Marketplace
                </button>
                <button 
                  onClick={() => setView('mine')}
                  className={`flex-1 py-3 px-6 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${view === 'mine' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                >
                  My Collection
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {view === 'all' ? (
                  marketIndices.length > 0 ? (
                    marketIndices.map((tokenId) => (
                      <DeedCard key={tokenId.toString()} tokenId={tokenId} onUpdate={handleGlobalUpdate} />
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-32 bg-gray-900/30 rounded-3xl border-2 border-dashed border-gray-800">
                      <p className="text-gray-500 font-medium">No records found on protocol.</p>
                    </div>
                  )
                ) : (
                  address && Number(myBalance) > 0 ? (
                    Array.from({ length: Number(myBalance) }).map((_, i) => (
                      <DeedIdFetcherWrapper key={i} index={i} owner={address} onUpdate={handleGlobalUpdate} />
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-32 bg-gray-900/30 rounded-3xl border-2 border-dashed border-gray-800">
                      <p className="text-gray-500 font-medium">You don't own any deeds yet.</p>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-32 max-w-2xl mx-auto space-y-10">
            <div className="space-y-4">
              <h2 className="text-6xl font-black tracking-tighter leading-none">
                TOKENIZE <span className="text-blue-500">REALITY.</span>
              </h2>
              <p className="text-lg text-gray-400 font-medium">
                Connect your digital identity to begin minting immutable provenance records for your physical world assets.
              </p>
            </div>
            <div className="flex justify-center scale-125">
              <ConnectButton />
            </div>
          </div>
        )}
      </div>

      <footer className="mt-32 pb-16 border-t border-gray-900/50 text-center space-y-4 pt-12">
        <p className="text-[10px] font-black tracking-[0.4em] text-gray-600 uppercase">Provenance Protocol v1.0</p>
        <p className="text-gray-700 text-xs font-medium">Securely linking physical heritage to digital permanence.</p>
      </footer>
    </div>
  );
}

export default App;
