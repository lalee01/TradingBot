import 'dotenv/config'
import cron from 'node-cron'
import getKlines from './binance/query/klines'
import {BinanceClient}  from './binance/connection'
import spotGetKlines from './chart/Spot/spotklines'
import trendfinder from './chart/trendfinder'
import trendwb from './strategy/trendwb'


const CRON_TIMING = process.env.CRON_TIMING ?? ''
const multiCoin = JSON.parse(process.env.MULTI_CRYPTO_PAIR ?? '')

const singleSymbol="ETHBUSD"


cron.schedule(CRON_TIMING, async () => {

    multiCoin.map(async (symbol:String)=>{

            try {
            const klines = await getKlines(symbol) ?? []
            const trend = await trendfinder(klines)
            trendwb({
                klines,
                trend,
                symbol
            })
            
            console.log("it is still running.")
        } catch (e) {
            console.error(e)
        }
    })
})

