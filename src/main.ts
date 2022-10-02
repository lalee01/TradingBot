import 'dotenv/config'
import cron from 'node-cron'
import getKlines from './binance/query/klines'
import stochasticRsi from './indicator/stochRsi'
import getHeikinAshi from './chart/heikinAshi'
import stochRsiStrategy from './strategy/stochRsiStrategy'
import getAtr from './indicator/getAtr'


cron.schedule('*/60 * * * *', async () => {

    try {
        const klines = await getKlines() ?? []
        const heikinAshi = await getHeikinAshi(klines)
        const srsi = stochasticRsi(heikinAshi, {})
        const atr = getAtr(klines, {})

        stochRsiStrategy({
            srsi,
            atr,
            klines
        })

        console.log("it is still running.")
    } catch (e) {
        console.error(e)
    }
})
