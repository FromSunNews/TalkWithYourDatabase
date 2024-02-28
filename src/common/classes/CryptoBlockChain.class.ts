import { DataBlockTemplate } from '../interfaces/DataBlock.interface';
import { CryptoBlock } from './CryptoBlock.class';
import { LinkedList } from './LinkedList';

export class CryptoBlockChain {
  private blockchain: LinkedList<CryptoBlock>;
  private difficulty: number;
  constructor() {
    this.blockchain = new LinkedList<CryptoBlock>();
    this.difficulty = 2;
  }

  public checkChainValidity(): boolean {
    if (this.blockchain.head) {
      let precedingBlock = this.blockchain.head;
      let currentBlock = this.blockchain.head!.next;
      console.log("🚀 ~ CryptoBlockChain ~ checkChainValidity ~ currentBlock:", currentBlock)
      while (currentBlock) {
        if (currentBlock.data.hash !== currentBlock.data.computeHash()) return false;
        if (precedingBlock!.data.hash !== currentBlock.data.precedingHash) return false;
        precedingBlock = precedingBlock!.next!;
        currentBlock = currentBlock!.next;
      }
    }
    return true;
  }

  private getLastedBlock(): CryptoBlock | undefined {
    return this.blockchain.lasted()?.data ;
  }

  public addNewBlock(data: DataBlockTemplate): void {
    const latestedBlock = this.getLastedBlock();
    console.log("🚀 ~ CryptoBlockChain ~ addNewBlock ~ latestedBlock:", latestedBlock)
    if ((this.checkChainValidity() && latestedBlock) || this.blockchain.head === null) {
      const newBlock = new CryptoBlock(this.blockchain.size, (Date.now()).toString(), data, latestedBlock?.hash ?? "");
      newBlock.proofOfWork(this.difficulty);
      this.blockchain.append(newBlock);
    } else console.log("This blockchain is UNVALID")
  }
}