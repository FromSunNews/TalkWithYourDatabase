import { Request, Response } from 'express';
export declare const ChatbotController: {
    getAnswerPOST: (req: Request, res: Response) => Promise<void>;
    checkConnectionMessenger: (req: Request, res: Response) => Promise<void>;
};
