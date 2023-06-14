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

const orderInfo = {
    side : "SHORT",
    sl : 0,
    tp : 0
}

const trendwb = async ({klines,trend,symbol}: Options) => {
    
    const indexOffset = []
    const time = await BinanceClient.useServerTime().catch((err:Error)=>console.log(err))
    const lastCandleCloseTime = klines[klines.length - 1].closeTime
    
    if (time.serverTime > lastCandleCloseTime) {
        indexOffset.push(0)
        
    }else{
        indexOffset.push(-1)
    }  
    
    const getMarkPrice = await BinanceClient.futuresMarkPrice(symbol).catch((e:Error)=>console.log(e))
    const markPrice = Number(getMarkPrice.markPrice)
    
    const leverageCalc = (sl:number) => Number(Math.abs(risk/(sl/markPrice*100-100)).toFixed(0))

    const shortTradeTrigger =  trend[trend.length-1].newTrend === "DOWN" && trend[trend.length-1].break 
    const longTradeTrigger = trend[trend.length-1].newTrend === "UP" && trend[trend.length-1].break 

    const slLong = Number(trend[trend.length-1].latestLow)
    const tpLong = Number(markPrice+(markPrice-slLong*reward))

    const slShort = Number(trend[trend.length-1].latestHigh)
    const tpShort = Number(markPrice-(slShort-markPrice*reward))
    
    //orderInfo.sl = orderInfo.side === "SHORT" ? Number(markPrice*(1+SL)) : Number(markPrice*(1-SL))
    //orderInfo.tp = orderInfo.side === "SHORT" ? Number(markPrice*(1-TP)) : Number(markPrice*(1+TP))

    if(shortTradeTrigger){
        //orderInfo.side = "SHORT"
        const leverage = leverageCalc(slShort)
        //shortOrder({slShort , tpShort ,symbol,leverage})
        sendTelegramMessage(`${symbol} Short trade ${leverage}X : Mark Price :${markPrice.toFixed(2)} , SL: ${slShort.toFixed(3)} , TP: ${tpShort.toFixed(3)}`)
       //sendTelegramMessage(`${symbol} Short trade : Mark Price :${markPrice.toFixed(2)}`)
    }
    
    if(longTradeTrigger){
        //orderInfo.side = "LONG"
        const leverage = leverageCalc(slLong)
        //longOrder({slLong , tpLong ,symbol,leverage})
        sendTelegramMessage(`${symbol} Long trade ${leverage}X : Mark Price :${markPrice.toFixed(2)} , SL: ${slLong.toFixed(3)} , TP: ${tpLong.toFixed(3)}`)
        //sendTelegramMessage(`${symbol} Long trade : Mark Price :${markPrice.toFixed(2)}`)
    }
    
    console.log("-----------------------------------------------------")
    console.log(new Date())
    console.log(symbol)
    
    console.log("Trigger : " , shortTradeTrigger)
    console.log( "Trigger : " , longTradeTrigger)
}

export default trendwb