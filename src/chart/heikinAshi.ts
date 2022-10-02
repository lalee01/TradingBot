import { Klines } from 'src/binance/query/klines'
import { CandleList, heikinashi } from 'technicalindicators'

export type HeikinAshi= CandleList & { bearish: boolean[], bullish: boolean[]}

const getHeikinAshi = async (klines: Klines[]): Promise<HeikinAshi>  => {
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

    const heikinAshi = heikinashi({ open, low, high, close, volume})

    const bearish = (heikinAshi?.open ?? []).map((open, index)=> {
        return open === heikinAshi.high?.[index]
    })

    const bullish = (heikinAshi?.open ?? []).map((open, index)=> {
        return open === heikinAshi.low?.[index]
    })


    return {
        ...heikinAshi,
        bearish,
        bullish
    }

    

}

export default getHeikinAshi