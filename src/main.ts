import 'dotenv/config'
import cron from 'node-cron'
import getKlines from './binance/query/klines'
import atrStopLossFinder from './indicator/AtrStopLossFinder'
import stochasticRsi from './indicator/stochRsi'
import getHeikinAshi from './chart/heikinAshi'
import stochRsiStrategy from './strategy/stochRsiStrategy'


cron.schedule('*/30 * * * * *', async () => {

    try {
        const klines = await getKlines() ?? []
        const heikinAshi = await getHeikinAshi(klines)
        const srsi = stochasticRsi(heikinAshi, {})

        stochRsiStrategy()

        console.log("it is still running.")
    } catch (e) {
        console.error(e)
    }
})
