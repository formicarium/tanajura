export const attachmentsSeed = `
mutation CreateAttachment {
  tweet1: createAttachment(data:{
    name: "Attachment 1",
    description: "Attachment 1 description",
    type: ARTICLE,
    kind: WEB,
    imageUrl: "http://www.imageUrl.com",
    url: "http://url.com"
  }) {
    id
    name
    description
    type
    kind
  }
}`
