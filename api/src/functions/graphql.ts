import type { APIGatewayProxyEvent, Context as LambdaContext } from 'aws-lambda'

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

export const handler = createGraphQLHandler({
  getCurrentUser,
  loggerConfig: { logger, options: {} },
  directives,
  sdls,
  services,
  authDecoder: myAuthDecoder,
  onException: () => {
    // Disconnect from your database with an unhandled exception.
    db.$disconnect()
  },
})
