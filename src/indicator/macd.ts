import { Klines } from 'src/binance/query/klines'
import { macd } from 'technicalindicators'

const macdIndicator = (inputData: Klines[]) => {
    const values = inputData.map(data => {
        return Number(data.closePrice)
    })
    return macd({values, fastPeriod: 12, slowPeriod: 26, signalPeriod: 9, SimpleMAOscillator: false, SimpleMASignal: false})
}

export default macdIndicator