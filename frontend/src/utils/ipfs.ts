import { PinataSDK } from "pinata-web3";

const pinata = new PinataSDK({
  pinataJwt: import.meta.env.VITE_PINATA_JWT,
  pinataGateway: "gateway.pinata.cloud",
});

export interface DeedMetadata {
  name: string;
  description: string;
  image: string;
  attributes: {
    trait_type: string;
    value: string;
  }[];
}

/**
 * Uploads a file to IPFS and returns the CID URL
 */
export async function uploadFileToIPFS(file: File): Promise<string> {
  try {
    const upload = await pinata.upload.file(file);
    return `ipfs://${upload.cid}`;
  } catch (error) {
    console.error("Error uploading file to IPFS:", error);
    throw new Error("Failed to upload image to IPFS");
  }
}

/**
 * Uploads JSON metadata to IPFS and returns the CID URL
 */
export async function uploadMetadataToIPFS(metadata: DeedMetadata): Promise<string> {
  try {
    const upload = await pinata.upload.json(metadata);
    return `ipfs://${upload.cid}`;
  } catch (error) {
    console.error("Error uploading metadata to IPFS:", error);
    throw new Error("Failed to upload metadata to IPFS");
  }
}

/**
 * Converts an ipfs:// URL to a clickable gateway URL
 */
export function getGatewayUrl(ipfsUrl: string): string {
  if (!ipfsUrl) return "";
  if (ipfsUrl.startsWith("ipfs://")) {
    return `https://gateway.pinata.cloud/ipfs/${ipfsUrl.split("ipfs://")[1]}`;
  }
  return ipfsUrl;
}
