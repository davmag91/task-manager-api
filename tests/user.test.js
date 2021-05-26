const request = require('supertest')
const bcrypt = require('bcryptjs')
const app = require('../src/app')
const User = require('../src/models/user')
const {userOneId, userOne, setupDatabase} = require('./fixtures/db')

beforeEach(setupDatabase)

test('Should signup a new user', async () => {
    const response = await request(app).post('/users').send({
        name: 'David',
        email: 'david_1991@live.com.pt',
        password: '1234567'
    }).expect(201)

    //Assert that the database was changed correctly
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    //Assertions about the response
    expect(response.body).toMatchObject({
        user: {
            name: 'David',
            email: 'david_1991@live.com.pt'
        },
        token: user.tokens[0].token
    })

    expect(user.password).not.toBe('1234567')
})

test('Should not signup user with invalid name/email/password', async() => {
    await request(app).post('/users').send({
        name: 'David',
        email: 'invalidemail',
        password: '1234567'
    }).expect(400)

    await request(app).post('/users').send({
        name: 'David',
        email: 'david_1991@live.com.pt',
        password: '1'
    }).expect(400)
})

test('Should login existing user', async () => {
    const response = await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200) 

    const user = await User.findById(userOneId)
    expect(response.body.token).toBe(user.tokens[1].token)
})

test('Should not login nonexistent user', async () => {
    await request(app).post('/users/login').send({
        email: "mail@mail.com",
        password: "randompass"
    }).expect(400)
})

test('Should get profile for user', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test('Should not get profile for unauthenticated user', async () => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(401)
})

test('Should delete account for user', async () => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

     const user = await User.findById(userOneId)
     expect(user).toBeNull()
})

test('Should not delete account for unauthenticated user', async () => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401)
})

test('Should upload avatar image', async() => {
    await request(app)
          .post('/users/me/avatar')
          .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
          .attach('avatar','tests/fixtures/profile-pic.jpg')
          .expect(200)

          const user = await User.findById(userOneId)
          expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Should update valid user fields', async() =>{
    const updateObject = {
        name: 'John',
        email: 'mail@mail.com',
        password: '12121212',
        age: 31
    }

    const response = await request(app)
          .patch('/users/me')
          .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
          .send(updateObject).expect(200)  

    const user = await User.findById(response.body._id)
    expect(user.name).toBe(updateObject.name)
    expect(user.email).toBe(updateObject.email)
    expect(user.age).toBe(updateObject.age)
    
    const isMatch = await bcrypt.compare(updateObject.password, user.password)

    if(!isMatch)
        throw new Error('Passwords dont match')
})

test('Should not update invalid user fields', async() =>{
    const updateObject = {
        name: 'John',
        email: 'mail@mail.com',
        password: '123',
        age: 31
    }

    const response = await request(app)
          .patch('/users/me')
          .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
          .send(updateObject).expect(400)  
})

test('Should not update user if unauthenticated', async() => {
    const updateObject = {
        name: 'John',
        email: 'mail@mail.com',
        password: '12121212',
        age: 31
    }

    const response = await request(app)
          .patch('/users/me')
          .send(updateObject).expect(401)  
})