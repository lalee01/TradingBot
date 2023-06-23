import {BinanceClient}  from './../binance/connection'
import getKlines, { Klines } from './../binance/query/klines'
import sendTelegramMessage from './../telegram/telegram'
import 'dotenv/config'
import { longOrder, shortOrder } from './../binance/sendorder'
import {trend} from 'src/chart/trendfinder'

type Options = {
    klines:Klines[]
    trend:trend[]
    symbol: String
}

const risk = Number(process.env.RISK ?? 1)
const reward = Number(process.env.REWARD ?? 2)

const trendwb = async ({klines,trend,symbol}: Options) => {

    const indexOffset = []
    const time = await BinanceClient.useServerTime().catch((err:Error)=>console.log(err))
    const lastCandleCloseTime = klines[klines.length - 1].closeTime
    
    if (time.serverTime > lastCandleCloseTime) {
        indexOffset.push(0)
    }else{
        indexOffset.push(-1)
    }  
    
    const targetKlineOpen = klines[klines.length - 2 + indexOffset[0]].openTime
    const getMarkPrice = await BinanceClient.futuresMarkPrice(symbol).catch((e:Error)=>console.log(e))
    const markPrice = Number(getMarkPrice.markPrice)

    const timeConverter = new Date(klines[klines.length - 2 + indexOffset[0]].openTime+7200000)
    const timeEqual = targetKlineOpen === trend[trend.length-1].timestamp
    
    const leverageCalc = (sl:number) => Number(Math.abs(risk/(sl/markPrice*100-100)).toFixed(0))

    const shortTradeTrigger =  trend[trend.length-1].newTrend === "DOWN" && trend[trend.length-1].break && timeEqual
    const longTradeTrigger = trend[trend.length-1].newTrend === "UP" && trend[trend.length-1].break && timeEqual

    const slLong = Number(trend[trend.length-1].latestLow)
    const tpLong = Number(markPrice+((markPrice-slLong)*reward))

    const slShort = Number(trend[trend.length-1].latestHigh)
    const tpShort = Number(markPrice-((slShort-markPrice)*reward))

    if(shortTradeTrigger){

        const leverage = leverageCalc(slShort)
        if(leverage <10){
            shortOrder({slShort , tpShort ,symbol,leverage})
        }
        sendTelegramMessage(`${symbol} Short trade ${leverage}X : Mark Price :${markPrice.toFixed(2)} , SL: ${slShort.toFixed(3)} , TP: ${tpShort.toFixed(3)}`)
    }
    
    if(longTradeTrigger){

        const leverage = leverageCalc(slLong)
        if(leverage <10){
            longOrder({slLong , tpLong ,symbol,leverage})
        }
        sendTelegramMessage(`${symbol} Long trade ${leverage}X : Mark Price :${markPrice.toFixed(2)} , SL: ${slLong.toFixed(3)} , TP: ${tpLong.toFixed(3)}`)

    }
    
    console.log("-----------------------------------------------------")
    console.log(new Date())
    console.log(symbol)

    console.log(trend[trend.length-1])
    console.log(timeConverter)
    console.log(targetKlineOpen ,trend[trend.length-1].timestamp)
    console.log("Short trigger : " , shortTradeTrigger ,"=>", trend[trend.length-1].newTrend === "DOWN", timeEqual ,trend[trend.length-1].break)
    console.log("Long trigger : " , longTradeTrigger ,"=>", trend[trend.length-1].newTrend === "UP", timeEqual ,trend[trend.length-1].break)
}

export default trendwb
