import { Klines } from 'src/binance/query/klines'
import { ema, sma } from 'technicalindicators'

type Options = {
    period?: number
    smaPeriod?: number
}

const exponentialMovingAverage = (inputData: Klines[], { period = 200, smaPeriod = 5}: Options) => {
    const values = inputData.map(data => {
        return Number(data.closePrice)
    })
    

    return sma({period: smaPeriod, values: ema({period, values})})
}

export default exponentialMovingAverage