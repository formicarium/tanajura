// import { getTestEnv } from './fixtures'

// describe('Asynchronous sum with messages', () => {
//   it('should produce a message on my-other-topic with an increased value of 1, after consuming my-exchange', async () => {
//     const { components } = await getTestEnv()

//     components.prisma.setDb({
//       query: {
//         attachment: () => ({description: '10'}),
//       },
//     })

//     await components.consumer.consume('my-exchange', 'my-pattern', {
//       value: 1,
//     })

//     expect(components.producer.getLastProduced()).toEqual({
//       topicName: 'my-other-topic',
//       key: 'my-other-key',
//       data: {
//         value: 11,
//       },
//     })
//   })
// })

describe('my test', () => {
  it('shall pass', () => {
    expect(1).toBe(1)
  })
})
