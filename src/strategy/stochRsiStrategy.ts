import { CandleList, crossDown, crossUp , doji } from 'technicalindicators'
import {BinanceClient}  from './../binance/connection'
import getKlines, { Klines } from './../binance/query/klines'
import sendTelegramMessage from './../telegram/telegram'
import 'dotenv/config'
import exponentialMovingAverage from './../indicator/ema'
import { StochasticRSIOutput } from 'technicalindicators/declarations/momentum/StochasticRSI'
import { longOrder, shortOrder } from './../binance/sendorder'

type Options = {
    srsi: StochasticRSIOutput[]
    klines:Klines[]
    heikinAshi: CandleList & { bearish: boolean[], bullish: boolean[], doji: boolean[] , newDoji: boolean[]}
    atrSLF: Array <{high:number , low:number , atr:number}>
    symbol: String
}
/*
type Order = {
    type:string
    sl:number
    tp:number
}
*/

const multiplier = 0.5

const orderInfo = {
    side : "SHORT",
    sl : 0,
    tp : 0
}

const stochRsiStrategy = async ({ srsi ,klines , heikinAshi , atrSLF,symbol}: Options) => {

    const indexOffset = []
    const time = await BinanceClient.useServerTime().catch((err:Error)=>console.log(err))
    const lastCandleCloseTime = klines[klines.length - 1].closeTime
    const ema200 = exponentialMovingAverage(klines , {period : 200 , smaPeriod: 5})
    const lastema = Number(ema200[ema200.length-1].toFixed(2))
    
    if (time.serverTime > lastCandleCloseTime) {
        indexOffset.push(0)
        
    }else{
        indexOffset.push(-1)
    }  
    
    const getMarkPrice = await BinanceClient.futuresMarkPrice(symbol).catch((e:Error)=>console.log(e))
    const markPrice = Number(getMarkPrice.markPrice)
    
    const isItDoji = heikinAshi.doji.slice(-3)
    const isItBearish = heikinAshi.bearish.slice(-3)
    const isItBullish = heikinAshi.bullish.slice(-3)
    
    const shortTradeTrigger =  isItDoji[isItDoji.length-2+indexOffset[0]] && markPrice < lastema && isItBearish[isItBearish.length-1+indexOffset[0]]
    const longTradeTrigger = isItDoji[isItDoji.length-2+indexOffset[0]] && markPrice > lastema && isItBullish[isItBullish.length-1+indexOffset[0]]
    
    const slLong = (markPrice - atrSLF[atrSLF.length-1+indexOffset[0]].atr * multiplier).toFixed(4) ///Number((markPrice * 0.9965).toFixed(2))
    const tpLong = (markPrice + atrSLF[atrSLF.length-1+indexOffset[0]].atr * multiplier).toFixed(4) ///Number((markPrice * 1.005).toFixed(2))
    const slShort = (markPrice + atrSLF[atrSLF.length-1+indexOffset[0]].atr * multiplier).toFixed(4)  ///Number((markPrice * 1.0035).toFixed(2))
    const tpShort = (markPrice - atrSLF[atrSLF.length-1+indexOffset[0]].atr * multiplier).toFixed(4)  ///Number((markPrice * 0.995).toFixed(2))
    
    //orderInfo.sl = orderInfo.side === "SHORT" ? Number(markPrice*(1+SL)) : Number(markPrice*(1-SL))
    //orderInfo.tp = orderInfo.side === "SHORT" ? Number(markPrice*(1-TP)) : Number(markPrice*(1+TP))

    if(shortTradeTrigger){
        //orderInfo.side = "SHORT"
        //shortOrder({slShort , tpShort ,symbol})
        sendTelegramMessage(`${symbol} Short trade : Mark Price :${markPrice} , SL: ${slShort} , TP: ${tpShort}`)
    }
    
    if(longTradeTrigger){
        //orderInfo.side = "LONG"
        //longOrder({slLong , tpLong ,symbol})
        sendTelegramMessage(`${symbol} Long trade : Mark Price :${markPrice} , SL: ${slLong} , TP: ${tpLong} `)
    }
    
    console.log("-----------------------------------------------------")
    console.log(new Date())
    console.log(symbol)
    console.log("Doji :" , heikinAshi.doji.slice(-3))
    console.log("Bearish :" , heikinAshi.bearish.slice(-3))
    console.log("Bullish :" ,heikinAshi.bullish.slice(-3))
    
    console.log("Trigger : " , shortTradeTrigger)
    console.log( "Trigger : " , longTradeTrigger)
    
    console.log(atrSLF[atrSLF.length-1])
    console.log(heikinAshi.newDoji.slice(-30))
}

export default stochRsiStrategy