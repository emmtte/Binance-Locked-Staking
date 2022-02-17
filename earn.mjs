#!/usr/bin/env node

import axios from 'axios'
import { binanceKey, binanceSecret, telegramToken, telegramChatId } from './config.mjs'
import { Spot } from '@binance/connector' ; const spot = new Spot(binanceKey,binanceSecret)
import Big from 'big.js'
import schedule from 'node-schedule'
import { EventEmitter } from 'events' ; const event = new EventEmitter()
import { readFile, writeFile } from 'fs/promises'
import { Bot } from 'grammy' ; const bot = new Bot(telegramToken)

let savings={}, staking={} , balances={}

String.prototype.right = function(width=6) {return this.padStart(width, ' ').substring(0, width) }
String.prototype.left  = function(width=6) {return this.padEnd  (width, ' ').substring(0, width) }

process.on('uncaughtException', err => {console.log(err.stack)})
process.once('SIGINT', async err => { process.exit()} )

process.stdout.write('API Permissions ')
await spot.apiPermissions({recvWindow: 10000}) // https://binance-docs.github.io/apidocs/spot/en/#get-api-key-permission-user_data
.then( res => { console.log('✓',res) ; let {enableReading} = res.data ; if (enableReading==false) { console.log(res.data) ; process.exit()}})
.catch( error => { if (error.response) {let {response:{data:{code,msg}}} =error ; console.log(`✗ ${msg} (${code})`) } else {console.log('✗ ',error.message)} ; process.exit() })


event.on('earn', async ()  => {
/*
await readFile(`savings.json`).then(res => savings = JSON.parse(res)).catch (err => console.log(err.message) )
process.stdout.write('Locked Savings')
  await spot.savingsProductList('CUSTOMIZED_FIXED',{status:'SUBSCRIBABLE',current:1,size:100})
    .then( async ({data}) => {await writeFile(`savings.json`, JSON.stringify(data, null, 1)) ; console.log('✓')})
    .catch( error => { if (error.response) {let {response:{data:{code,msg}}} =error ; console.log(`✗ ${msg} (${code})`) } else {console.log('✗ ',error.message)} })
*/

//await readFile(`staking.json`).then(res => staking = JSON.parse(res)).catch (err => console.log(err.message) )
process.stdout.write('Locked Stakings')
  await axios.get('https://www.binance.com/gateway-api/v1/friendly/pos/union?pageSize=100&pageIndex=1')
    .then( async ({data}) => { await writeFile(`staking.json`, JSON.stringify(data, null, 1) ) ; staking = data ; console.log('✓') })
    .catch(error => {console.error(error.message) ; process.exit()})


//await readFile(`balances.json`).then(res => balances = JSON.parse(res)).catch (err => console.log(err.message) )
process.stdout.write('Balances')
  await spot.account()
    .then( async ({data}) => { await writeFile(`balances.json`, JSON.stringify(data.balances, null, 1) ) ; balances = data.balances ;  console.log('✓')})
    .catch(error => {console.log(error.message) ; process.exit()})
if (staking.total > 100) {console.log(`App error please open an issue for update (${staking.total})`) ; process.exit()}

staking=staking.data
let msg = []
for (const item of staking) {
  let asset, extra, annualInterestRate=0, duration, minPurchaseAmount, maxPurchaseAmount
   for (const period of item.projects){
     if (period.sellOut == false) {
       asset = item.asset
       let actualAnnualInterestRate =  Big(period.config.annualInterestRate).times(100).toNumber()
       if (period.config.extraInterestAsset) {asset=`${asset}/${period.config.extraInterestAsset}` ; actualAnnualInterestRate = Big(period.config.extraAnnualInterestRate).times(100).toNumber()}
       if (annualInterestRate < actualAnnualInterestRate) {
         annualInterestRate=actualAnnualInterestRate
         duration=period.duration*1
         minPurchaseAmount=period.config.minPurchaseAmount*1
         maxPurchaseAmount=period.config.maxPurchaseAmountPerUser*1}
       }
   }
if (asset) {console.log(asset.left(9),duration.toString().right(3),`${annualInterestRate}%`.right(7),minPurchaseAmount.toString().right(7))}

for (const entry  of balances) {
  if (entry.asset == asset) {
    if (entry.locked*1 !== 0) {console.log(asset,'asset in order book')}
    let purchaseAmount
    if (entry.free*1 > minPurchaseAmount*1) {
      console.log(asset,entry.free*1)
      if (entry.free*1 > maxPurchaseAmount*1) {purchaseAmount = maxPurchaseAmount*1} else {purchaseAmount =entry.free*1}
      let locked=' ' ; if (entry.locked*1 !== 0) {locked='*'}
      msg.push(`${asset.left(9)} ${duration.toString().right(3)} ${annualInterestRate.toString().right(6)}% ${minPurchaseAmount.toString().right(7)} ${entry.free.right(12)} ${locked} \n`)
    continue
   }
  }
}
}

  if (msg.length) {msg=msg.slice(-125).join('') ; await bot.api.sendMessage(telegramChatId,`\`\`\`\n${msg}\`\`\``,{parse_mode: 'Markdown'})}

})

event.emit('earn')
schedule.scheduleJob('15 0 14 * * *', () => { event.emit('earn') }) // At second 15, minute 0, hour 14 every day
