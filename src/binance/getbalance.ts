import { BinanceClient } from "./connection"

const getBalance = async (asset:string) =>{
    const balances:Array<Object>=[]
    const indexFinder = (element:Array<Object>) => element.asset === asset
    await BinanceClient.futuresBalance().then((response : any)=>{balances.push(response)})
    const balance = {
        balance:Number(balances[0][balances[0].findIndex(indexFinder)].balance),
        availableBalance:Number(balances[0][balances[0].findIndex(indexFinder)].maxWithdrawAmount)
    }
    return balance
}
export default getBalance