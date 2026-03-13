import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useState, useEffect, useRef } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { uploadFileToIPFS, uploadMetadataToIPFS, getGatewayUrl, DeedMetadata } from './utils/ipfs';
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
  const [metadata, setMetadata] = useState<DeedMetadata | null>(null);

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
    if (uri) {
      const url = getGatewayUrl(uri as string);
      fetch(url)
        .then(res => res.json())
        .then(data => setMetadata(data))
        .catch(err => console.error("Error fetching metadata:", err));
    }
  }, [uri]);

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
      <div className="h-48 bg-gray-900 flex items-center justify-center relative overflow-hidden shrink-0">
        {isLoading ? (
          <div className="animate-pulse flex flex-col items-center">
             <div className="h-4 w-48 bg-gray-600 rounded mb-2"></div>
             <div className="h-3 w-32 bg-gray-600 rounded"></div>
          </div>
        ) : metadata?.image ? (
          <img 
            src={getGatewayUrl(metadata.image)} 
            alt={name as string} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 opacity-30">
            <div className="w-12 h-12 border-2 border-dashed border-gray-500 rounded-lg flex items-center justify-center">
              <span className="text-xl font-bold">?</span>
            </div>
            <span className="text-[10px] font-mono uppercase tracking-widest">No Asset Image</span>
          </div>
        )}
        <div className="absolute top-3 right-3 bg-blue-600/90 backdrop-blur-md text-[10px] px-2.5 py-1 rounded-lg font-black border border-blue-400/50 shadow-lg z-20">
          ID #{tokenId.toString()}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-60"></div>
      </div>
      <div className="p-4 bg-gradient-to-b from-gray-800 to-gray-800/50 flex-1 flex flex-col">
        <h3 className="font-black text-blue-400 text-sm tracking-tight uppercase truncate">
          {name || 'Digital Deed'}
        </h3>
        {metadata?.description && (
          <p className="text-[10px] text-gray-500 mt-1 line-clamp-2 leading-relaxed italic">
            "{metadata.description}"
          </p>
        )}
        
        <div className="mt-4 space-y-3">
          <div className="space-y-1">
            <p className="text-[9px] uppercase text-gray-500 font-black tracking-widest">Physical Serial</p>
            <p className="text-xs font-mono text-white bg-gray-950/80 px-2.5 py-2 rounded-lg border border-gray-700/50 shadow-inner group-hover:border-blue-500/30 transition-colors">
              {serial || '...'}
            </p>
          </div>
          
          <div className="space-y-1">
            <p className="text-[9px] uppercase text-gray-500 font-black tracking-widest">Protocol Owner</p>
            <p className="text-[10px] font-mono text-gray-400 truncate bg-gray-900/40 px-2 py-1.5 rounded-md border border-gray-800/50">
              {owner ? (isOwner ? 'YOU (Verified)' : owner as string) : '...'}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className="text-[10px] uppercase font-black text-blue-500/70 hover:text-blue-400 transition-colors flex items-center gap-2 group/btn"
          >
            <span className="w-1 h-1 bg-blue-500 rounded-full group-hover/btn:scale-150 transition-transform"></span>
            {showHistory ? 'Hide Provenance' : 'View Provenance History'}
          </button>

          {showHistory && (
            <div className="bg-gray-950/80 rounded-xl p-3 border border-gray-800/50 space-y-2 max-h-40 overflow-y-auto custom-scrollbar shadow-inner">
              {history && (history as string[]).map((addr, i) => (
                <div key={i} className="flex items-center gap-2 text-[9px] font-mono group/item">
                  <span className="text-gray-600 font-bold">#{i + 1}</span>
                  <span className={i === (history as string[]).length - 1 ? "text-blue-400 font-black" : "text-gray-500"}>
                    {addr === address ? 'You' : `${addr.slice(0, 6)}...${addr.slice(-4)}`}
                  </span>
                  {i === (history as string[]).length - 1 && (
                    <span className="text-[7px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full font-black border border-blue-500/30">CURRENT</span>
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
                  className="w-full bg-gray-950 text-[10px] p-2.5 rounded-lg border border-gray-700 focus:ring-1 focus:ring-blue-500 outline-none font-mono"
                  disabled={isPending || isConfirming}
                />
                <div className="flex gap-2">
                  <button 
                    type="submit"
                    disabled={isPending || isConfirming}
                    className="flex-1 bg-blue-600 text-[10px] font-black py-2 rounded-lg disabled:opacity-50 shadow-lg shadow-blue-900/20"
                  >
                    {isPending ? 'SIGNING...' : isConfirming ? 'CONFIRMING...' : 'EXECUTE TRANSFER'}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setIsTransferring(false)}
                    className="px-3 bg-gray-700 text-[10px] font-black py-2 rounded-lg"
                  >
                    CANCEL
                  </button>
                </div>
              </form>
            ) : (
              <button 
                onClick={() => setIsTransferring(true)}
                className="w-full bg-gray-700/50 hover:bg-blue-600 hover:text-white text-[10px] font-black py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 border border-gray-700 hover:border-blue-400 shadow-lg"
              >
                Transfer Ownership
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
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [name, setName] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [view, setView] = useState<'all' | 'mine'>('all');
  const [isMinting, setIsMinting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setIsMinting(false);
    }
  }, [isError, error]);

  useEffect(() => {
    if (isConfirmed) {
      toast.success('Deed successfully minted!');
      setFile(null);
      setSerialNumber('');
      setName('');
      setDescription('');
      setIsMinting(false);
      handleGlobalUpdate();
    }
  }, [isConfirmed]);

  useEffect(() => {
    if (isPending) {
      toast.loading('Confirm in wallet...', { id: 'mint' });
    } else if (isConfirming) {
      toast.loading('Minting on blockchain...', { id: 'mint' });
    } else if (!isMinting) {
      toast.dismiss('mint');
    }
  }, [isPending, isConfirming, isMinting]);

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !file || !serialNumber || !name) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsMinting(true);
      toast.loading('Uploading asset to IPFS...', { id: 'mint' });
      
      // 1. Upload Image
      const imageUri = await uploadFileToIPFS(file);
      
      // 2. Prepare Metadata
      const metadata: DeedMetadata = {
        name,
        description,
        image: imageUri,
        attributes: [
          { trait_type: "Serial Number", value: serialNumber }
        ]
      };
      
      // 3. Upload Metadata
      const metadataUri = await uploadMetadataToIPFS(metadata);
      
      // 4. Mint on Chain
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'safeMint',
        args: [address, metadataUri, name, serialNumber],
      });
      
    } catch (err) {
      console.error(err);
      toast.error('IPFS Upload failed');
      setIsMinting(false);
    }
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
            background: '#111827',
            color: '#fff',
            border: '1px solid #1f2937',
            borderRadius: '16px',
            fontSize: '12px',
            fontWeight: 'bold',
          },
        }}
      />
      
      <div className="max-w-7xl mx-auto p-8">
        <header className="flex justify-between items-center mb-16">
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tighter text-blue-500 flex items-center gap-3">
              PROVENANCE
              <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-full tracking-[0.2em] font-black border border-blue-500/20">RWA PROTOCOL</span>
            </h1>
            <p className="text-gray-500 text-sm font-medium">Decentralized asset authentication layer.</p>
          </div>
          <ConnectButton />
        </header>

        {isConnected ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-5">
              <div className="bg-gray-900 p-8 rounded-[2rem] shadow-2xl border border-gray-800/50 h-fit sticky top-8">
                <div className="mb-8">
                  <h2 className="text-2xl font-black mb-2 tracking-tight">Register New Asset</h2>
                  <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Establish immutable provenance</p>
                </div>
                
                <form onSubmit={handleMint} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase font-black text-gray-500 tracking-widest ml-1">Asset Image</label>
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full aspect-video bg-gray-950 border-2 border-dashed border-gray-800 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500/50 transition-all overflow-hidden relative group"
                    >
                      {file ? (
                        <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center space-y-2">
                          <div className="text-gray-600 text-3xl">+</div>
                          <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Select physical asset photo</p>
                        </div>
                      )}
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="hidden" 
                        accept="image/*"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] uppercase font-black text-gray-500 tracking-widest ml-1">Asset Title</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3.5 focus:outline-none focus:ring-1 focus:ring-blue-600/50 focus:border-blue-600 transition-all text-sm font-bold"
                      placeholder="e.g. Vintage 1964 Fender Stratocaster"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] uppercase font-black text-gray-500 tracking-widest ml-1">Asset Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3.5 focus:outline-none focus:ring-1 focus:ring-blue-600/50 focus:border-blue-600 transition-all text-xs font-medium h-24 resize-none"
                      placeholder="Detail unique markings, condition, or historical significance..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] uppercase font-black text-gray-500 tracking-widest ml-1">Physical ID / Serial</label>
                    <input
                      type="text"
                      value={serialNumber}
                      onChange={(e) => setSerialNumber(e.target.value)}
                      className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3.5 focus:outline-none focus:ring-1 focus:ring-blue-600/50 focus:border-blue-600 transition-all text-sm font-mono"
                      placeholder="L-88291-XX"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isPending || isConfirming || isMinting}
                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black text-xs uppercase tracking-[0.2em] py-4 rounded-xl transition-all shadow-xl shadow-blue-900/40 mt-4 active:scale-[0.98] border border-blue-400/20"
                  >
                    {isMinting ? 'UPDATING IPFS...' : isPending ? 'AUTHORIZING...' : isConfirming ? 'FINALIZING...' : 'MINT DEED'}
                  </button>
                </form>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-8">
              <div className="flex bg-gray-900 p-1.5 rounded-2xl border border-gray-800/50 shadow-lg">
                <button 
                  onClick={() => setView('all')}
                  className={`flex-1 py-3 px-6 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${view === 'all' ? 'bg-blue-600 text-white shadow-xl' : 'text-gray-500 hover:text-white'}`}
                >
                  Market Index
                </button>
                <button 
                  onClick={() => setView('mine')}
                  className={`flex-1 py-3 px-6 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${view === 'mine' ? 'bg-blue-600 text-white shadow-xl' : 'text-gray-500 hover:text-white'}`}
                >
                  My Deeds
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {view === 'all' ? (
                  marketIndices.length > 0 ? (
                    marketIndices.map((tokenId) => (
                      <DeedCard key={tokenId.toString()} tokenId={tokenId} onUpdate={handleGlobalUpdate} />
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-32 bg-gray-900/30 rounded-[2.5rem] border-2 border-dashed border-gray-800">
                      <p className="text-gray-600 text-xs font-black uppercase tracking-widest">No Protocol Records Found</p>
                    </div>
                  )
                ) : (
                  address && Number(myBalance) > 0 ? (
                    Array.from({ length: Number(myBalance) }).map((_, i) => (
                      <DeedIdFetcherWrapper key={i} index={i} owner={address} onUpdate={handleGlobalUpdate} />
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-32 bg-gray-900/30 rounded-[2.5rem] border-2 border-dashed border-gray-800">
                      <p className="text-gray-600 text-xs font-black uppercase tracking-widest">Your collection is empty</p>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-32 max-w-2xl mx-auto space-y-12">
            <div className="space-y-6">
              <h2 className="text-7xl font-black tracking-tighter leading-[0.9]">
                REIFY THE <br/><span className="text-blue-500">PHYSICAL.</span>
              </h2>
              <p className="text-base text-gray-500 font-medium leading-relaxed uppercase tracking-widest">
                Connect wallet to bridge physical <br/>heritage with digital permanence.
              </p>
            </div>
            <div className="flex justify-center scale-150">
              <ConnectButton />
            </div>
          </div>
        )}
      </div>

      <footer className="mt-32 pb-16 border-t border-gray-900/50 text-center space-y-4 pt-12">
        <p className="text-[9px] font-black tracking-[0.5em] text-gray-700 uppercase">Provenance Protocol // Zero Knowledge Provenance</p>
        <div className="flex justify-center gap-4">
          <div className="w-1 h-1 bg-gray-800 rounded-full"></div>
          <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
          <div className="w-1 h-1 bg-gray-800 rounded-full"></div>
        </div>
      </footer>
    </div>
  );
}

export default App;
