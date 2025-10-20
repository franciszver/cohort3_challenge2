export const NetInfo = {
  fetch: jest.fn(() => 
    Promise.resolve({
      isConnected: true,
      isInternetReachable: true,
      type: "wifi",
      details: {}
    })
  ),
  addEventListener: jest.fn(() => () => {}),
  removeEventListener: jest.fn()
};
