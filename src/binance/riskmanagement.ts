
const riskMultiplier= Number(process.env.RISK)

type settingProps = {
    entryPrice : number
    stoplossPrice: number
    availableBalance: number
  }

const riskManagement = ({entryPrice,stoplossPrice,availableBalance}:settingProps) =>{

    const riskInPrice = availableBalance * (0.01 * riskMultiplier)
    const distance = Math.abs(entryPrice - stoplossPrice)
    const quantity =riskInPrice / distance

return quantity
}

export default riskManagement