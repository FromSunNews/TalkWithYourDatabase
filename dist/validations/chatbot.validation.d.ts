import { NextFunction, Request, Response } from 'express';
export declare const ChatbotValidation: {
    getAnswer: (req: Request, res: Response, next: NextFunction) => Promise<void>;
};
