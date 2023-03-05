import { CandleList, crossDown, crossUp , doji } from 'technicalindicators'
import {BinanceClient}  from './../binance/connection'
import getKlines, { Klines } from './../binance/query/klines'
import sendTelegramMessage from './../telegram/telegram'
import 'dotenv/config'
import exponentialMovingAverage from './../indicator/ema'
import { StochasticRSIOutput } from 'technicalindicators/declarations/momentum/StochasticRSI'
import { longOrder, shortOrder } from './../binance/sendorder'

type Options = {
    klines:Klines[]
    heikinAshi: CandleList & { bearish: boolean[], bullish: boolean[], doji: boolean[] , newDoji: boolean[]}
    atrSLF: Array <{high:number , low:number , atr:number}>
    symbol: String
}

const SLmultiplier = Number(process.env.ATR_MULTIPLIER_SL ?? 0.75)
const TPmultiplier = Number(process.env.ATR_MULTIPLIER_TP ?? 0.75)
/*
type Order = {
    type:string
    sl:number
    tp:number
}
*/

const orderInfo = {
    side : "SHORT",
    sl : 0,
    tp : 0
}

const stochRsiStrategy = async ({klines , heikinAshi , atrSLF,symbol}: Options) => {

    const indexOffset = []
    const time = await BinanceClient.useServerTime().catch((err:Error)=>console.log(err))
    const lastCandleCloseTime = klines[klines.length - 1].closeTime
    //const ema200 = exponentialMovingAverage(klines , {period : 200 , smaPeriod: 5})
    //const lastema = Number(ema200[ema200.length-1].toFixed(2))
    
    if (time.serverTime > lastCandleCloseTime) {
        indexOffset.push(0)
        
    }else{
        indexOffset.push(-1)
    }  
    
    const getMarkPrice = await BinanceClient.futuresMarkPrice(symbol).catch((e:Error)=>console.log(e))
    const markPrice = Number(getMarkPrice.markPrice)
    
    const isItDoji = heikinAshi.newDoji.slice(-3)
    const isItBearish = heikinAshi.bearish.slice(-3)
    const isItBullish = heikinAshi.bullish.slice(-3)
    
    const shortTradeTrigger =  isItDoji[isItDoji.length-2+indexOffset[0]] && isItBearish[isItBearish.length-1+indexOffset[0]]
    const longTradeTrigger = isItDoji[isItDoji.length-2+indexOffset[0]] && isItBullish[isItBullish.length-1+indexOffset[0]]
    
    const slLong = Number((markPrice - atrSLF[atrSLF.length-1+indexOffset[0]].atr * SLmultiplier))
    const tpLong = Number((markPrice + atrSLF[atrSLF.length-1+indexOffset[0]].atr * TPmultiplier))
    const slShort = Number((markPrice + atrSLF[atrSLF.length-1+indexOffset[0]].atr * SLmultiplier))
    const tpShort = Number((markPrice - atrSLF[atrSLF.length-1+indexOffset[0]].atr * TPmultiplier))
    
    //orderInfo.sl = orderInfo.side === "SHORT" ? Number(markPrice*(1+SL)) : Number(markPrice*(1-SL))
    //orderInfo.tp = orderInfo.side === "SHORT" ? Number(markPrice*(1-TP)) : Number(markPrice*(1+TP))

    if(shortTradeTrigger){
        //orderInfo.side = "SHORT"
        //shortOrder({slShort , tpShort ,symbol})
        //sendTelegramMessage(`${symbol} Short trade : Mark Price :${markPrice.toFixed(2)} , SL: ${slShort.toFixed(3)} , TP: ${tpShort.toFixed(3)}`)
        sendTelegramMessage(`${symbol} Short trade : Mark Price :${markPrice.toFixed(2)}`)
    }
    
    if(longTradeTrigger){
        //orderInfo.side = "LONG"
        //longOrder({slLong , tpLong ,symbol})
        //sendTelegramMessage(`${symbol} Long trade : Mark Price :${markPrice.toFixed(2)} , SL: ${slLong.toFixed(3)} , TP: ${tpLong.toFixed(3)} `)
        sendTelegramMessage(`${symbol} Long trade : Mark Price :${markPrice.toFixed(2)}`)
    }
    
    console.log("-----------------------------------------------------")
    console.log(new Date())
    console.log(symbol)
    console.log("Doji :" , heikinAshi.newDoji.slice(-3))
    console.log("Bearish :" , heikinAshi.bearish.slice(-3))
    console.log("Bullish :" ,heikinAshi.bullish.slice(-3))
    
    console.log("Trigger : " , shortTradeTrigger)
    console.log( "Trigger : " , longTradeTrigger)
    
    console.log("ATR:",(atrSLF[atrSLF.length-1+indexOffset[0]].atr).toFixed(2) ,
                 "SL:" ,(atrSLF[atrSLF.length-1+indexOffset[0]].atr * SLmultiplier).toFixed(2),
                 "TP:" ,(atrSLF[atrSLF.length-1+indexOffset[0]].atr * TPmultiplier).toFixed(2)
                )
}

export default stochRsiStrategy