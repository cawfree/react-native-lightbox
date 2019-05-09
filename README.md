# react-native-lightbox
A stateful `<LightBox/>` component for React Native, mainly featuring the ability to render arbitrary content once expanded.

## 🚀 Getting Started

Via [npm](https://www.npmjs.com/package/@cawfree/react-native-lightbox):
```
npm install --save @cawfree/react-native-lightbox
```
Or using [yarn](https://www.npmjs.com/package/@cawfree/react-native-lightbox):
```
yarn add @cawfree/react-native-lightbox
```

## ✏️ Example
```javascript
import React from 'react';
import {
  View,
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
      <View
        style={{
          flex: 1,
          backgroundColor: 'blue',
        }}
      >
        <TouchableOpacity
          style={{
            width: 50,
            height: 50,
            backgroundColor: 'red',
          }}
          onPress={() => this.setState({
            open: true,
          })}
        >
          <LightBox
            open={open}
            renderBackdrop={() => (
              <View
                style={{
                  flex: 1,
                  backgroundColor: '#000000AA',
                }}
              />
            )}
            onRequestClose={() => this.setState({
              open: false,
            })}
          >
            <View
              style={{
                width: 50,
                height: 50,
                backgroundColor: 'yellow',
              }}
            >
            </View>
          </LightBox>
        </TouchableOpacity>
      </View>
    );
  }
}
```

## ✌️ License
[MIT](https://opensource.org/licenses/MIT)
