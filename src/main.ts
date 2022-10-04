import 'dotenv/config'
import cron from 'node-cron'
import getKlines from './binance/query/klines'
import getAtr from './indicator/getAtr'
import stochasticRsi from './indicator/stochRsi'
import getHeikinAshi from './chart/heikinAshi'
import piluStrategy from './strategy/piluStrategy'
import { setTimeout } from 'timers/promises'
import getAccountInfo from './binance/query/account'

cron.schedule('*/5 * * * *', async () => {
    await setTimeout(5000)
    try {
        const { positions, assets} = await getAccountInfo()
        const busdBalance = (Number((assets?.[0] ?? {})?.availableBalance)*0.9).toFixed(2)
  
        if(positions.length === 0) {
            console.log("There is no active position")
            const klines = await getKlines() ?? []
            const heikinAshi = await getHeikinAshi(klines)
            const srsi = stochasticRsi(heikinAshi, {})
            const atr = getAtr(klines, {})
        
            await piluStrategy({
                srsi,
                heikinAshi,
                atr,
                busdBalance
            })
        }

        console.log("it is still running.")
    } catch (e) {
        console.error(e)
    }
})
