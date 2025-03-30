import { BinanceClient } from "./connection"

const getBalance = async (asset:string) =>{
    const balances:Object[[]]=[]
    const indexFinder = (element:Array<Object>) => element.asset === asset
    await BinanceClient.futuresBalance().then((response : any)=>{balances.push(response)})
    const balance = Number(balances[0][balances[0].findIndex(indexFinder)].balance)
    return balance
}
export default getBalance