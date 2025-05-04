import 'dotenv/config'
import cron from 'node-cron'
import getKlines from './binance/query/klines'
import stochasticRsi from './indicator/stochRsi'
import atrStopLossFinder from './indicator/AtrStopLossFinder'
import newSrsiStrategy from './strategy/newsrsiStrategy'
import exponentialMovingAverage from './indicator/ema'
import klinesConverter from './binance/query/klinesConverter'
import sendTelegramMessage from './telegram/telegram'
import { BinanceClient } from './binance/connection'

const CRON_TIMING = process.env.CRON_TIMING ?? ''
const multiCoin = JSON.parse(process.env.MULTI_CRYPTO_PAIR ?? '')
const atrLength = Number(process.env.ATR_LENGTH)
const emaLength = Number(process.env.EMA)
const rsiLength = Number(process.env.RSI_LENGTH);

sendTelegramMessage("Bot Started");

cron.schedule(CRON_TIMING, async () => {
    await BinanceClient.useServerTime()

    const activeOrders = await BinanceClient.futuresPositionRisk().then((response : any)=>{
        if(response.msg){
            console.info("\x1b[31m" + response.msg)
        }
        return response
    })
    
    multiCoin.map(async (symbol:String)=>{

        const indexFinder = (element) => element.symbol === symbol
    
        if(activeOrders[activeOrders.findIndex(indexFinder)].entryPrice > 0){
            console.log("Active Order" , symbol)
        }else{
            console.log("Looking for Trade" , symbol)

            try {
                const klines = await getKlines(symbol) ?? []
                const convKlines = klinesConverter(klines)
                const srsi = await stochasticRsi(convKlines , {rsiPeriod:rsiLength , kPeriod:3 , dPeriod:3})
                const atrSLF = await atrStopLossFinder(klines,{period:atrLength , multiplier:1})
                const ema = await exponentialMovingAverage(klines ,{period:emaLength, smaPeriod:1})
                const lastema = Number(ema[ema.length-1])
                
                newSrsiStrategy({
                    srsi,
                    klines,
                    atrSLF,
                    symbol,
                    lastema
                })
            } catch (e) {
                console.error(e)
            }
        }
    })
})