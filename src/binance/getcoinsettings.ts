import { BinanceClient } from "./connection.js"
import fs from "fs"

type coinSettings = {
    symbol:string
    pair:string
    baseAsset:string
    quoteAsset:string
    pricePrecision:number
    quantityPrecision:number
    priceFilter:Object
    lotFilter:Object
    marketLotFilter:Object
}

(async () =>{
    const info:Array<any>=[]
    const coinSettings :Array<coinSettings>=[]
    await BinanceClient.futuresExchangeInfo().then((response:Promise<Array>)=>info.push(response.symbols));

    info[0].map((element:any)=>{
        const oneSymbolInfo = {
            symbol:element.symbol,
            pair:element.pair,
            baseAsset:element.baseAsset,
            quoteAsset:element.quoteAsset,
            pricePrecision:element.pricePrecision,
            quantityPrecision:element.quantityPrecision,
            priceFilter:element.filters[0],
            lotFilter:element.filters[1],
            marketLotFilter:element.filters[2]
        }
        coinSettings.push(oneSymbolInfo)
    })

    const jsonData = JSON.stringify(coinSettings, null, 2);

    fs.writeFile("./src/binance/coinsettings2.json", jsonData, 'utf8', (err) => {
        if (err) {
            console.error('Error writing to file', err);
        } else {
            console.log('Data written to file');
        }
    })
    fs.readFile("./src/binance/coinsettings2.json" , (error , data )=>{

        if(error){
            console.log(error)
        }

        const coinSettings = JSON.parse(data)
        console.log(coinSettings[158])
    })
})()