import { CandleList, crossDown, crossUp} from 'technicalindicators'
import {BinanceClient}  from './../binance/connection'
import getKlines, { Klines } from './../binance/query/klines'
import sendTelegramMessage from './../telegram/telegram'
import 'dotenv/config'
import exponentialMovingAverage from './../indicator/ema'
import { StochasticRSIOutput } from 'technicalindicators/declarations/momentum/StochasticRSI'
import { longOrder, shortOrder } from './../binance/sendorder'

const CRYPTO_PAIR = process.env.CRYPTO_PAIR

type Options = {
    srsi: StochasticRSIOutput[]
    klines:Klines[]
    heikinAshi: CandleList & { bearish: boolean[], bullish: boolean[], doji: boolean[]}
}

const stochRsiStrategy = async ({ srsi ,klines , heikinAshi}: Options) => {

    const getMarkPrice = await BinanceClient.futuresMarkPrice(CRYPTO_PAIR).catch((e:Error)=>console.log(e))
    const markPrice = Number(getMarkPrice.markPrice)

    const indexOffset = []
    const time = await BinanceClient.useServerTime().catch((err:Error)=>console.log(err))
    const lastCandleCloseTime = klines[klines.length - 1].closeTime
    const ema50 = exponentialMovingAverage(klines , {period : 50 , smaPeriod: 5})
    const lastema = Number(ema50[ema50.length-1].toFixed(2))

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

    const shortTradeTrigger =  isItDoji[isItDoji.length-2+indexOffset[0]] && isItBearish[isItBearish.length-1+indexOffset[0]] && markPrice < lastema && crossedShort.some(even)
    const longTradeTrigger = isItDoji[isItDoji.length-2+indexOffset[0]] && isItBullish[isItBullish.length-1+indexOffset[0]] && markPrice > lastema && crossedLong.some(even)

    const slLong = Number((markPrice * 0.998).toFixed(2))
    const tpLong = Number((markPrice * 1.01).toFixed(2))
    const slShort = Number((markPrice * 1.002).toFixed(2))
    const tpShort = Number((markPrice * 0.99).toFixed(2))

    if(shortTradeTrigger){
       
        shortOrder({slShort , tpShort})
        sendTelegramMessage(`Short trade : Mark Price :${markPrice} , SL: ${slShort} , TP: ${tpShort}`)
    }
    
    if(longTradeTrigger){
    
        longOrder({slLong , tpLong})
        sendTelegramMessage(`Long trade : Mark Price :${markPrice} , SL: ${slLong} , TP: ${tpLong} `)
    }

    console.log("-----------------------------------------------------")
    console.log(new Date())
    console.log("Doji :" , heikinAshi.doji.slice(-3))
    console.log("Bearish :" , heikinAshi.bearish.slice(-3))
    console.log("Bullish :" ,heikinAshi.bullish.slice(-3))

    console.log("Trigger : " , shortTradeTrigger , "sRsiDiff:" )
    console.log( "Trigger : " , longTradeTrigger, "sRsiDiff:" )
}

export default stochRsiStrategy