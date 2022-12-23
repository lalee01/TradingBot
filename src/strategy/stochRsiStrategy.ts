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
    heikinAshi: CandleList & { bearish: boolean[], bullish: boolean[], doji: boolean[]}
    atrSLF: Array <{high:number , low:number , atr:number}>
}
/*
type Order = {
    type:string
    sl:number
    tp:number
}
*/
const CRYPTO_PAIR = process.env.CRYPTO_PAIR
const TP = Number(process.env.TP)/100
const SL = Number(process.env.SL)/100

const orderInfo = {
    side : "SHORT",
    sl : 0,
    tp : 0
  }


const stochRsiStrategy = async ({ srsi ,klines , heikinAshi , atrSLF}: Options) => {

    const getMarkPrice = await BinanceClient.futuresMarkPrice(CRYPTO_PAIR).catch((e:Error)=>console.log(e))
    const markPrice = Number(getMarkPrice.markPrice)

    const indexOffset = []
    const time = await BinanceClient.useServerTime().catch((err:Error)=>console.log(err))
    const lastCandleCloseTime = klines[klines.length - 1].closeTime
    const ema200 = exponentialMovingAverage(klines , {period : 200 , smaPeriod: 5})
    const lastema = Number(ema200[ema200.length-1].toFixed(2))

    if (time.serverTime > lastCandleCloseTime) {
    indexOffset.push(0)
    console.log("Előző")
            
    }else{
    indexOffset.push(-1)
    console.log("Aktuális")
    }  

    const isItDoji = heikinAshi.doji.slice(-3)
    const isItBearish = heikinAshi.bearish.slice(-3)
    const isItBullish = heikinAshi.bullish.slice(-3)

    const srsiDLines : number[] = []
    const srsiKLines : number[] = []

    srsi.map((item)=>{
        srsiDLines.push(item.d)
        srsiKLines.push(item.k)
    })

    const even = (element:Boolean) => element === true
    const crossedShort = crossDown({lineA : srsiKLines , lineB : srsiDLines}).slice(-3)
    const crossedLong = crossUp({lineA : srsiKLines , lineB : srsiDLines}).slice(-3)

    const shortTradeTrigger =  isItDoji[isItDoji.length-2+indexOffset[0]] && isItBearish[isItBearish.length-1+indexOffset[0]] && markPrice < lastema
    const longTradeTrigger = isItDoji[isItDoji.length-2+indexOffset[0]] && isItBullish[isItBullish.length-1+indexOffset[0]] && markPrice > lastema 

    const slLong = atrSLF[atrSLF.length-1+indexOffset[0]].low ///Number((markPrice * 0.9965).toFixed(2))
    const tpLong = atrSLF[atrSLF.length-1+indexOffset[0]].high ///Number((markPrice * 1.005).toFixed(2))
    const slShort = atrSLF[atrSLF.length-1+indexOffset[0]].high ///Number((markPrice * 1.0035).toFixed(2))
    const tpShort = atrSLF[atrSLF.length-1+indexOffset[0]].low ///Number((markPrice * 0.995).toFixed(2))

    orderInfo.sl = orderInfo.side === "SHORT" ? Number(markPrice*(1+SL)) : Number(markPrice*(1-SL))
    orderInfo.tp = orderInfo.side === "SHORT" ? Number(markPrice*(1-TP)) : Number(markPrice*(1+TP))

    if(shortTradeTrigger){
        orderInfo.side = "SHORT"
        //shortOrder({slShort , tpShort})
        sendTelegramMessage(`Short trade : Mark Price :${markPrice} , SL: ${slShort} , TP: ${tpShort}`)
    }
    
    if(longTradeTrigger){
        orderInfo.side = "LONG"
        //longOrder({slLong , tpLong})
        sendTelegramMessage(`Long trade : Mark Price :${markPrice} , SL: ${slLong} , TP: ${tpLong} `)
    }

    console.log("-----------------------------------------------------")
    //console.log(orderInfo)
    console.log(new Date())
    console.log("Doji :" , heikinAshi.doji.slice(-3))
    console.log("Bearish :" , heikinAshi.bearish.slice(-3))
    console.log("Bullish :" ,heikinAshi.bullish.slice(-3))
    
    console.log("Trigger : " , shortTradeTrigger , "sRsiDiff:" )
    console.log( "Trigger : " , longTradeTrigger, "sRsiDiff:" )
    
    console.log(atrSLF[atrSLF.length-1])
}

export default stochRsiStrategy