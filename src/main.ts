import 'dotenv/config'
import cron from 'node-cron'
import getKlines from './binance/query/klines'
import stochasticRsi from './indicator/stochRsi'
import getHeikinAshi from './chart/heikinAshi'
import stochRsiStrategy from './strategy/stochRsiStrategy'
import atrStopLossFinder from './indicator/AtrStopLossFinder'

const CRON_TIMING = process.env.CRON_TIMING ?? ''


cron.schedule(CRON_TIMING, async () => {

    try {
        const klines = await getKlines() ?? []
        const heikinAshi = await getHeikinAshi(klines)
        const srsi = stochasticRsi(heikinAshi, {})
        const atrSLF = atrStopLossFinder(klines , {multiplier : 0.5})

        stochRsiStrategy({
            srsi,
            klines,
            heikinAshi,
            atrSLF
        })

        console.log("it is still running.")
    } catch (e) {
        console.error(e)
    }
})
