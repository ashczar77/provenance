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
    "inputs": [
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "string", "name": "uri", "type": "string" }
    ],
    "name": "safeMint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

function DeedCard({ tokenId }: { tokenId: bigint }) {
  const { data: uri } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'tokenURI',
    args: [tokenId],
  });

  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-blue-500 transition-all">
      <div className="h-40 bg-gray-700 flex items-center justify-center">
        {uri ? (
          <span className="text-gray-400 text-xs break-all p-2 text-center">{uri}</span>
        ) : (
          <span className="text-gray-500 italic">Loading...</span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-blue-400">Deed #{tokenId.toString()}</h3>
        <p className="text-xs text-gray-500 mt-1 truncate">{uri || 'Fetching metadata...'}</p>
      </div>
    </div>
  );
}

function App() {
  const { isConnected, address } = useAccount();
  const [imageUri, setImageUri] = useState('');
  const [name, setName] = useState('');

  const { data: totalSupply } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'totalSupply',
  });

  const { writeContract, isPending } = useWriteContract();

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !imageUri) return;

    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'safeMint',
      args: [address, imageUri],
    });
  };

  // Create an array of token indices to map over
  const tokenIndices = totalSupply 
    ? Array.from({ length: Number(totalSupply) }, (_, i) => i).reverse() 
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
          <div className="bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-700">
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
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-all"
              >
                {isPending ? 'Minting...' : 'Create Digital Deed'}
              </button>
            </form>
          </div>

          {/* Gallery View */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Recent Deeds</h2>
              <span className="bg-blue-900/30 text-blue-400 px-3 py-1 rounded-full text-sm font-mono border border-blue-800">
                Total: {totalSupply?.toString() || '0'}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {tokenIndices.length > 0 ? (
                tokenIndices.map((index) => (
                  <DeedCard key={index} tokenId={BigInt(index)} />
                ))
              ) : (
                <div className="col-span-2 text-center py-12 bg-gray-800/50 rounded-xl border border-dashed border-gray-700">
                  <p className="text-gray-500">No deeds found. Mint the first one!</p>
                </div>
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
