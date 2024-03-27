import { env } from "config/environment";
import axios from "axios"

const sendMessage = async (senderId: string, message: string) => {
  // Định nghĩa thông tin cho yêu cầu
  const postData = {
    recipient: { id: senderId },
    messaging_type: 'RESPONSE',
    message: { text: message },
    access_token: env.ACCESS_TOKEN_MESSENGER
  };

  // Gửi yêu cầu POST
  const response = await axios.post(`https://graph.facebook.com/v19.0/${env.FACEBOOK_PAGE_ID}/messages`, postData)
  if (response['status'] == 200 && response['statusText'] === 'OK') {
    console.log('Success')
    return 1;
  } else {
    console.log('Failed')
    return 0;
  }
};

const setTypingOn = async (senderId: string) => {
  let options = {
    method: 'POST',
    url: `https://graph.facebook.com/v17.0/${env.FACEBOOK_PAGE_ID}/messages`,
    params: {
      access_token: env.ACCESS_TOKEN_MESSENGER
    },
    headers: { 'Content-Type': 'application/json' },
    data: {
      recipient: { id: senderId },
      sender_action: 'typing_on'
    }
  };
  let response = await axios.request(options);
  if (response['status'] == 200 && response['statusText'] === 'OK') {
    return 1;
  } else {
    return 0;
  }
};

const setTypingOff = async (senderId: string) => {
  let options = {
    method: 'POST',
    url: `https://graph.facebook.com/v17.0/${env.FACEBOOK_PAGE_ID}/messages`,
    params: {
      access_token: env.ACCESS_TOKEN_MESSENGER
    },
    headers: { 'Content-Type': 'application/json' },
    data: {
      recipient: { id: senderId },
      sender_action: 'typing_off'
    }
  };
  let response = await axios.request(options);
  if (response['status'] == 200 && response['statusText'] === 'OK') {
    return 1;
  } else {
    return 0;
  }
};

export const MessengerProvider = {
  sendMessage,
  setTypingOn,
  setTypingOff
};