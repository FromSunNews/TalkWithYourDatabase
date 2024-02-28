/* eslint-disable no-unreachable */
import { CryptoBlockChain } from "../common/classes/CryptoBlockChain.class";
import { DataBlockTemplate } from "../common/interfaces/DataBlock.interface";
import { HttpStatusCode } from "../utilities/constants";

const addNewBlock = async (datas: DataBlockTemplate[]) => {
  try {
    let smashingBlockChain = new CryptoBlockChain();
    datas.map((data: DataBlockTemplate) => smashingBlockChain.addNewBlock(data));
    return {
      isSuccess: true,
      data: smashingBlockChain,
      status: HttpStatusCode.OK
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(JSON.stringify(error));
    }
  }
}

export const BlockchainService = {
  addNewBlock
}
