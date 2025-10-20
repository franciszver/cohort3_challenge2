export const Auth = {
  currentAuthenticatedUser: jest.fn(() => 
    Promise.resolve({
      attributes: {
        sub: "test-user-id",
        email: "test@example.com"
      },
      username: "testuser"
    })
  ),
  signIn: jest.fn(() => Promise.resolve({ user: "mockUser" })),
  signOut: jest.fn(() => Promise.resolve()),
  signUp: jest.fn(() => Promise.resolve({ userSub: "test-sub" })),
  confirmSignUp: jest.fn(() => Promise.resolve()),
  forgotPassword: jest.fn(() => Promise.resolve()),
  forgotPasswordSubmit: jest.fn(() => Promise.resolve())
};

export const API = {
  graphql: jest.fn(() => Promise.resolve({
    data: {
      createMessage: {
        id: "test-message-id",
        content: "test message",
        senderId: "test-user-id",
        conversationId: "test-conversation-id",
        createdAt: new Date().toISOString()
      }
    }
  }))
};

export const graphqlOperation = jest.fn((query, variables) => ({ query, variables }));

export const Amplify = {
  configure: jest.fn()
};

export const Hub = {
  listen: jest.fn(() => () => {}),
  dispatch: jest.fn()
};
