import type { APIGatewayProxyEvent, Context as LambdaContext } from 'aws-lambda'
import { A } from 'ts-toolbelt'

import { createGraphQLHandler } from '@redwoodjs/graphql-server'
import type { AuthDecoderResult } from '@redwoodjs/graphql-server'

import directives from 'src/directives/**/*.{js,ts}'
import sdls from 'src/graphql/**/*.sdl.{js,ts}'
import { getCurrentUser } from 'src/lib/auth'
import { db } from 'src/lib/db'
import { logger } from 'src/lib/logger'
import services from 'src/services/**/*.{js,ts}'

const myAuthDecoder = async (
  event: APIGatewayProxyEvent,
  context: LambdaContext
): Promise<AuthDecoderResult> => {
  console.log(`🗯 \n ~ file: graphql.ts ~ line 13 ~ event`, event)
  console.log(`🗯 \n ~ file: graphql.ts ~ line 13 ~ context`, context)

  return {
    result: {
      id: 2,
    },
    metadata: {
      type: 'dbAuth',
      schema: 'Bearer',
      token: event.headers['Authorization'],
    },
  }
}

/** TODO define secnarios for what a decoder should do

1. Decoding should happen i.e. expected mechanism is there
    A. Success
    B. Failure (could not decode)
2. Decoding should NOT happen i.e. it is a public request (so @skipAuth)
*/
const mySecretDecoder = (
  event: APIGatewayProxyEvent,
  _context: LambdaContext
): AuthDecoderResult => {
  console.log(
    `🗯 \n ~ file: graphql.ts ~ line 45 ~ event.headers`,
    event.headers
  )
  if (event.headers['x-api-key'] === 'bazinga') {
    return {
      result: {
        id: 1,
      },
      metadata: {
        type: 'bazinga-token-auth' as any, // @TODO we should not be restricted at all
        schema: 'x-api-key',
        token: event.headers['x-api-key'],
      },
    }
  }
  throw new Error('Regular error 💣')
}

export const handler = createGraphQLHandler({
  getCurrentUser,
  loggerConfig: { logger, options: {} },
  directives,
  sdls,
  services,
  authDecoder: mySecretDecoder,
  onException: () => {
    // Disconnect from your database with an unhandled exception.
    db.$disconnect()
  },
})
