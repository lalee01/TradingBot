import Binance from "node-binance-api";
import "dotenv/config";
import sendTelegramMessage from './../telegram/telegram';

type shortProps = {
  stopLossShort : number
  takeProfitShort: number
}

type longProps = {
  stopLossLong : number
  takeProfitLong: number
}

const binance = new Binance().options({
  APIKEY: process.env.FAPIKEY,
  APISECRET: process.env.FAPISECRET,
});

export const accountInfo = {
  balance : 0 ,
  wasActiveOrder : false,
  quantityForTrade : 0
}

const leverage = 10
const symbol = "ETHBUSD"

const account = async () => {
  await binance.useServerTime()
  await binance.futuresBalance().then((response: { availableBalance: number; }[])=>{
    accountInfo.balance = response[9].availableBalance
  })
}

const getActiveOrders = async () => {
  await account()
  await binance.futuresBalance().then(()=>{
    if(accountInfo.balance <5){
      accountInfo.wasActiveOrder = true
    }else{
      accountInfo.wasActiveOrder = false
    }
  })
}

export const longOrder = async ({stopLossLong , takeProfitLong} : longProps) =>{
  
  await account()
  await getActiveOrders()

  const getMarkPrice = await binance.futuresMarkPrice(symbol)
  const quantity = ((accountInfo.balance*leverage)/getMarkPrice.markPrice * 0.9).toFixed(3)
  
  if(accountInfo.wasActiveOrder === false) {
    await binance.useServerTime()
    await binance.futuresMarginType( symbol, 'ISOLATED' ).then((res:any) => console.log(res))
    await binance.futuresLeverage( symbol, leverage ).then((res:any) => console.log(res))
    await binance.futuresMarketBuy( symbol, quantity ).then((res:any) => console.log(res))
    
    await binance.futuresOrder( "SELL" , symbol, 0 , 0 , {
      type:"STOP_MARKET" , 
      stopPrice: stopLossLong ,
      workingType: 'MARK_PRICE' , 
      priceProtect: true ,
      closePosition: true,
      timeInForce: 'GTE_GTC',
    }).then((res:any) => console.log(res))

    await binance.futuresOrder( "SELL" , symbol, 0 , 0 , {
      type:"TAKE_PROFIT_MARKET" , 
      stopPrice: takeProfitLong ,
      workingType: 'MARK_PRICE' , 
      priceProtect: true ,
      closePosition: true,
      timeInForce: 'GTE_GTC',
    }).then((res:any) => console.log(res))

    sendTelegramMessage("Long order sent")
  }
}

export const shortOrder = async ({stopLossShort , takeProfitShort}:shortProps) =>{

  await account()
  await getActiveOrders()

  const getMarkPrice = await binance.futuresMarkPrice(symbol)
  const quantity = ((accountInfo.balance*leverage)/getMarkPrice.markPrice * 0.9).toFixed(3)

  if(accountInfo.wasActiveOrder === false) {
    await binance.useServerTime()
    await binance.futuresMarginType( symbol, 'ISOLATED' ).then((res:any) => console.log(res))
    await binance.futuresLeverage( symbol, leverage ).then((res:any) => console.log(res))
    await binance.futuresMarketSell( symbol, quantity ).then((res:any) => console.log(res))
    
    await binance.futuresOrder( "BUY" , symbol, 0 , 0 , {
      type:"STOP_MARKET" , 
      stopPrice: stopLossShort ,
      workingType: 'MARK_PRICE' , 
      priceProtect: true ,
      closePosition: true,
      timeInForce: 'GTE_GTC',
    }).then((res: any) => console.log(res))
    
    await binance.futuresOrder( "BUY" , symbol, 0 , 0 , {
      type:"TAKE_PROFIT_MARKET" , 
      stopPrice: takeProfitShort ,
      workingType: 'MARK_PRICE' , 
      priceProtect: true ,
      closePosition: true,
      timeInForce: 'GTE_GTC',
    }).then((res: any) => console.log(res))

    sendTelegramMessage("Short order sent")
  }
}