import { CandleList} from 'technicalindicators'
import sendTelegramMessage from '../telegram/telegram'
import {BinanceClient}  from '../binance/connection'
import getKlines, { Klines } from './../binance/query/klines'
import 'dotenv/config'
import getHeikinAshi from './../chart/heikinAshi'
import spotGetKlines from './../chart/Spot/spotklines'

type Options = {
    spotSymbol : String
}

type TradeInfo = {
    activeTrade : Boolean
    boughtPrice : number
    sellPrice : number
    numberOfTrade : number
    profit : number
}
// I need:
// X high interval HeikinAshi => trend
// X low interval HeikinAshi => where should i enter to trade
// X actual price when i buy
//  0,2% minimum profit, only sell if last low interval HA is red
//  wallet USDT , BTC

// Telegram message :
// X Bought at 24000 $ for 100$ sell if price reach (24000*1.002)$
// X Sold at 25000$ profit : 1%

const minProfit = 1.002

const tradeInfo : TradeInfo = {
    activeTrade: true,
    boughtPrice: 1,
    sellPrice:0,
    numberOfTrade:0,
    profit:0
}

const freefeebtcspottrade = async ({spotSymbol}: Options) => {
    
    const highKlines = await spotGetKlines(spotSymbol , "1h") ?? []
    const highHeikinAshi = await getHeikinAshi(highKlines)

    const lowKlines = await spotGetKlines(spotSymbol , "5m") ?? []
    const lowHeikinAshi = await getHeikinAshi(lowKlines)

    const indexOffset = []
    const time = await BinanceClient.useServerTime().catch((err:Error)=>console.log(err))
    const lastCandleCloseTime = highKlines[highKlines.length - 1].closeTime
    
    if (time.serverTime > lastCandleCloseTime) {
        indexOffset.push(0)
        
    }else{
        indexOffset.push(-1)
    }  

    const getPrice = await BinanceClient.prices(spotSymbol).catch((e:Error)=>console.log(e))
    const actualPrice = Number(getPrice.BTCUSDT)
    
    const highIsItDoji = highHeikinAshi.newDoji.slice(-3)
    const highIsItBullish = highHeikinAshi.bullish.slice(-3)

    const lowIsItDoji = lowHeikinAshi.newDoji.slice(-3)
    const lowIsItBullish = lowHeikinAshi.bullish.slice(-3)

    const upTrendOnHigh =  highIsItDoji[highIsItDoji.length-2+indexOffset[0]] && highIsItBullish[highIsItBullish.length-1+indexOffset[0]]
    const upTrendOnLow = lowIsItDoji[lowIsItDoji.length-2+indexOffset[0]] && lowIsItBullish[lowIsItBullish.length-1+indexOffset[0]]

    const minSellPrice = actualPrice * minProfit

    const buyTrigger =  upTrendOnHigh && upTrendOnLow && !tradeInfo.activeTrade
    const sellTrigger = tradeInfo.sellPrice > actualPrice && tradeInfo.activeTrade

    const profit = Number((actualPrice / tradeInfo.boughtPrice * 100 -100).toFixed(2))

    if (buyTrigger) {
        sendTelegramMessage(`Buy ${spotSymbol} at ${actualPrice} $ and sell ${minSellPrice}`)
        tradeInfo.activeTrade = true
        tradeInfo.boughtPrice = actualPrice
        tradeInfo.sellPrice = minSellPrice
        tradeInfo.numberOfTrade = tradeInfo.numberOfTrade + 1
    }

    if (sellTrigger) {
        sendTelegramMessage(`Sold ${spotSymbol} at ${actualPrice} $ with profit ${profit} %`)
        tradeInfo.activeTrade = false
        tradeInfo.boughtPrice = 1
        tradeInfo.sellPrice = 0
        tradeInfo.profit = tradeInfo.profit + profit
    }

    console.log("Price:" , actualPrice)
    console.log(profit , "%")
    console.log(tradeInfo)
    console.log()
    console.log("highIsItDoji:" , highIsItDoji)
    console.log("highIsItBullish:" , highIsItBullish)
    console.log("lowIsItDoji:" , lowIsItDoji)
    console.log("lowIsItBullish:" , lowIsItBullish)
}

export default freefeebtcspottrade