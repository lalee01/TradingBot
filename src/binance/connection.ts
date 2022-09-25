import Binance from 'node-binance-api'

const apiKey = process.env.API_KEY ?? ''
const apiSecret = process.env.SECRET_KEY ?? ''

const createConnection = () => {
    try {
       return new Binance().options({
        APIKEY: apiKey,
        APISECRET: apiSecret,
      });
    } catch (e) {
        console.error(e)
    }
}

export const BinanceClient = createConnection()
