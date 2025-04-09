import "dotenv/config";
import sendTelegramMessage from './../telegram/telegram';
import coinSettings from './../binance/coinsettings'
import { BinanceClient } from "./connection";

type shortProps = {
  slShort : number
  tpShort: number
  symbol: String
  sizeShort:number
  leverage:number
}

type longProps = {
  slLong : number
  tpLong: number
  symbol: String
  sizeLong:number
  leverage:number
}

type coinSettingsPrefix = {
  symbol : string
  price : number
  quantity: number
}

export const longOrder = async ({slLong , tpLong, symbol ,sizeLong, leverage} : longProps) =>{
  
  const indexFinder = (element :coinSettingsPrefix) => element.symbol === symbol
  
  const quantityToOrder = sizeLong.toFixed(coinSettings[coinSettings.findIndex(indexFinder)].quantity)
  console.log(quantityToOrder)
  const convertedSL = slLong.toFixed(coinSettings[coinSettings.findIndex(indexFinder)].price)
  const convertedTP = tpLong.toFixed(coinSettings[coinSettings.findIndex(indexFinder)].price)
  
    await BinanceClient.useServerTime()
    //await BinanceClient.futuresMarginType( symbol, 'ISOLATED' ).then((res:any) => console.log(res))
    await BinanceClient.futuresLeverage( symbol, leverage ).then((res:any) => console.log(res))
    await BinanceClient.futuresMarketBuy( symbol, quantityToOrder ).then((res:any) => console.log(res))
    
    await BinanceClient.futuresOrder( "SELL" , symbol, 0 , 0 , {
      type:"STOP_MARKET" , 
      stopPrice: convertedSL ,
      workingType: 'MARK_PRICE' , 
      priceProtect: true ,
      closePosition: true,
      timeInForce: 'GTE_GTC',
    }).then((res:any) => console.log(res))

    await BinanceClient.futuresOrder( "SELL" , symbol, 0 , 0 , {
      type:"TAKE_PROFIT_MARKET" , 
      stopPrice: convertedTP ,
      workingType: 'MARK_PRICE' , 
      priceProtect: true ,
      closePosition: true,
      timeInForce: 'GTE_GTC',
    }).then((res:any) => console.log(res))

    sendTelegramMessage("Long order sent")
}

export const shortOrder = async ({slShort , tpShort ,symbol, sizeShort,leverage}:shortProps) =>{

  const indexFinder = (element :coinSettingsPrefix) => element.symbol === symbol
  
  const quantityToOrder = sizeShort.toFixed(coinSettings[coinSettings.findIndex(indexFinder)].quantity)
  const convertedSL = slShort.toFixed(coinSettings[coinSettings.findIndex(indexFinder)].price)
  const convertedTP = tpShort.toFixed(coinSettings[coinSettings.findIndex(indexFinder)].price)

    await BinanceClient.useServerTime()
    //await BinanceClient.futuresMarginType( symbol, 'ISOLATED' ).then((res:any) => console.log(res))
    await BinanceClient.futuresLeverage( symbol, leverage ).then((res:any) => console.log(res))
    await BinanceClient.futuresMarketSell( symbol, quantityToOrder ).then((res:any) => console.log(res))
    
    await BinanceClient.futuresOrder( "BUY" , symbol, 0 , 0 , {
      type:"STOP_MARKET" , 
      stopPrice: convertedSL ,
      workingType: 'MARK_PRICE' , 
      priceProtect: true ,
      closePosition: true,
      timeInForce: 'GTE_GTC',
    }).then((res: any) => console.log(res))
    
    await BinanceClient.futuresOrder( "BUY" , symbol, 0 , 0 , {
      type:"TAKE_PROFIT_MARKET" , 
      stopPrice: convertedTP ,
      workingType: 'MARK_PRICE' , 
      priceProtect: true ,
      closePosition: true,
      timeInForce: 'GTE_GTC',
    }).then((res: any) => console.log(res))

    sendTelegramMessage("Short order sent")
  
}