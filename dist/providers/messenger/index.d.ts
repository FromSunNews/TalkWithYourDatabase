export declare const MessengerProvider: {
    sendMessage: (senderId: string, message: string) => Promise<1 | 0>;
    setTypingOn: (senderId: string) => Promise<1 | 0>;
    setTypingOff: (senderId: string) => Promise<1 | 0>;
};
