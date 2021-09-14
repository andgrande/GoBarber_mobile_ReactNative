import React from 'react';
import { render } from '@testing-library/react-native';

import SignIn from '../../pages/SignIn/index';

jest.mock('@react-navigation/native', () => {
  return {
    useNavigation: jest.fn(),
  };
});

describe('SignIn Page', () => {
  it('should contain email/password inputs', () => {
    const { getByPlaceholderText } = render(<SignIn />);

    expect(getByPlaceholderText('E-mail')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
  });
});
