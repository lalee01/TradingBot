import { CandleList } from "technicalindicators"
import { Klines } from "./klines"


const klinesConverter =  (klines:Array<Klines>)  => {
    const candles:CandleList = {
        open:[],
        high:[],
        low:[],
        close:[],
        volume:[],
        timestamp:[]
    }
    
    klines.map((candle,index) => {
        candles.open?.push(candle.openPrice)
        candles.high?.push(candle.highPrice)
        candles.low?.push(candle.lowPrice)
        candles.close?.push(candle.closePrice)
        candles.volume?.push(candle.volume)
        candles.timestamp?.push(candle.openTime)
    })
    return candles
}

export default klinesConverter