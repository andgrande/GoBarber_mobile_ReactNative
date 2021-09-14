import { RectButton } from 'react-native-gesture-handler';
import styled from 'styled-components/native';

export const Container = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 0 14px;
`;

export const Title = styled.Text`
  font-size: 32px;
  color: #f4ede8;
  font-family: 'RobotoSlab-Medium';
  margin-top: 48px;
  text-align: center;
`;

export const Description = styled.Text`
  font-size: 18px;
  color: #999591;
  font-family: 'RobotoSlab-Regular';
  margin-top: 16px;
  text-align: center;
`;

export const OkButton = styled(RectButton)`
  background: #ff9900;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
  margin-top: 60px;
  padding: 12px 24px;
`;

export const OkButtonText = styled.Text`
  font-size: 18px;
  color: #312e38;
  font-family: 'RobotoSlab-Medium';
`;
