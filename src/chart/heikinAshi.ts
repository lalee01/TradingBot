import { Klines } from 'src/binance/query/klines'
import { CandleList, heikinashi } from 'technicalindicators'


const getHeikinAshi = async (klines: Klines[]): Promise<CandleList> => {
    const open = klines.map(candle =>{
        return Number(candle.openPrice)
    })
    const low = klines.map(candle => {
        return Number(candle.lowPrice)
    })
    const high = klines.map(candle => {
        return Number(candle.highPrice)
    })
    const close = klines.map(candle => {
        return Number(candle.closePrice)
    })
    const volume = klines.map(candle => {
        return Number(candle.volume)
    })

    return heikinashi({ open, low, high, close, volume})

}

export default getHeikinAshi