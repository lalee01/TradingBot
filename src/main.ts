import 'dotenv/config'
import cron from 'node-cron'
import getKlines from './binance/query/klines'
import getAtr from './indicator/getAtr'
import stochasticRsi from './indicator/stochRsi'
import getHeikinAshi from './chart/heikinAshi'
import piluStrategy from './strategy/piluStrategy'


cron.schedule('*/5 * * * *', async () => {

    try {
        const klines = await getKlines() ?? []
        const heikinAshi = await getHeikinAshi(klines)
        const srsi = stochasticRsi(heikinAshi, {})
        const atr = getAtr(klines, {})
    
        piluStrategy({
            srsi,
            heikinAshi,
            atr
        })

        console.log("it is still running.")
    } catch (e) {
        console.error(e)
    }
})
