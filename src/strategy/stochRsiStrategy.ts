import { CandleList, crossDown, crossUp, HeikinAshi} from 'technicalindicators'
import {BinanceClient}  from './../binance/connection'
import getKlines, { Klines } from './../binance/query/klines'
import sendTelegramMessage from './../telegram/telegram'
import 'dotenv/config'
import { StochasticRSIOutput } from 'technicalindicators/declarations/momentum/StochasticRSI'

const CRYPTO_PAIR = process.env.CRYPTO_PAIR

type Options = {
    srsi: StochasticRSIOutput[]
    atr: number[]
    klines:Klines[]
}

const stochRsiStrategy = async ({ srsi, atr, klines}: Options) => {

    const getMarkPrice = await BinanceClient.futuresMarkPrice(CRYPTO_PAIR).catch((e:Error)=>console.log(e))
    const markPrice = Number(getMarkPrice.markPrice)
    const currenctAtr = atr[atr.length-1]

    const indexOffset = []
    const time = await BinanceClient.useServerTime().catch((e:Error)=>console.log(e))
    const lastCandleCloseTime = klines[klines.length - 1].closeTime

    if (time.serverTime > lastCandleCloseTime) {
        indexOffset.push(0)
        console.log("Previous")
                
    }else{
        indexOffset.push(-1)
        console.log("Actual")
    }  

    const srsiDLines : number[] = []
    const srsiKLines : number[] = []

    srsi.map((item)=>{
        srsiDLines.push(item.d)
        srsiKLines.push(item.k)
    })

    const even = (element:Boolean) => element === true
    const crossedShort = crossDown({lineA : srsiKLines , lineB : srsiDLines}).slice(-2)
    const crossedLong = crossUp({lineA : srsiKLines , lineB : srsiDLines}).slice(-2)
    const srsiKDDiff = srsiKLines[srsiKLines.length-1] - srsiDLines[srsiDLines.length-1]

    //// ++++++++ I have to add "Trade is not active from sendorder.ts because it can send more notify => [3 element]"

    const shortTradeTrigger = crossedShort.some(even) && srsiKDDiff < -5 
    const longTradeTrigger = crossedLong.some(even) && srsiKDDiff > 5 

    const isItCrossed = crossedLong[crossedLong.length-1] || crossedShort[crossedShort.length-1]

    const slLong = (markPrice - (currenctAtr / 2)).toFixed(2)
    const tpLong = (markPrice + currenctAtr).toFixed(2)
    const slShort = (markPrice + (currenctAtr / 2)).toFixed(2)
    const tpShort = (markPrice - currenctAtr).toFixed(2)

    if(isItCrossed){
        sendTelegramMessage(`Crossing`)
    }

    if(shortTradeTrigger){
       
        ///shortOrder({slShort , tpShort})
        sendTelegramMessage(`Short trade : Mark Price :${markPrice} , SL: ${slShort} , TP: ${tpShort}`)
    }
    
    if(longTradeTrigger){
    
        ///longOrder({slLong , tpLong})
        sendTelegramMessage(`Long trade : Mark Price :${markPrice} , SL: ${slLong} , TP: ${tpLong} `)
    }
    console.log("-----------------------------------------------------")
    console.log(new Date())
    console.log("ATR : " , currenctAtr)
    console.log(srsi.slice(-3))
    console.log("Index offset : " , -1 + indexOffset[0])
    console.log("Cross to short " , crossedShort , "Trigger : " , shortTradeTrigger , "sRsiDiff:" , srsiKDDiff)
    console.log("Cross to long " , crossedLong , "Trigger : " , longTradeTrigger, "sRsiDiff:" , srsiKDDiff)
}

export default stochRsiStrategy