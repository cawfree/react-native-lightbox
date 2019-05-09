# react-native-lightbox
A stateful `<LightBox/>` component for React Native, mainly featuring the ability to render arbitrary content within the `<LightBox />` once it has opened up.

## 🚀 Getting Started

Via [npm](https://www.npmjs.com/package/@cawfree/react-native-lightbox):
```
npm install --save @cawfree/react-native-lightbox
```
Or using [yarn](https://www.npmjs.com/package/@cawfree/react-native-lightbox):
```
yarn add @cawfree/react-native'lightbox
```

## ✏️ Example
```javascript
import React from 'react';
import {
  View,
  Dimensions,
  TouchableOpacity,
  Text,
} from 'react-native';
import LightBox from '@cawfree/react-native-lightbox';

const {
  width,
  height,
} = Dimensions.get('window');

// XXX: Note that instead of using `renderOpen` to dynamically render children,
//      you can not specify this function and have it render the default children.
export default class Example extends React.Component {
  state = {
    open: false,
  }
  render() {
    const {
      open,
    } = this.state;
    return (
      <LightBox
        duration={200}
        horizontal
        open={open}
        renderOpen={() => (
          <View
            style={{
              width,
              height,
              backgroundColor: 'blue',
            }}
          />
        )}
        renderBackdrop={() => (
          <View
            style={{
              width,
              height,
              backgroundColor: 'black',
            }}
          >
          <View>
        )}
      >
        <TouchableOpacity
          onPress={() => this.setState({ open: !open })}
          style={{
            width: 100,
            height: 100,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text
          >
            {'Tap to expand.'}
          </Text>
        </TouchableOpacity>
      </LightBox>
    );
  }
}
```

## ✌️ License
[MIT](https://opensource.org/licenses/MIT)
