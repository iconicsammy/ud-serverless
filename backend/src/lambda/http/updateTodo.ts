import 'source-map-support/register'
import * as AWS from 'aws-sdk'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { getUserId } from '../utils'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
const docClient = new AWS.DynamoDB.DocumentClient()

const toDoListTable = process.env.TODOLIST_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)

    const userId = getUserId(event);

    const params = {
      TableName: toDoListTable,
      Key: {
        todoId
      },
      UpdateExpression: "set #nm = :name, dueDate=:dueDate, done=:done", // name is reserved keyword
      ConditionExpression: "userId = :user",
      ExpressionAttributeValues:{
          ":name":updatedTodo.name,
          ":dueDate": updatedTodo.dueDate,
          ":done":updatedTodo.done,
          ":user": userId
      },
      ExpressionAttributeNames:{
        "#nm": "name"
      }
    }

    let statusCode = 400;
    const reply = {
      result : "Error when updating the todo"
    }
    try {
      await docClient.update(params).promise()
      reply.result = "updated successfully";
      statusCode= 200;
    } catch (error) {
      console.log(`error updating your todo item: ${error}`)
      reply['errorMessage'] = error;
    }


    return {
      statusCode: statusCode,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(reply)
    }
}
