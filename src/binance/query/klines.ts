import { BollingerBands, CrossDown } from 'technicalindicators'
import { BinanceClient } from '../connection'
<<<<<<< HEAD
import 'dotenv/config'
=======
import "dotenv/config";
>>>>>>> 9f0c3dbf103fb6aad8f088726a65bf61ee15df03

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
