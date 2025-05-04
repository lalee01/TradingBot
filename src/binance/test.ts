import { BinanceClient } from "./connection.js"
import getKlines from "./query/klines.js"

(async () =>{
    const time = await BinanceClient.useServerTime().catch((err:Error)=>console.log(err))
    const klines = await getKlines("ADAUSDC") ?? []

})()