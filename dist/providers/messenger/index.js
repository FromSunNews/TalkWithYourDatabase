"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessengerProvider = void 0;
const axios_1 = __importDefault(require("axios"));
const environment_1 = require("../../config/environment");
const sendMessage = async (senderId, message) => {
    // Định nghĩa thông tin cho yêu cầu
    const postData = {
        recipient: { id: senderId },
        messaging_type: 'RESPONSE',
        message: { text: message },
        access_token: environment_1.env.ACCESS_TOKEN_MESSENGER
    };
    // Gửi yêu cầu POST
    const response = await axios_1.default.post(`https://graph.facebook.com/v19.0/${environment_1.env.FACEBOOK_PAGE_ID}/messages`, postData);
    if (response['status'] == 200 && response['statusText'] === 'OK') {
        console.log('Success');
        return 1;
    }
    else {
        console.log('Failed');
        return 0;
    }
};
const setTypingOn = async (senderId) => {
    let options = {
        method: 'POST',
        url: `https://graph.facebook.com/v17.0/${environment_1.env.FACEBOOK_PAGE_ID}/messages`,
        params: {
            access_token: environment_1.env.ACCESS_TOKEN_MESSENGER
        },
        headers: { 'Content-Type': 'application/json' },
        data: {
            recipient: { id: senderId },
            sender_action: 'typing_on'
        }
    };
    let response = await axios_1.default.request(options);
    if (response['status'] == 200 && response['statusText'] === 'OK') {
        return 1;
    }
    else {
        return 0;
    }
};
const setTypingOff = async (senderId) => {
    let options = {
        method: 'POST',
        url: `https://graph.facebook.com/v17.0/${environment_1.env.FACEBOOK_PAGE_ID}/messages`,
        params: {
            access_token: environment_1.env.ACCESS_TOKEN_MESSENGER
        },
        headers: { 'Content-Type': 'application/json' },
        data: {
            recipient: { id: senderId },
            sender_action: 'typing_off'
        }
    };
    let response = await axios_1.default.request(options);
    if (response['status'] == 200 && response['statusText'] === 'OK') {
        return 1;
    }
    else {
        return 0;
    }
};
exports.MessengerProvider = {
    sendMessage,
    setTypingOn,
    setTypingOff
};
//# sourceMappingURL=index.js.map