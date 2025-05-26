import "dotenv/config";
import sendTelegramMessage from './../telegram/telegram';
import { BinanceClient } from "./connection";
import { coinSettingstype } from "./getcoinsettings";

type shortProps = {
  slShort : number
  tpShort: number
  symbol: String
  sizeShort:number
  leverage:number
  coinSetting:coinSettingstype[]
}

type longProps = {
  slLong : number
  tpLong: number
  symbol: String
  sizeLong:number
  leverage:number
  coinSetting:coinSettingstype[]
}

export const longOrder = async ({slLong , tpLong, symbol ,sizeLong, leverage ,coinSetting} : longProps) =>{
  
  const indexFinder = (element :coinSettingstype) => element.symbol === symbol
  
  const quantityToOrder = sizeLong.toFixed(coinSetting[coinSetting.findIndex(indexFinder)].quantity)
  const convertedSL = slLong.toFixed(coinSetting[coinSetting.findIndex(indexFinder)].price)
  const convertedTP = tpLong.toFixed(coinSetting[coinSetting.findIndex(indexFinder)].price)
  
    await BinanceClient.useServerTime()
    await BinanceClient.futuresLeverage( symbol, leverage ).then((res:any) => console.log(res))
    await BinanceClient.futuresMarketBuy( symbol, quantityToOrder ).then((res:any) => console.log(res))
    
    await BinanceClient.futuresOrder( "SELL" , symbol, 0 , 0 , {
      type:"STOP_MARKET" , 
      stopPrice: convertedSL ,
      workingType: 'CONTRACT_PRICE' , 
      priceProtect: true ,
      closePosition: true,
      timeInForce: 'GTE_GTC',
    }).then((res:any) => console.log(res))

    await BinanceClient.futuresOrder( "SELL" , symbol, 0 , 0 , {
      type:"TAKE_PROFIT_MARKET" , 
      stopPrice: convertedTP ,
      workingType: 'CONTRACT_PRICE' , 
      priceProtect: true ,
      closePosition: true,
      timeInForce: 'GTE_GTC',
    }).then((res:any) => console.log(res))

    sendTelegramMessage("Long order sent")
}

export const shortOrder = async ({slShort , tpShort ,symbol, sizeShort,leverage,coinSetting}:shortProps) =>{
  const indexFinder = (element :coinSettingstype) => element.symbol === symbol
  
  const quantityToOrder = sizeShort.toFixed(coinSetting[coinSetting.findIndex(indexFinder)].quantity)
  const convertedSL = slShort.toFixed(coinSetting[coinSetting.findIndex(indexFinder)].price)
  const convertedTP = tpShort.toFixed(coinSetting[coinSetting.findIndex(indexFinder)].price)

    await BinanceClient.useServerTime()
    await BinanceClient.futuresLeverage( symbol, leverage ).then((res:any) => console.log(res))
    await BinanceClient.futuresMarketSell( symbol, quantityToOrder ).then((res:any) => console.log(res))
    
    await BinanceClient.futuresOrder( "BUY" , symbol, 0 , 0 , {
      type:"STOP_MARKET" , 
      stopPrice: convertedSL ,
      workingType: 'CONTRACT_PRICE' , 
      priceProtect: true ,
      closePosition: true,
      timeInForce: 'GTE_GTC',
    }).then((res: any) => console.log(res))
    
    await BinanceClient.futuresOrder( "BUY" , symbol, 0 , 0 , {
      type:"TAKE_PROFIT_MARKET" , 
      stopPrice: convertedTP ,
      workingType: 'CONTRACT_PRICE' , 
      priceProtect: true ,
      closePosition: true,
      timeInForce: 'GTE_GTC',
    }).then((res: any) => console.log(res))

    sendTelegramMessage("Short order sent")
  
}