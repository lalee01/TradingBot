import { TelegramClient }  from "telegram";
import { StringSession } from "telegram/sessions/StringSession.js";
import "dotenv/config";

const CHAT_NAME =  process.env.CHAT_NAME
const API_ID = Number(process.env.API_ID)
const API_HASH = process.env.API_HASH;
const STRING_SESSION = process.env.STRING_SESSION; // leave this empty for now
const BOT_TOKEN = process.env.BOT_TOKEN; // put your bot token here

const sendTelegramMessage = async (msg: string) => {
    const client = new TelegramClient(new StringSession(STRING_SESSION), API_ID, API_HASH ?? '',{ connectionRetries: 5 });

    await client.start({botAuthToken: BOT_TOKEN ?? '',}).then((res)=> console.log(res))
    await client.sendMessage(CHAT_NAME ?? '', { message:` ${msg}` })
    .catch((error) => client.logger.error(error))
}
export default sendTelegramMessage
