import 'dotenv/config'
import cron from 'node-cron'
import getKlines from './binance/query/klines'
import stochasticRsi from './indicator/stochRsi'
import getHeikinAshi from './chart/heikinAshi'
import stochRsiStrategy from './strategy/stochRsiStrategy'
import atrStopLossFinder from './indicator/AtrStopLossFinder'
import {BinanceClient}  from './binance/connection'

const CRON_TIMING = process.env.CRON_TIMING ?? ''
const multiplier = Number(process.env.ATR_MULTIPLIER ?? 0.75)


const multiCoin = JSON.parse(process.env.MULTI_CRYPTO_PAIR ?? '')

const valami =async ()=>{
    const exchangeInfo = await BinanceClient.exchangeInfo()
    const indexFinder = (element) => element.symbol == "APTBUSD"
    console.log(exchangeInfo.symbols.findIndex(indexFinder))
    console.log(exchangeInfo.symbols[exchangeInfo.symbols.findIndex(indexFinder)])

}

valami()
cron.schedule(CRON_TIMING, async () => {

    multiCoin.map(async (symbol:String)=>{

            try {
            const klines = await getKlines(symbol) ?? []
            const heikinAshi = await getHeikinAshi(klines)
            const atrSLF = await atrStopLossFinder(klines,{})
            
            stochRsiStrategy({
                klines,
                heikinAshi,
                atrSLF,
                symbol,
                multiplier
            })
            
            console.log("it is still running.")
        } catch (e) {
            console.error(e)
        }
    })
})
