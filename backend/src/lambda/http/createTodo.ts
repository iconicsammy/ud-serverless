import 'source-map-support/register'

import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult
} from 'aws-lambda'
import { getUserId } from '../utils'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { v4 as uuidv4 } from 'uuid';
import { TodoItem } from '../../models/TodoItem'

import * as AWS from 'aws-sdk'


const docClient = new AWS.DynamoDB.DocumentClient()

const toDoListTable = process.env.TODOLIST_TABLE

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const newTodo: CreateTodoRequest = JSON.parse(event.body)

    const userId = getUserId(event)
    const item: TodoItem = {
      name: newTodo.name,
      dueDate: newTodo.dueDate,
      userId: userId,
      todoId: uuidv4(),
      createdAt: new Date().toISOString(),
      done: false
    }
    const params = {
      TableName: toDoListTable,
      Item: item
    }

    let statusCode = 400;
    const reply = {
      data: undefined
    }

    try {
      await docClient.put(params).promise();
      reply.data = item;
      statusCode = 201
    } catch (error) {
      console.log(`error creating todo item: ${error}`)
      reply.data = error
    }

    return {
      statusCode: statusCode,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(reply)
    }

}
