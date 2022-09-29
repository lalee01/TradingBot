import { BollingerBands, CrossDown } from 'technicalindicators'
import { BinanceClient } from '../connection'
import 'dotenv/config'

const CRYPTO_PAIR = process.env.CRYPTO_PAIR

type klineTupple = {
    data:  [
        number,    
        string,       
        string,          
        string,
        string,          
        string,
        number,     
        string,    
        number,      
        string,   
        string,     
        string              
      ]
}

export type Klines = {
    openTime: number,
    openPrice: number,
    highPrice: number,
    lowPrice: number,
    closePrice: number,
    volume: number,
    closeTime: number
}

const getKlines = async ():Promise<Klines[]|undefined>  => {
    try {
        const klines = await BinanceClient.futuresCandles(CRYPTO_PAIR, '1h')
        return await klines.map((kline: klineTupple[]) => {
            return {
                openTime: kline[0],
                openPrice: Number(kline[1]),
                highPrice: Number(kline[2]),
                lowPrice: Number(kline[3]),
                closePrice: Number(kline[4]),
                volume: kline[5],
                closeTime: kline[6],
            }
        })

    } catch (e) {
        console.error(e)
    }

}

export default getKlines
