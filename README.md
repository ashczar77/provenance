# 📜 Provenance: The Digital Deed Marketplace

**Provenance** is an open-source platform for tokenizing physical-world assets (RWAs). It allows collectors and creators to "mint" digital deeds that represent real-world items like rare trading cards, luxury watches, or fine art.

By linking a physical item's unique serial number to an ERC-721 token on the blockchain, **Provenance** provides an immutable record of ownership that is transparent and transferable.

---

## 🛠 Tech Stack

### **On-Chain (Blockchain)**
- **Solidity:** Smart contract logic.
- **Hardhat:** Development and testing environment.
- **OpenZeppelin:** Audited, secure ERC-721 (NFT) standards.

### **Off-Chain (Frontend)**
- **React (TypeScript):** Modern, type-safe web framework.
- **Vite:** Next-generation frontend tooling.
- **Tailwind CSS v4:** Utility-first styling for a clean, modern UI.
- **Wagmi & RainbowKit:** The industry standard for connecting digital wallets.

---

## 🚀 Getting Started

### **1. Clone and Install**
```bash
git clone https://github.com/YOUR_USERNAME/provenance.git
cd provenance
```

### **2. Setup Blockchain**
```bash
cd blockchain
npm install
npx hardhat compile
npx hardhat test
```

### **3. Launch Frontend**
```bash
cd ../frontend
npm install
npm run dev
```

---

## 📂 Project Structure

- `/blockchain`: Smart contracts, Hardhat configuration, and unit tests.
- `/frontend`: The React/Vite web application.
- `PROJECT_PLAN.md`: The roadmap for current and future development.

---

## 📜 License
This project is open-source and available under the **MIT License**.
