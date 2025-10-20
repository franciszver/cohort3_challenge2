let mockStorage = {};

export default {
  getItem: jest.fn((key) => 
    Promise.resolve(mockStorage[key] || null)
  ),
  setItem: jest.fn((key, value) => {
    mockStorage[key] = value;
    return Promise.resolve();
  }),
  removeItem: jest.fn((key) => {
    delete mockStorage[key];
    return Promise.resolve();
  }),
  clear: jest.fn(() => {
    mockStorage = {};
    return Promise.resolve();
  }),
  getAllKeys: jest.fn(() => 
    Promise.resolve(Object.keys(mockStorage))
  ),
  multiGet: jest.fn((keys) => 
    Promise.resolve(keys.map(key => [key, mockStorage[key] || null]))
  ),
  multiSet: jest.fn((keyValuePairs) => {
    keyValuePairs.forEach(([key, value]) => {
      mockStorage[key] = value;
    });
    return Promise.resolve();
  }),
  multiRemove: jest.fn((keys) => {
    keys.forEach(key => delete mockStorage[key]);
    return Promise.resolve();
  })
};
