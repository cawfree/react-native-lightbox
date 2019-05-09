import React from 'react';
import {
  View,
  Text,
  PanResponder,
  Animated,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  Modal,
} from 'react-native';
import PropTypes from 'prop-types';

class LightBox extends React.Component {
  constructor(nextProps) {
    super(nextProps);
    this.state = ({
      open: false,
      dragging: false,
      animateOpenFinish: false,
      origin: {},
      animOpacity: new Animated.Value(0),
      animRotation: new Animated.Value(0),
      targetPosition: new Animated.ValueXY(),
      targetBounds: new Animated.ValueXY(),
      panResponder: PanResponder.create({
        onStartShouldSetPanResponder: (e) => {
          const {
            onShouldSetPanResponder,
          } = this.props;
          const {
            animateOpenFinish,
          } = this.state;
          if (animateOpenFinish && onShouldSetPanResponder) {
            return onShouldSetPanResponder(e);
          }
          return animateOpenFinish;
        },
        onMoveShouldSetPanResponder: () => {
          const {
            animateOpenFinish,
          } = this.state;
          return animateOpenFinish;
        },
        onPanResponderGrant: (event, gestureState) => {
          const {
            targetPosition,
          } = this.state;
          return targetPosition.extractOffset();
        },
        onPanResponderMove: (event, gestureState) => {
          const {
            dx,
            dy,
          } = gestureState;
          const {
            targetPosition,
            animOpacity,
            animRotation,
          } = this.state;
          const {
            horizontal,
            rotating,
          } = this.props;
          targetPosition.setValue({
            x: horizontal ? dx : 0,
            y: dy,
          });
          const normalized = 1 - Math.abs(gestureState.dy) / (Dimensions.get('window').height / 2);
          animOpacity.setValue(Math.max(
            normalized,
            0,
          ));
          animRotation.setValue(
            rotating ? (Math.sin((normalized * 0.5) - 0.5) * 90) : 0,
          ),
          this.requestAnimationFrame(() => this.setState({
            dragging: true,
          }));
        },
        onPanResponderRelease: (event, gestureState) => {
          const {
            distance,
            duration,
          } = this.props;
          const {
            targetPosition,
            animOpacity,
            animRotation,
          } = this.state;
          if (Math.abs(gestureState.dy) > distance) {
            return this.__onClose();
          }
          return this.requestAnimationFrame(() => {
            this.setState(
              {
                dragging: false,
                animateOpenFinish: false,
              },
              () => {
                return Animated.parallel([
                  Animated.timing(
                    targetPosition,
                    {
                      toValue: 0,
                      duration,
                    },
                  ),
                  Animated.timing(
                    animOpacity,
                    {
                      toValue: 1,
                      duration,
                    },
                  ),
                  Animated.timing(
                    animRotation,
                    {
                      toValue: 0,
                      duration,
                    },
                  ),
                ])
                  .start(() => {
                    this.state.animateOpenFinish = true;
                  });
              },
            );
          });
        },
      }),
    });
    this.__onClose = this.__onClose.bind(this);
    this.__onLayout = this.__onLayout.bind(this);
    this.__getAnimationFor = this.__getAnimationFor.bind(this);
  }
  componentWillUpdate(nextProps, nextState) {
    if (nextProps.open && !this.props.open) {
      this.__onOpen();
    } else if (!nextProps.open && this.props.open) {
      this.__onClose();
    }
  }
  __getAnimationFor(x, y, width, height, opacity, rotation) {
    const {
      targetPosition,
      targetBounds,
      animOpacity,
      animRotation,
    } = this.state;
    const {
      duration,
    } = this.props;
    return Animated.parallel(
      [
        Animated.timing(
          targetPosition.x,
          {
            toValue: x,
            duration,
          },
        ),
        Animated.timing(
          targetPosition.y,
          {
            toValue: y,
            duration,
          },
        ),
        Animated.timing(
          targetBounds.x,
          {
            toValue: width,
            duration,
          },
        ),
        Animated.timing(
          targetBounds.y,
          {
            toValue: height,
            duration,
          },
        ),
        Animated.timing(
          animOpacity,
          {
            toValue: opacity,
            duration,
          },
        ),
        Animated.timing(
          animRotation,
          {
            toValue: rotation,
            duration,
          },
        ),
      ],
    );
  }
  __onOpen() {
    const {
      duration,
      getOrigin,
    } = this.props;
    const {
      origin,
      targetPosition,
      targetBounds,
    } = this.state;
    this.refs.child.measure((x, y, width, height, pageX, pageY) => {
      Object.assign(
        origin,
        getOrigin(
          x,
          y,
          width,
          height,
          pageX,
          pageY,
        ),
      );
      targetPosition.setValue({
        x: pageX,
        y: pageY,
      });
      targetBounds.setValue({
        x: width,
        y: height,
      });
      this.requestAnimationFrame(() => {
        this.setState(
          {
            open: true,
          },
          () => this.refs.fullScreen.measure(
            (dx, dy, dWidth, dHeight, dPageX, dPageY) => {
              this.__getAnimationFor(
                dPageX,
                dPageY,
                dWidth,
                dHeight,
                1,
                0,
              )
              .start(() => {
                this.state.animateOpenFinish = true;
              });
            }
          ),
        );
      });
    });
  };
  __onClose() {
    const {
      duration,
      onRequestClose,
    } = this.props;
    const {
      targetPosition,
      targetBounds,
      origin,
    } = this.state;
    this.__getAnimationFor(
      origin.x,
      origin.y,
      origin.width,
      origin.height,
      0,
      0,
    )
    .start(() => {
      this.requestAnimationFrame(
        () => {
          if (onRequestClose) {
            onRequestClose();
          }
          this.setState({
            open: false,
            dragging: false,
            animateOpenFinish: false,
          });
        },
      );
    });
  };
  __onLayout(e) {
    // XXX: This forces Android to measure.
  }
  render() {
    const {
      open,
      children,
      renderOpen,
      renderBackdrop,
    } = this.props;
    const {
      dragging,
      targetBounds,
      targetPosition,
      panResponder,
      animOpacity,
      animRotation,
    } = this.state;
    if (!open) {
      return (
        <View
          ref="child"
          style={styles.wrapper}
          onLayout={this.__onLayout}
        >
          {children}
        </View>
      );
    }
    return (
      <Modal
        useNativeDriver
        animationType="fade"
        transparent
        style={StyleSheet.absoluteFill}
        visible={open}
        pointerEvents={this.state.open ? 'auto' : 'none'}
      >
        <View
          ref="fullScreen"
          style={styles.fullScreen}
        >
          <Animated.View
            style={{
              ...styles.backdrop,
              opacity: animOpacity,
            }}
          >
            {renderBackdrop && renderBackdrop()}
          </Animated.View>
          <Animated.View
            {...panResponder.panHandlers}
            style={{
              left: targetPosition.x,
              top: targetPosition.y,
              width: targetBounds.x,
              height: targetBounds.y,
              rotation: animRotation,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {renderOpen ? renderOpen() : children}
            </View>
          </Animated.View>
        </View>
      </Modal>
    );
  }
}

LightBox.propTypes = ({
  duration: PropTypes.number,
  horizontal: PropTypes.bool,
  distance: PropTypes.number,
  getOrigin: PropTypes.func,
  rotating: PropTypes.bool,
});

LightBox.defaultProps = ({
  duration: 250,
  distance: Dimensions.get('window').height / 5,
  horizontal: true,
  rotating: true,
  getOrigin: (x, y, width, height, pageX, pageY) => {
    return ({
      x: pageX,
      y: pageY,
      width,
      height,
    });
  },
});

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wrapper: {
    flex: 1,
  },
  fullScreen: {
    flex: 1,
    zIndex: 1000,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
});

Object.assign(
  LightBox.prototype,
  require('react-timer-mixin'),
);

export default LightBox;
