import Binance from "node-binance-api";
import "dotenv/config";
import sendTelegramMessage from './../telegram/telegram';
import coinSettings from './../binance/coinsettings'

type shortProps = {
  slShort : number
  tpShort: number
  symbol: String
  leverage: number
}

type longProps = {
  slLong : number
  tpLong: number
  symbol: String
  leverage: number
}

type coinSettingsPrefix = {
  symbol : string
  price : number
  quantity: number
}

const binance = new Binance().options({
  APIKEY: process.env.API_KEY,
  APISECRET: process.env.SECRET_KEY,
});

export const accountInfo = {
  balance : 0 ,
  wasActiveOrder : false,
  quantityForTrade : 0
}

const account = async () => {
  await binance.useServerTime()
  await binance.futuresBalance().then((response : any)=>{
    accountInfo.balance = response[8].availableBalance
  })
}

const getActiveOrders = async () => {
  await account()
  await binance.futuresBalance().then(()=>{
    if(accountInfo.balance <2){
      accountInfo.wasActiveOrder = true
    }else{
      accountInfo.wasActiveOrder = false
    }
  })
}

export const longOrder = async ({slLong , tpLong, symbol, leverage} : longProps) =>{
  
  await account()
  await getActiveOrders()

  const getMarkPrice = await binance.futuresMarkPrice(symbol)
  
  const indexFinder = (element :coinSettingsPrefix) => element.symbol === symbol

  const quantity = ((12/getMarkPrice.markPrice)*leverage).toFixed(coinSettings[coinSettings.findIndex(indexFinder)].quantity)
  const convertedSL = slLong.toFixed(coinSettings[coinSettings.findIndex(indexFinder)].price)
  const convertedTP = tpLong.toFixed(coinSettings[coinSettings.findIndex(indexFinder)].price)
  
  if(!accountInfo.wasActiveOrder) {
    await binance.useServerTime()
    await binance.futuresMarginType( symbol, 'ISOLATED' ).then((res:any) => console.log(res))
    await binance.futuresLeverage( symbol, leverage ).then((res:any) => console.log(res))
    await binance.futuresMarketBuy( symbol, quantity ).then((res:any) => console.log(res))
    
    await binance.futuresOrder( "SELL" , symbol, 0 , 0 , {
      type:"STOP_MARKET" , 
      stopPrice: convertedSL ,
      workingType: 'MARK_PRICE' , 
      priceProtect: true ,
      closePosition: true,
      timeInForce: 'GTE_GTC',
    }).then((res:any) => console.log(res))

    await binance.futuresOrder( "SELL" , symbol, 0 , 0 , {
      type:"TAKE_PROFIT_MARKET" , 
      stopPrice: convertedTP ,
      workingType: 'MARK_PRICE' , 
      priceProtect: true ,
      closePosition: true,
      timeInForce: 'GTE_GTC',
    }).then((res:any) => console.log(res))

    sendTelegramMessage("Long order sent")
  }
}

export const shortOrder = async ({slShort , tpShort ,symbol, leverage}:shortProps) =>{

  await account()
  await getActiveOrders()

  const getMarkPrice = await binance.futuresMarkPrice(symbol)
  
  const indexFinder = (element :coinSettingsPrefix) => element.symbol === symbol
  
  const quantity = ((12/getMarkPrice.markPrice)*leverage).toFixed(coinSettings[coinSettings.findIndex(indexFinder)].quantity)
  const convertedSL = slShort.toFixed(coinSettings[coinSettings.findIndex(indexFinder)].price)
  const convertedTP = tpShort.toFixed(coinSettings[coinSettings.findIndex(indexFinder)].price)

  if(!accountInfo.wasActiveOrder) {
    await binance.useServerTime()
    await binance.futuresMarginType( symbol, 'ISOLATED' ).then((res:any) => console.log(res))
    await binance.futuresLeverage( symbol, leverage ).then((res:any) => console.log(res))
    await binance.futuresMarketSell( symbol, quantity ).then((res:any) => console.log(res))
    
    await binance.futuresOrder( "BUY" , symbol, 0 , 0 , {
      type:"STOP_MARKET" , 
      stopPrice: convertedSL ,
      workingType: 'MARK_PRICE' , 
      priceProtect: true ,
      closePosition: true,
      timeInForce: 'GTE_GTC',
    }).then((res: any) => console.log(res))
    
    await binance.futuresOrder( "BUY" , symbol, 0 , 0 , {
      type:"TAKE_PROFIT_MARKET" , 
      stopPrice: convertedTP ,
      workingType: 'MARK_PRICE' , 
      priceProtect: true ,
      closePosition: true,
      timeInForce: 'GTE_GTC',
    }).then((res: any) => console.log(res))

    sendTelegramMessage("Short order sent")
  }
}