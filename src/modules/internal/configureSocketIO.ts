import socketIO from 'socket.io'

export default function configureSocketIO(io: socketIO.Server): void {
  // namespace: party
  const partyIO = io.of('/party')

  partyIO.on('connection', socket => {
    socket.on('disconnect', () => {
      // TODO: exit party room
    })
  })
}
