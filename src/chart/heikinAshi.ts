import { Klines } from 'src/binance/query/klines'
import { CandleList, heikinashi } from 'technicalindicators'

export type HeikinAshi= CandleList & { bearish: boolean[], bullish: boolean[], doji: boolean[] , newDoji: boolean[]}

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

    const bearish: boolean[] = []
    const bullish: boolean[] = []
    const doji = [] as Array<boolean>
    const newDoji = [] as Array<boolean>

    (heikinAshi?.open ?? []).map((open: number, index: number)=> {
        const isBearish = open === heikinAshi.high?.[index]
        const isBullish = open === heikinAshi.low?.[index]
        const isDoji = Math.abs(open - (heikinAshi.close?.[index] ?? 0)).toPrecision(4) <= (open * 0.001).toPrecision(4) && !isBearish && !isBullish
        const newIsDoji =   Math.abs(open-(heikinAshi.close?.[index] ?? 0)) < 
                            Math.abs((heikinAshi.high?.[index] ?? 0)-(heikinAshi.low?.[index] ?? 0))/5
                            && !isBearish && !isBullish
        
        bearish.push(isBearish)
        bullish.push(isBullish)
        doji.push(isDoji)
        newDoji.push(newIsDoji)
    })

    return {
        ...heikinAshi,
        bearish,
        bullish,
        doji,
        newDoji
    }

    

}

export default getHeikinAshi