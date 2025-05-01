import { crossDown, crossUp} from 'technicalindicators'
import {BinanceClient}  from './../binance/connection'
import { Klines } from './../binance/query/klines'
import sendTelegramMessage from './../telegram/telegram'
import 'dotenv/config'
import { StochasticRSIOutput } from 'technicalindicators/declarations/momentum/StochasticRSI'
import { longOrder, shortOrder } from './../binance/sendorder'
import riskManagement from './../binance/riskmanagement'
import getBalance from './../binance/getbalance'

type Options = {
    srsi: StochasticRSIOutput[]
    klines:Klines[]
    lastema:number
    atrSLF: Array <{high:number , low:number , atr:number}>
    symbol: String
}

const reward = Number(process.env.REWARD ?? 2)
const atrMultiplierSL = Number(process.env.ATR_MULTIPLIER_SL ?? 1)
const multiCoin = JSON.parse(process.env.MULTI_CRYPTO_PAIR ?? '')
const minKDDiff = Number(process.env.KDDIFF ?? 1)

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
    const balance = await getBalance("USDC")
    
    const lastItemIndex=(item:number[] | object[])=>{

        const lastCandleCloseTime = klines[klines.length - 1].closeTime
        let offset = 0
        time.serverTime > lastCandleCloseTime ? offset = 0 : offset = -1
        return item.length-1+offset
    }
    
    const getMarkPrice = await BinanceClient.futuresMarkPrice(symbol).catch((e:Error)=>console.log(e))
    const markPrice = Number(getMarkPrice.markPrice)
    const kdDiffcalc = Math.abs(srsiKLines[lastItemIndex(srsiKLines)] - srsiDLines[lastItemIndex(srsiDLines)]) > minKDDiff
    
    const shortTradeTrigger =  lastema > markPrice && crossedShort.some(even) && srsiDLines[lastItemIndex(srsiDLines)]>80 && srsiKLines[lastItemIndex(srsiKLines)]>80 && kdDiffcalc
    const longTradeTrigger = lastema < markPrice && crossedLong.some(even) && srsiDLines[lastItemIndex(srsiDLines)]<20 && srsiKLines[lastItemIndex(srsiKLines)]<20 && kdDiffcalc
    
    const slLong = Number(markPrice - atrSLF[lastItemIndex(atrSLF)].atr * atrMultiplierSL)
    const tpLong = Number(markPrice + atrSLF[lastItemIndex(atrSLF)].atr * reward)
    const slShort = Number(markPrice + atrSLF[lastItemIndex(atrSLF)].atr * atrMultiplierSL)
    const tpShort = Number(markPrice - atrSLF[lastItemIndex(atrSLF)].atr * reward)
    const sizeLong = riskManagement({entryPrice:markPrice,stoplossPrice:slLong,availableBalance:balance.balance})
    const sizeShort = riskManagement({entryPrice:markPrice,stoplossPrice:slShort,availableBalance:balance.balance})
    const leverage =Number(((markPrice*sizeLong)/balance.availableBalance*multiCoin.length).toFixed(0))+1

    if(shortTradeTrigger){
        sendTelegramMessage(`Size: ${sizeShort.toFixed(3)},Leverage:${leverage}, ${symbol}, Short trade : Mark Price :${markPrice.toFixed(2)} , SL: ${slShort.toFixed(2)} , TP: ${tpShort.toFixed(2)}`)
        shortOrder({slShort , tpShort ,symbol ,sizeShort ,leverage})
    }
    
    if(longTradeTrigger){
        sendTelegramMessage(`Size: ${sizeLong.toFixed(3)} ,Leverage:${leverage}, ${symbol} Long trade : Mark Price :${markPrice.toFixed(2)} , SL: ${slLong.toFixed(2)} , TP: ${tpLong.toFixed(2)} `)
        longOrder({slLong , tpLong ,symbol ,sizeLong ,leverage})
    }

    console.log("-----------------------------------------------------")
    console.log(new Date())
    console.log(symbol)
    //console.log( "EMA : " , lastema)
    console.log("Trigger : " , shortTradeTrigger)
    console.log( "Trigger : " , longTradeTrigger)
    //console.log("crossedShort : " , crossedShort)
    //console.log("crossedLong : " , crossedLong)
    //console.log("srsiDLines : " , srsiDLines[lastItemIndex(srsiDLines)])
    //console.log("srsiKLines : " , srsiKLines[lastItemIndex(srsiKLines)])
    console.log("ATR:",(atrSLF.atr))
}

export default newSrsiStrategy