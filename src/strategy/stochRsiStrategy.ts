import { crossDown, crossUp} from 'technicalindicators'
import getHeikinAshi from 'src/chart/heikinAshi'
import { BinanceClient } from 'src/binance/connection'
import getKlines from 'src/binance/query/klines'
import stochasticRsi from 'src/indicator/stochRsi'
import sendTelegramMessage from 'src/telegram/telegram'

const CRYPTO_PAIR = process.env.CRYPTO_PAIR

const stochRsiStrategy = async () => {

    const getMarkPrice = await BinanceClient.futuresMarkPrice(CRYPTO_PAIR).catch((e:Error)=>console.log(e))
    const markPrice = Number(getMarkPrice.markPrice)

    const klines = await getKlines() ?? []
    const heikinAshi = await getHeikinAshi(klines)
    const srsi = stochasticRsi(heikinAshi, {})

    const takeProfitLong = (markPrice * 1.03).toFixed(2)
    const stopLossLong = (markPrice * 0.985).toFixed(2)
    const takeProfitShort = (markPrice * 0.97).toFixed(2)
    const stopLossShort = (markPrice * 1.015).toFixed(2)

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
    //srsi[srsi.length-1+indexOffset[0]].k < srsi[srsi.length-1+indexOffset[0]].d && 
    //                        srsi[srsi.length-2+indexOffset[0]].k > srsi[srsi.length-2+indexOffset[0]].d 

    const crossedLong = crossUp({lineA : srsiKLines , lineB : srsiDLines})
    //srsi[srsi.length-1+indexOffset[0]].k > srsi[srsi.length-1+indexOffset[0]].d && 
    //                      srsi[srsi.length-2+indexOffset[0]].k < srsi[srsi.length-2+indexOffset[0]].d
    
    const shortTradeTrigger = crossedShort[crossedShort.length-1+indexOffset[0]]
    const longTradeTrigger = crossedLong[crossedLong.length-1+indexOffset[0]]

    if(shortTradeTrigger){
    
        ///shortOrder({stopLossShort , takeProfitShort})
        sendTelegramMessage(`Short trade : Mark Price :${markPrice} , Take Profit:${takeProfitShort} , Stop Loss:${stopLossShort}  Act`)
    }
    
    if(longTradeTrigger){
    
        ///longOrder({stopLossLong , takeProfitLong})
        sendTelegramMessage(`Long trade : Mark Price :${markPrice} , Take Profit:${takeProfitLong} , Stop Loss:${stopLossLong}  Act`)
    }
    
    console.log("Cross to short " , crossedShort , "Trigger : " , shortTradeTrigger)
    console.log("Cross to long " , crossedLong , "Trigger : " , longTradeTrigger)
}

export default stochRsiStrategy