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
    lastema:number
    atrSLF: Array <{high:number , low:number , atr:number}>
    symbol: String
}

const SLmultiplier = Number(process.env.RISK ?? 1)
const TPmultiplier = Number(process.env.REWARD ?? 2)

const orderInfo = {
    side : "SHORT",
    sl : 0,
    tp : 0
}

const newSrsiStrategy = async ({srsi , klines , lastema , atrSLF,symbol}: Options) => {

    const srsiDLines : number[] = []
    const srsiKLines : number[] = []

    srsi.map((item)=>{
        srsiDLines.push(item.d)
        srsiKLines.push(item.k)
    })
    
    const even = (element:Boolean) => element === true
    const crossedShort = crossDown({lineA : srsiKLines , lineB : srsiDLines}).slice(-3)
    const crossedLong = crossUp({lineA : srsiKLines , lineB : srsiDLines}).slice(-3)
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
    
    const shortTradeTrigger =  lastema > markPrice && crossedShort.some(even)
    const longTradeTrigger = lastema < markPrice && crossedLong.some(even)
    
    const slLong = Number((markPrice - atrSLF[atrSLF.length-1+indexOffset[0]].atr * SLmultiplier))
    const tpLong = Number((markPrice + atrSLF[atrSLF.length-1+indexOffset[0]].atr * TPmultiplier))
    const slShort = Number((markPrice + atrSLF[atrSLF.length-1+indexOffset[0]].atr * SLmultiplier))
    const tpShort = Number((markPrice - atrSLF[atrSLF.length-1+indexOffset[0]].atr * TPmultiplier))
    

    if(shortTradeTrigger){
        //orderInfo.side = "SHORT"
        //shortOrder({slShort , tpShort ,symbol})
        sendTelegramMessage(`${symbol} Short trade : Mark Price :${markPrice.toFixed(2)} , SL: ${slShort.toFixed(3)} , TP: ${tpShort.toFixed(3)}`)
        //sendTelegramMessage(`${symbol} Short trade : Mark Price :${markPrice.toFixed(2)}`)
    }
    
    if(longTradeTrigger){
        //orderInfo.side = "LONG"
        //longOrder({slLong , tpLong ,symbol})
        sendTelegramMessage(`${symbol} Long trade : Mark Price :${markPrice.toFixed(2)} , SL: ${slLong.toFixed(3)} , TP: ${tpLong.toFixed(3)} `)
       // sendTelegramMessage(`${symbol} Long trade : Mark Price :${markPrice.toFixed(2)}`)
    }
    
    console.log("-----------------------------------------------------")
    console.log(new Date())
    console.log(symbol)
    console.log("Trigger : " , shortTradeTrigger)
    console.log( "Trigger : " , longTradeTrigger)
    
    console.log("ATR:",(atrSLF[atrSLF.length-1+indexOffset[0]].atr).toFixed(2) ,
                 "SL:" ,(atrSLF[atrSLF.length-1+indexOffset[0]].atr * SLmultiplier).toFixed(2),
                 "TP:" ,(atrSLF[atrSLF.length-1+indexOffset[0]].atr * TPmultiplier).toFixed(2)
                )
}

export default newSrsiStrategy