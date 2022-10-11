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
    heikinAshi: CandleList & { bearish: boolean[], bullish: boolean[], doji: boolean[]}
}

const stochRsiStrategy = async ({ srsi, atr, klines , heikinAshi}: Options) => {

    const getMarkPrice = await BinanceClient.futuresMarkPrice(CRYPTO_PAIR).catch((e:Error)=>console.log(e))
    const markPrice = Number(getMarkPrice.markPrice)
    const currenctAtr = atr[atr.length-1]

    const srsiDLines : number[] = []
    const srsiKLines : number[] = []

    srsi.map((item)=>{
        srsiDLines.push(item.d)
        srsiKLines.push(item.k)
    })

    const even = (element:Boolean) => element === true
    const crossedShort = crossDown({lineA : srsiKLines , lineB : srsiDLines}).slice(-3)
    const crossedLong = crossUp({lineA : srsiKLines , lineB : srsiDLines}).slice(-3)
    const srsiKDDiff = srsiKLines[srsiKLines.length-1] - srsiDLines[srsiDLines.length-1]

    const isItDoji = heikinAshi.doji.slice(-3).some(even)
    const isItBearish = heikinAshi.bearish.slice(-3).some(even)
    const isItBullish = heikinAshi.bullish.slice(-3).some(even)

    const shortTradeTrigger = crossedShort.some(even) && srsiKDDiff < -6 && isItDoji && isItBearish
    const longTradeTrigger = crossedLong.some(even) && srsiKDDiff > 6 && isItDoji && isItBullish

    const slLong = (markPrice - (currenctAtr / 2)).toFixed(2)
    const tpLong = (markPrice + currenctAtr).toFixed(2)
    const slShort = (markPrice + (currenctAtr / 2)).toFixed(2)
    const tpShort = (markPrice - currenctAtr).toFixed(2)

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
    console.log("Doji :" , heikinAshi.doji.slice(-3))
    console.log("Bearish :" , heikinAshi.bearish.slice(-3))
    console.log("Bullish :" ,heikinAshi.bullish.slice(-3))

    console.log("Cross to short " , crossedShort , "Trigger : " , shortTradeTrigger , "sRsiDiff:" , srsiKDDiff)
    console.log("Cross to long " , crossedLong , "Trigger : " , longTradeTrigger, "sRsiDiff:" , srsiKDDiff)
}

export default stochRsiStrategy