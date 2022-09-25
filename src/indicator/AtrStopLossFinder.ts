import { Klines } from 'src/binance/query/klines'
import { atr } from 'technicalindicators'


type Options = {
    period?: number
    multiplier?: number
}

const atrStopLossFinder = (inputData: Klines[], { period = 14, multiplier = 0.75 }: Options) => {
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

    
    const atrData = atr({ low, high, close, period })

    return atrData.map((atr, index) => ({
        high: atr * multiplier + high[index+period],
        low: low[index+period] - atr * multiplier,
        atr
    }))
}

export default atrStopLossFinder