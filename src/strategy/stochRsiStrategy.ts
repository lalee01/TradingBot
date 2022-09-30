import { CandleList, crossDown, crossUp} from 'technicalindicators'
import getHeikinAshi from './../chart/heikinAshi'
import {BinanceClient}  from './../binance/connection'
import getKlines from './../binance/query/klines'
import stochasticRsi from './../indicator/stochRsi'
import sendTelegramMessage from './../telegram/telegram'
import macdIndicator from './../indicator/macd'
import 'dotenv/config'

const CRYPTO_PAIR = process.env.CRYPTO_PAIR

const stochRsiStrategy = async () => {

    const getMarkPrice = await BinanceClient.futuresMarkPrice(CRYPTO_PAIR).catch((e:Error)=>console.log(e))
    const markPrice = Number(getMarkPrice.markPrice)

    const klines = await getKlines() ?? []
    const heikinAshi = await getHeikinAshi(klines)
    const srsi = stochasticRsi(heikinAshi, {})

    
    const takeProfitLong20 = Number((markPrice * 1.03).toFixed(2))
    const stopLossLong20 = Number((markPrice * 0.985).toFixed(2))
    const takeProfitShort80 = Number((markPrice * 0.97).toFixed(2))
    const stopLossShort80 = Number((markPrice * 1.015).toFixed(2))
    
    const tpXLong = Number((markPrice * 1.01).toFixed(2))
    const slXLong = Number((markPrice * 0.995).toFixed(2))
    const tpXShort = Number((markPrice * 0.99).toFixed(2))
    const slXShort = Number((markPrice * 1.005).toFixed(2))
    
    const isItShadowed : boolean[]= []

/*

    for(let i=0 ; i < heikinAshi.close.length ;i++){
        if(heikinAshi.close[i] !== heikinAshi.low[i] && heikinAshi.close[i] !== heikinAshi.high[i] &&
            heikinAshi.open[i] !== heikinAshi.low[i] && heikinAshi.open[i] !== heikinAshi.high[i]){
                isItShadowed.push(true)
            }else{
                isItShadowed.push(false)
            }
    }
*/
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

    const crossedShort = crossDown({lineA : srsiKLines , lineB : srsiDLines})
    const crossedLong = crossUp({lineA : srsiKLines , lineB : srsiDLines})

    const target80Short = srsiKLines[srsiKLines.length-1+indexOffset[0]] <= 80 && srsiKLines[srsiKLines.length-2+indexOffset[0]] >= 80 
    const target20Long = srsiKLines[srsiKLines.length-1+indexOffset[0]] >= 20 && srsiKLines[srsiKLines.length-2+indexOffset[0]] <= 20 

    const simpleXLong = crossedShort[crossedLong.length-1+indexOffset[0]] &&  srsiDLines[srsiDLines.length-1+indexOffset[0]] >= 20
    const simpleXShort = crossedShort[crossedShort.length-1+indexOffset[0]] && srsiDLines[srsiDLines.length-1+indexOffset[0]] <= 80
    
    const shortTradeTrigger = false
    const longTradeTrigger = false

    const targetCrossingShort = crossedShort || target80Short || simpleXShort
    const targetCrossingLong = crossedLong || target20Long || simpleXLong

    if(targetCrossingLong){
        sendTelegramMessage(`Target crossing Long `)
    }
    if(targetCrossingShort){
        sendTelegramMessage(`Target crossing Short`)
    }


    if(shortTradeTrigger){
        const limitOrders = {
            sl:stopLossShort80,
            tp:takeProfitShort80
        }
        if(simpleXShort){
            limitOrders.sl =  slXShort, 
            limitOrders.tp = tpXShort
        }
    
        ///shortOrder({stopLossShort , takeProfitShort})
        sendTelegramMessage(`Short trade : Mark Price :${markPrice} , SL: ${limitOrders.sl} , TP: ${limitOrders.tp}`)
    }
    
    if(longTradeTrigger){
        const limitOrders = {
            sl:stopLossLong20,
            tp:takeProfitLong20
        }
        if(simpleXLong){
            limitOrders.sl =  slXLong, 
            limitOrders.tp = tpXLong
        }
    
        ///longOrder({stopLossLong , takeProfitLong})
        sendTelegramMessage(`Long trade : Mark Price :${markPrice} , SL: ${limitOrders.sl} , TP: ${limitOrders.tp} `)
    }
    console.log("-----------------------------------------------------")
    console.log(srsi.slice(-3))
    console.log("Index offset : " , -1 + indexOffset[0])
    console.log("Cross to short " , crossedShort.slice(-3) , "Trigger : " , shortTradeTrigger , "X:" , simpleXShort)
    console.log("Cross to long " , crossedLong.slice(-3) , "Trigger : " , longTradeTrigger, "X:" , simpleXLong)
}

export default stochRsiStrategy