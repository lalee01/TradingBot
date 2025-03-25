import { crossDown, crossUp} from 'technicalindicators'
import {BinanceClient}  from './../binance/connection'
import { Klines } from './../binance/query/klines'
import sendTelegramMessage from './../telegram/telegram'
import 'dotenv/config'
import { StochasticRSIOutput } from 'technicalindicators/declarations/momentum/StochasticRSI'
import { longOrder, shortOrder } from './../binance/sendorder'
import riskManagement from './../binance/riskmanagement'

type Options = {
    srsi: StochasticRSIOutput[]
    klines:Klines[]
    lastema:number
    atrSLF: Array <{high:number , low:number , atr:number}>
    symbol: String
}

const risk = Number(process.env.RISK ?? 1)
const reward = Number(process.env.REWARD ?? 2)

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
    const time = await BinanceClient.useServerTime().catch((err:Error)=>console.log(err))
    
    const lastItemIndex=(item:number[] | object[])=>{
        const lastCandleCloseTime = klines[klines.length - 1].closeTime
        let offset = 0
        time.serverTime > lastCandleCloseTime ? offset = 0 : offset = -1
        return item.length-1+offset
    }
    
    const getMarkPrice = await BinanceClient.futuresMarkPrice(symbol).catch((e:Error)=>console.log(e))
    const markPrice = Number(getMarkPrice.markPrice)
    
    const shortTradeTrigger =  lastema > markPrice && crossedShort.some(even) && srsiDLines[lastItemIndex(srsiDLines)]>80 && srsiKLines[lastItemIndex(srsiKLines)]>80
    const longTradeTrigger = lastema < markPrice && crossedLong.some(even) && srsiDLines[lastItemIndex(srsiDLines)]<20 && srsiKLines[lastItemIndex(srsiKLines)]<20
    
    const slLong = Number(markPrice - atrSLF[lastItemIndex(atrSLF)].atr * risk)
    const tpLong = Number(markPrice + atrSLF[lastItemIndex(atrSLF)].atr * reward)
    const slShort = Number(markPrice + atrSLF[lastItemIndex(atrSLF)].atr * risk)
    const tpShort = Number(markPrice - atrSLF[lastItemIndex(atrSLF)].atr * reward)
    const sizeLong = riskManagement({entryPrice:markPrice,stoplossPrice:slLong,availableBalance:5000})
    const sizeShort = riskManagement({entryPrice:markPrice,stoplossPrice:slShort,availableBalance:5000})
    

    if(shortTradeTrigger){
        //shortOrder({slShort , tpShort ,symbol})
        sendTelegramMessage(`${sizeShort.toFixed(2)},${symbol} Short trade : Mark Price :${markPrice.toFixed(2)} , SL: ${slShort.toFixed(3)} , TP: ${tpShort.toFixed(3)}`)
    }
    
    if(longTradeTrigger){
        //longOrder({slLong , tpLong ,symbol})
       sendTelegramMessage(`${sizeLong.toFixed(2)} , ${symbol} Long trade : Mark Price :${markPrice.toFixed(2)} , SL: ${slLong.toFixed(3)} , TP: ${tpLong.toFixed(3)} `)
    }

    console.log("-----------------------------------------------------")
    console.log(new Date())
    console.log(symbol)
    console.log( "EMA : " , lastema)
    console.log("Trigger : " , shortTradeTrigger)
    console.log( "Trigger : " , longTradeTrigger)
    console.log("crossedShort : " , crossedShort)
    console.log("crossedLong : " , crossedLong)
    console.log("srsiDLines : " , srsiDLines[lastItemIndex(srsiDLines)])
    console.log("srsiKLines : " , srsiKLines[lastItemIndex(srsiKLines)])
    console.log("ATR:",(atrSLF[lastItemIndex(atrSLF)].atr).toFixed(2) ,"TP:" , reward)
}

export default newSrsiStrategy