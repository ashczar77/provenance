import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { useState } from 'react';
import './App.css';

// Use the real ABI from the compiled contract artifact
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
    "name": "getSerialNumber",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "string", "name": "uri", "type": "string" },
      { "internalType": "string", "name": "serialNumber", "type": "string" }
    ],
    "name": "safeMint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

const CONTRACT_ADDRESS = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';

function DeedCard({ tokenId }: { tokenId: bigint }) {
  const { data: uri } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'tokenURI',
    args: [tokenId],
  });

  const { data: serial } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getSerialNumber',
    args: [tokenId],
  });

  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-blue-500 transition-all">
      <div className="h-40 bg-gray-700 flex items-center justify-center relative overflow-hidden">
        {uri ? (
          <span className="text-gray-400 text-xs break-all p-2 text-center z-10">{uri}</span>
        ) : (
          <span className="text-gray-500 italic">Loading...</span>
        )}
        <div className="absolute top-2 right-2 bg-blue-600 text-[10px] px-2 py-0.5 rounded font-mono">
          #{tokenId.toString()}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-blue-400 truncate">Digital Deed</h3>
        <div className="mt-2 space-y-1">
          <p className="text-[10px] uppercase text-gray-500 font-semibold tracking-wider">Physical Serial</p>
          <p className="text-sm font-mono text-white bg-gray-900 px-2 py-1 rounded border border-gray-700">
            {serial || '...'}
          </p>
        </div>
      </div>
    </div>
  );
}

function DeedIdFetcherWrapper({ index, owner }: { index: number, owner: `0x${string}` }) {
  const { data: tokenId } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'tokenOfOwnerByIndex',
    args: [owner, BigInt(index)],
  });

  if (tokenId === undefined) return null;
  return <DeedCard tokenId={tokenId as bigint} />;
}

function App() {
  const { isConnected, address } = useAccount();
  const [imageUri, setImageUri] = useState('');
  const [name, setName] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [view, setView] = useState<'all' | 'mine'>('all');

  const { data: totalSupply } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'totalSupply',
  });

  const { data: myBalance } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  const { writeContract, isPending } = useWriteContract();

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !imageUri || !serialNumber) return;

    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'safeMint',
      args: [address, imageUri, serialNumber],
    });
  };

  // Create an array of token indices to map over for global marketplace
  const marketIndices = totalSupply 
    ? Array.from({ length: Number(totalSupply) }, (_, i) => BigInt(i)).reverse() 
    : [];

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans p-8">
      <header className="flex justify-between items-center mb-12">
        <h1 className="text-3xl font-bold tracking-tighter text-blue-400">
          Provenance <span className="text-white font-light text-xl">Marketplace</span>
        </h1>
        <ConnectButton />
      </header>

      {isConnected ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Minting Form */}
          <div className="bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-700 h-fit sticky top-8">
            <h2 className="text-2xl font-semibold mb-6">Mint a New Deed</h2>
            <form onSubmit={handleMint} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Item Name (Internal)</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. 1st Edition Charizard"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Physical Serial Number</label>
                <input
                  type="text"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. SN-992-001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Metadata URI (IPFS)</label>
                <input
                  type="text"
                  value={imageUri}
                  onChange={(e) => setImageUri(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ipfs://..."
                />
              </div>
              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-blue-900/20"
              >
                {isPending ? 'Minting...' : 'Create Digital Deed'}
              </button>
            </form>
          </div>

          {/* Gallery View */}
          <div>
            <div className="flex bg-gray-800 p-1 rounded-xl border border-gray-700 mb-6">
              <button 
                onClick={() => setView('all')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${view === 'all' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
              >
                Marketplace ({totalSupply?.toString() || '0'})
              </button>
              <button 
                onClick={() => setView('mine')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${view === 'mine' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
              >
                My Collection ({myBalance?.toString() || '0'})
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {view === 'all' ? (
                marketIndices.length > 0 ? (
                  marketIndices.map((tokenId) => (
                    <DeedCard key={tokenId.toString()} tokenId={tokenId} />
                  ))
                ) : (
                  <div className="col-span-2 text-center py-20 bg-gray-800/30 rounded-2xl border-2 border-dashed border-gray-700">
                    <p className="text-gray-500">The marketplace is empty.</p>
                  </div>
                )
              ) : (
                address && Number(myBalance) > 0 ? (
                  Array.from({ length: Number(myBalance) }).map((_, i) => (
                    <DeedIdFetcherWrapper key={i} index={i} owner={address} />
                  ))
                ) : (
                  <div className="col-span-2 text-center py-20 bg-gray-800/30 rounded-2xl border-2 border-dashed border-gray-700">
                    <p className="text-gray-500">You don't own any deeds yet.</p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-20">
          <h2 className="text-5xl font-extrabold mb-4">The Future of Physical Ownership</h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Tokenize your physical assets and trade them as secure digital deeds on the blockchain.
          </p>
          <div className="flex justify-center">
            <ConnectButton />
          </div>
        </div>
      )}

      <footer className="mt-20 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
        Build with React + Solidity + Tailwind v4
      </footer>
    </div>
  );
}

export default App;
