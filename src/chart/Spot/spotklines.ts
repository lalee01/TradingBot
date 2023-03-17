import { BollingerBands, CrossDown } from 'technicalindicators'
import { BinanceClient } from './../../binance/connection'
import 'dotenv/config'

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

const spotGetKlines = async (symbol:String , interval:String):Promise<Klines[]|undefined>  => {
    try {
        const klines = await BinanceClient.candlesticks(symbol, interval ,false ,{limit:5})
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

export default spotGetKlines