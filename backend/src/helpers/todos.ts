import { TodosAccess } from './todosAcess'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import * as uuid from 'uuid'
import { AttachmentUtils } from './attachmentUtils'

// Implement businessLogic

const todosAccess = new TodosAccess()
const attachmentUtils = new AttachmentUtils()

export async function getAllTodosByUser(userId: string): Promise<TodoItem[]> {
    return await todosAccess.getAll(userId)
}

export async function createTodo(createGroupRequest: CreateTodoRequest, userId: string): Promise<TodoItem> {
    return await todosAccess.create({
        userId,
        todoId: uuid.v4(),
        done: false,
        createdAt: new Date().toISOString(),
        ...createGroupRequest
  })
}

export async function createAttachmentPresignedUrl(userId: string, todoId: string): Promise<string> {
    const uploadUrl = await attachmentUtils.getSignedUrl(todoId)
    await todosAccess.updateAttachmentUrl(userId, todoId)

    return uploadUrl
}

export async function updateTodo(updateTodoRequest: UpdateTodoRequest, userId: string, todoId: string): Promise<void> {
    await todosAccess.update(updateTodoRequest, userId, todoId)
}

export async function deleteTodoItem(userId: string, todoId: string) {
    await todosAccess.delete(userId, todoId);
    await attachmentUtils.deleteItemAttachment(todoId);
}