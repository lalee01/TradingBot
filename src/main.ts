import 'dotenv/config'
import cron from 'node-cron'
import getKlines from './binance/query/klines'
import stochasticRsi from './indicator/stochRsi'
import atrStopLossFinder from './indicator/AtrStopLossFinder'
import {BinanceClient}  from './binance/connection'
import newSrsiStrategy from './strategy/newsrsiStrategy'
import { ema } from 'technicalindicators'
import exponentialMovingAverage from './indicator/ema'
import klinesConverter from './binance/query/klinesConverter'

const CRON_TIMING = process.env.CRON_TIMING ?? ''
const multiCoin = JSON.parse(process.env.MULTI_CRYPTO_PAIR ?? '')
const atrLength = Number(process.env.ATR_LENGTH)
const emaLength = Number(process.env.EMA)
const rsiLength = Number(process.env.RSI_LENGTH)

cron.schedule(CRON_TIMING, async () => {

    multiCoin.map(async (symbol:String)=>{

            try {
                const klines = await getKlines(symbol) ?? []
                const convKlines = klinesConverter(klines)
                const srsi = await stochasticRsi(convKlines , {rsiPeriod:rsiLength , kPeriod:3 , dPeriod:3})
                const atrSLF = await atrStopLossFinder(klines,{period:atrLength , multiplier:1})
                const ema = await exponentialMovingAverage(klines ,{period:emaLength})
                const lastema = Number(ema[ema.length-1].toFixed(2))
            
            newSrsiStrategy({
                srsi,
                klines,
                atrSLF,
                symbol,
                lastema
            })
            
            console.log("it is still running.")
        } catch (e) {
            console.error(e)
        }
    })
})
