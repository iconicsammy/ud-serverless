import 'source-map-support/register'

import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  APIGatewayProxyHandler
} from 'aws-lambda'
import { getUserId } from '../utils'
import * as AWS from 'aws-sdk'

const docClient = new AWS.DynamoDB.DocumentClient()

const toDoListTable = process.env.TODOLIST_TABLE

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  // TODO: Get all TODO items for a current user
  const userId = getUserId(event)

  let statusCode = 400;
  const reply = {
    items : [],
  }
  try {
    const result = await docClient
    .query({
      TableName: toDoListTable,
      IndexName: process.env.USER_ID_INDEX,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      },
      ScanIndexForward: false
    })
    .promise()
    reply.items = result.Items;
    statusCode = 200;
  } catch (error) {
    console.log(`error getting your todo list items: ${error}`)
    reply['message'] = error;
  }
  return {
    statusCode: statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify(reply)
  }
}
