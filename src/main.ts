import 'dotenv/config'
import cron from 'node-cron'
import getKlines from './binance/query/klines'
import stochasticRsi from './indicator/stochRsi'
import getHeikinAshi from './chart/heikinAshi'
import stochRsiStrategy from './strategy/stochRsiStrategy'
import atrStopLossFinder from './indicator/AtrStopLossFinder'

const CRON_TIMING = process.env.CRON_TIMING ?? ''

const multiCoin = JSON.parse(process.env.MULTI_CRYPTO_PAIR ?? '')

cron.schedule(CRON_TIMING, async () => {

    multiCoin.map(async (symbol:String)=>{

            try {
            const klines = await getKlines(symbol) ?? []
            const heikinAshi = await getHeikinAshi(klines)
            const srsi = stochasticRsi(heikinAshi, {})
            const atrSLF = await atrStopLossFinder(klines , {multiplier : 0.5})
            
            stochRsiStrategy({
                srsi,
                klines,
                heikinAshi,
                atrSLF,
                symbol
            })
            
            console.log("it is still running.")
        } catch (e) {
            console.error(e)
        }
    })
})
