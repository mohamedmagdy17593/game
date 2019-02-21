const path = require('path')
const {GraphQLServer, PubSub} = require('graphql-yoga')

const typeDefs = path.join(__dirname, 'schema.graphql')

const pubsub = new PubSub()

const gameState = {
  game1: 0,
  game2: 0,
  target: 20,
  winner: null,
}

const resolvers = {
  Mutation: {
    attack(_, {gameId}) {
      if (gameState.winner) {
        return 'ended'
      }
      gameState[gameId] = gameState[gameId] + Math.floor(Math.random() * 10)
      if (gameState[gameId] >= gameState.target) {
        gameState.winner = gameId
      }
      pubsub.publish('GAME_STATE', {gameState})
      return 'updated'
    },
  },
  Subscription: {
    gameState: {
      subscribe() {
        return pubsub.asyncIterator('GAME_STATE')
      },
    },
  },
}

const server = new GraphQLServer({typeDefs, resolvers})
server.start(() => {
  // eslint-disable-next-line
  console.log('Server is running on localhost:4000')
})
