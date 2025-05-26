const riskMultiplier= Number(process.env.RISK ?? 1)
const feeRate = Number(process.env.FEE_CORRECTION ?? 1)

type settingProps = {
    entryPrice : number
    stoplossPrice: number
    availableBalance: number
  }

const riskManagement = ({entryPrice,stoplossPrice,availableBalance}:settingProps) =>{

  const maxRisk = availableBalance * (0.01 * riskMultiplier)
  const distance = Math.abs(entryPrice - stoplossPrice)
  const rawQuantity = maxRisk / distance
  const fee = entryPrice * rawQuantity * feeRate
  const quantity = (maxRisk - fee) / distance

return quantity
}

export default riskManagement