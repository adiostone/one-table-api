import WebSocket from 'ws'

const partyWS = new WebSocket.Server({ noServer: true })

partyWS.on('connection', ws => {
  ws.send('hello table!!')

  ws.on('message', msg => {
    console.log(msg)
    ws.send(`you said, ${msg}`)
  })
})

export { partyWS }
