import 'source-map-support/register'
import * as AWS  from 'aws-sdk'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as AWSXRay from 'aws-xray-sdk'
// enable xray tracing for the sdk
const XAWS = AWSXRay.captureAWS(AWS)
const bucketName = process.env.TODO_ATTACHMENTS_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION
const s3 = new XAWS.S3({
  signatureVersion: 'v4'
})
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId

const uploadParms = {
  Bucket: bucketName,
  Key: `${todoId}.png`,
  Expires: urlExpiration
}
let statusCode = 400;
const reply = {}
try {
  const uploadURL = s3.getSignedUrl('putObject', uploadParms);
  reply['uploadUrl'] = uploadURL;
} catch (error) {
  console.log(`error generating upload url: ${error}`)
  reply['message']='error creating signed url'
}


  return {
    statusCode: statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify(reply)
  }


}
