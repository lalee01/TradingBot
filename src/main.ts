import 'dotenv/config'
import cron from 'node-cron'
import getKlines from './binance/query/klines'
import stochasticRsi from './indicator/stochRsi'
import atrStopLossFinder from './indicator/AtrStopLossFinder'
import {BinanceClient}  from './binance/connection'
import newSrsiStrategy from './strategy/newsrsiStrategy'
import { ema } from 'technicalindicators'
import exponentialMovingAverage from './indicator/ema'

const CRON_TIMING = process.env.CRON_TIMING ?? ''
const multiCoin = JSON.parse(process.env.MULTI_CRYPTO_PAIR ?? '')
const atrLength = Number(process.env.ATR_LENGTH)
const emaLength = Number(process.env.EMA)
const rsiLength = Number(process.env.RSI_LENGTH)

cron.schedule(CRON_TIMING, async () => {

    multiCoin.map(async (symbol:String)=>{

            try {
            const klines = await getKlines(symbol) ?? []
            const srsi = await stochasticRsi(klines , {rsiPeriod:rsiLength})
            const atrSLF = await atrStopLossFinder(klines,{period:atrLength})
            const ema = await exponentialMovingAverage(klines ,{period:emaLength})
            
            newSrsiStrategy({
                klines,
                atrSLF,
                symbol
            })
            
            console.log("it is still running.")
        } catch (e) {
            console.error(e)
        }
    })
})
