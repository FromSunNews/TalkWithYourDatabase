import SHA256 from 'crypto-js/sha256';
import { DataBlockTemplate } from '../interfaces/DataBlock.interface';

export class CryptoBlock {
  index: number;
  timestamp: string;
  data: DataBlockTemplate | null;
  precedingHash: string = "";
  hash: string = "";
  nonce: number;

  constructor(index: number, timestamp: string, data: DataBlockTemplate | null, precedingHash: string = "") {
    this.index = index;
    this.timestamp = timestamp;
    this.data = data;
    this.precedingHash = precedingHash;
    this.hash = this.computeHash()
    this.nonce = 0;
  }

  computeHash(): string {
    return SHA256(this.index + this.precedingHash + this.timestamp + JSON.stringify(this.data) + this.nonce).toString();
  }

  proofOfWork(difficulty: number) {
    while (
      this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")
    ) {
      this.nonce++;
      this.hash = this.computeHash();
    }
  }
}