import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../utils';
import { createTodo } from '../../helpers/todos'

import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)
const cloudwatch = new XAWS.CloudWatch()

function timeInMs() {
  return new Date().getTime()
}

const startTime = timeInMs()


export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {  
    const newTodo: CreateTodoRequest = JSON.parse(event.body)
    
    // Implement creating a new TODO item
    const userId = getUserId(event)
    const todo = await createTodo(newTodo, userId)

    const endTime = timeInMs()
  
    await cloudwatch.putMetricData({
      MetricData: [
        {
          MetricName: 'Latency',
          Dimensions: [
            {
              Name: 'ServiceName',
              Value: 'UdagramTodo'
            }
          ],
          Unit: 'Milliseconds',
          Value: endTime - startTime
        }
      ],
      Namespace: 'Udacity/Serveless'
    }).promise()

    return {
      statusCode: 201,
      body: JSON.stringify({
        item: todo
      })
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
