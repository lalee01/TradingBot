import fs from "fs"
import 'dotenv/config'

const multiCoin = JSON.parse(process.env.MULTI_CRYPTO_PAIR ?? '');

export const coinSettings = () =>{

    const collectedData = []
    
    fs.readFile("./src/binance/coinsettings2_test.json" , (error , data )=>{
        
        if(error){
            console.log(error)
        }
        
        const coinsJson = JSON.parse(data)
        
        multiCoin.map((symbol)=>{
            const indexFinder = (element) => element.symbol === symbol
            const index = coinsJson.findIndex(indexFinder)
            collectedData.push(coinsJson[index])
        })

        console.log(collectedData)
    })
    return collectedData
}

const coinSettingsArray = [
    {
        symbol:'SOLUSDC',
        price:2,
        quantity:2
    },
    {
        symbol:'BNBUSDC',
        price:2,
        quantity:2
    },
    {
        symbol:'NEOUSDC',
        price:3,
        quantity:3
    },
    {
        symbol:'NEARUSDC',
        price:4,
        quantity:0
    },
    {
        symbol:'ADAUSDC',
        price:4,
        quantity:1
    }
]

export default coinSettings