import { Klines } from 'src/binance/query/klines'
import { atr } from 'technicalindicators'


type Options = {
    period?: number
    multiplier?: number
}

const getAtr = (inputData: Klines[], { period = 14, multiplier = 0.5 }: Options): number[] => {
    const low = inputData.map(data => {
        return Number(data.lowPrice)
    })
    const high = inputData.map(data => {
        return Number(data.highPrice)
    })
    const close = inputData.map(data => {
        return Number(data.closePrice)
    })
    const closeTime = inputData.map(data => {
        return Number(data.closeTime)
    })

    
    return atr({ low, high, close, period }).map((atr)=> atr*multiplier)
}

export default getAtr