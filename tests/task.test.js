const request = require('supertest')
const app = require('../src/app')
const Task = require('../src/models/task')
const { userOneId,
    userOne,
    userTwo,
    userTwoId,
    taskOne,
    taskTwo,
    taskThree,
    setupDatabase } = require('./fixtures/db')

beforeEach(setupDatabase)

test('Should create task for user', async () => {
    const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: 'Simple Test'
        }).expect(201)

    const task = await Task.findById(response.body._id)
    expect(task).not.toBeNull()
    expect(task.completed).toBe(false)
})

test('Should not create task with invalid completed', async () => {
    await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            completed: 'hello world'
        }).expect(400)
})

test('Should get 2 tasks for user one', async () => {
    const response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    expect(response.body.length).toBe(2)
})

test('Should not delete first task with second user authorization', async () => {
    await request(app)
        .delete(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send()
        .expect(404)

    const task = await Task.findById(taskOne._id)
    expect(task).not.toBeNull()
})

test('Should not delete task if unauthenticated', async () => {
    await request(app)
        .delete(`/tasks/${taskOne._id}`)
        .send()
        .expect(401)
})

test('Should delete first task', async () => {
    await request(app)
        .delete(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    const task = await Task.findById(taskOne._id)
    expect(task).toBeNull()
}) 

test('Should not update other users task', async () => {
    await request(app)
        .patch(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send({
            completed: true
        })
        .expect(400)

    const task = await Task.findById(taskOne._id)
    expect(task.completed).toBe(false)
})

test('Should fetch user task by id', async() => {
    const response = await request(app)
                     .get(`/tasks/${taskTwo._id}`)
                     .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
                     .send()
                     .expect(200)
    
    expect(response.body).not.toBeNull()
})

test('Should not fetch user task by id if unauthenticated', async() => {
    const response = await request(app)
                     .get(`/tasks/${taskTwo._id}`)
                     .send()
                     .expect(401)
})


test('Should not fetch other user task', async() => {
    const response = await request(app)
                     .get(`/tasks/${taskTwo._id}`)
                     .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
                     .send()
                     .expect(404) 
})

test('Should only fetch completed tasks', async () => {
    const response = await request(app)
        .get('/tasks?completed=true')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
        
    response.body.forEach((task) => {
        expect(task.completed).toBe(true)
    })
})

test('Should only fetch incomplete tasks', async () => {
    const response = await request(app)
        .get('/tasks?completed=false')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
        
    response.body.forEach((task) => {
        expect(task.completed).toBe(false)
    })
}) 

test('Should sort tasks by description', async() =>{
    const response = await request(app)
        .get('/tasks?sortBy=description')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test('Should sort tasks by completed', async() =>{
    const response = await request(app)
        .get('/tasks?sortBy=completed')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test('Should sort tasks by createdAt', async() =>{
    const response = await request(app)
        .get('/tasks?sortBy=createdAt')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test('Should sort tasks by updatedAt', async() =>{
    const response = await request(app)
        .get('/tasks?sortBy=updatedAt')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test('Should fetch page of tasks', async() =>{
    const response = await request(app)
        .get('/tasks?limit=10&skip=0')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

