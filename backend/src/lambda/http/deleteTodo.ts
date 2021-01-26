import 'source-map-support/register'
import { getUserId } from '../utils'
import * as AWS from 'aws-sdk'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
const docClient = new AWS.DynamoDB.DocumentClient()

const toDoListTable = process.env.TODOLIST_TABLE
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const userId = getUserId(event)
  const params = {
    TableName: toDoListTable,
    Key: {
      todoId
    },
    ConditionExpression: "userId = :user",
    ExpressionAttributeValues:{
      ":user": userId
  },
  }

  let   statusCode  =  400
const reply = {
  data: undefined
}
  try {
   await docClient.delete(params).promise()
   reply.data= "deleted succesfully";
   statusCode = 200
  } catch (error) {
    console.log(`error delete todo item: ${error}`)
    reply.data= error;
  }

  return {
    statusCode: statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify(reply)
  }
}
