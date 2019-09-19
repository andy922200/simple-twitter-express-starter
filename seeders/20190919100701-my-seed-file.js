'use strict'
const bcrypt = require('bcrypt-nodejs')
const faker = require('faker')

module.exports = {
  up: (queryInterface, Sequelize) => {
    queryInterface.bulkInsert(
      'Users',
      [
        {
          name: `root`,
          email: `root@example.com`,
          password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
          avatar: faker.image.avatar(),
          introduction: faker.lorem.text(),
          role: 'admin',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ].concat(
        Array.from({ length: 19 }).map((d, index) => ({
          name: `user${index + 1}`,
          email: `user${index + 1}@example.com`,
          password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
          avatar: faker.image.avatar(),
          introduction: faker.lorem.text(),
          role: 'user',
          createdAt: new Date(),
          updatedAt: new Date()
        }))
      ),
      {}
    )
    return queryInterface.bulkInsert(
      'Tweets',
      Array.from({ length: 200 }).map(d => ({
        description: faker.lorem.text(),
        UserID: Math.floor(Math.random() * 20) + 1,
        createdAt: new Date(),
        updatedAt: new Date()
      })),
      {}
    )
  },
  down: (queryInterface, Sequelize) => {
    queryInterface.bulkDelete('Users', null, {})
    return queryInterface.bulkDelete('Tweets', null, {})
  }
}
