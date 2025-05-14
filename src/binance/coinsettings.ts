import fs from "fs"
import 'dotenv/config'
import { coinSettingstype } from "./getcoinsettings";

const multiCoin = JSON.parse(process.env.MULTI_CRYPTO_PAIR ?? '');
const coinsJson :coinSettingstype[] = []
const collectedData :coinSettingstype[] = []

const coinSettings = () =>{

        try {
            const data =  fs.readFileSync('./src/binance/coinsettings2_test.json', 'utf-8');
            coinsJson.push(JSON.parse(data));

            multiCoin.map((symbol :string)=>{
                const indexFinder = (element:coinSettingstype) => element.symbol === symbol
                const index = coinsJson[0].findIndex(indexFinder)
                collectedData.push(coinsJson[0][index])
            })
        } catch (error) {
            console.error('Error reading file:', error);
        }
    return collectedData
}

export default coinSettings