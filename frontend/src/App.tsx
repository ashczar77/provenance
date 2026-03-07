import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { useState } from 'react';
import './App.css';

// Placeholder ABI for now (we'll replace it later with the actual JSON)
const CONTRACT_ABI = [
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

const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3'; // Default Hardhat address

function App() {
  const { isConnected, address } = useAccount();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState('');

  const { writeContract, isPending } = useWriteContract();

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;

    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'safeMint',
      args: [address, imageUri], // We'll simplify for now
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans p-8">
      <header className="flex justify-between items-center mb-12">
        <h1 className="text-3xl font-bold tracking-tighter text-blue-400">
          Digital Deed <span className="text-white font-light text-xl">Marketplace</span>
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
                <label className="block text-sm font-medium text-gray-400 mb-1">Item Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. 1st Edition Charizard"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the condition, serial number, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Image URI (IPFS)</label>
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
            <h2 className="text-2xl font-semibold mb-6">Recent Deeds</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* This would be mapped from the blockchain later */}
              <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-blue-500 transition-all cursor-pointer">
                <div className="h-40 bg-gray-700 flex items-center justify-center">
                  <span className="text-gray-500 italic">No Image</span>
                </div>
                <div className="p-4">
                  <h3 className="font-bold">Placeholder Item</h3>
                  <p className="text-sm text-gray-400 truncate">Connect to see real deeds</p>
                </div>
              </div>
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
