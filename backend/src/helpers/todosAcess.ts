import * as AWS from 'aws-sdk'
const AWSXRay = require('aws-xray-sdk')
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'


const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// Implement the dataLayer logic
export class TodosAccess {

    constructor(
        private docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private todosTable = process.env.TODOS_TABLE,
        private attachmentS3Bucket = process.env.ATTACHMENT_S3_BUCKET
    ) {

    }

    async create(todoItem: TodoItem): Promise<TodoItem> {
        logger.info('Creating TODO item')
        await this.docClient.put({
          TableName: this.todosTable,
          Item: {
            ...todoItem
          }
        }).promise()
        logger.info('TODO item created')
    
        return todoItem
    }

    async update(updateTodoRequest: UpdateTodoRequest, userId: string, todoId: string): Promise<void> {
        logger.info(`Updating todo: ${todoId} for user: ${userId}`)
        await this.docClient.update({
          TableName: this.todosTable,
          Key: {
            "userId": userId,
            "todoId": todoId
          },
          UpdateExpression: "set #todoName=:name, dueDate=:dueDate, done=:done",
          ExpressionAttributeNames: {
            "#todoName": "name"
          },
          ExpressionAttributeValues:{
              ":name": updateTodoRequest.name,
              ":dueDate": updateTodoRequest.dueDate,
              ":done": updateTodoRequest.done
          }
        }).promise()
        logger.info(`Updated todo: ${todoId}`)
    }

    async updateAttachmentUrl(userId: string, todoId: string): Promise<void> {
        logger.info(`Updating attachment url for todo: ${todoId}`)
        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                "todoId": todoId,
                "userId": userId,
            },
            UpdateExpression: "set attachmentUrl=:attachmentUrl",
            ExpressionAttributeValues:{
                ":attachmentUrl": `https://${this.attachmentS3Bucket}.s3.amazonaws.com/${todoId}`
            }
        }).promise()
        logger.info(`Updated attachment url for todo: ${todoId}`)
    }

    async getAll(userId: string): Promise<TodoItem[]> {
        const result = await this.docClient.query({
            TableName: this.todosTable,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            },
        }).promise()
    
        logger.info(result.Items)
        return result.Items as TodoItem[]
    }

    async delete(userId: string, todoId: string): Promise<void> {
        logger.info(`Deleting todo: ${todoId}`)
        await this.docClient.delete({
            TableName: this.todosTable,
            Key: {
                "todoId": todoId,
                "userId": userId,
            }
        }).promise()
    }

}