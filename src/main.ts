import 'dotenv/config'
import cron from 'node-cron'
import getKlines from './binance/query/klines'
import atrStopLossFinder from './indicator/AtrStopLossFinder'
import stochasticRsi from './indicator/stochRsi'
import getHeikinAshi from './chart/heikinAshi'


cron.schedule('*/5 * * * * *', async () => {

    try {
        const klines = await getKlines() ?? []
        const heikinAshi = await getHeikinAshi(klines)
        const srsi = stochasticRsi(heikinAshi, {})
    

        console.log(srsi[srsi.length-1])
        console.log(srsi[srsi.length-2])
        console.log(srsi[srsi.length-3])


        console.log("it is still running.")
    } catch (e) {
        console.error(e)
    }
})
