import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Slider from '@react-native-community/slider';
import PropTypes from 'prop-types';

class SnapSlider extends React.Component {
    constructor(props) {
        super(props);
        this._sliderStyle = this._sliderStyle.bind(this);
        this._onSlidingCompleteCallback = this._onSlidingCompleteCallback.bind(this);
        this._getItemWidth = this._getItemWidth.bind(this);
        this._getSliderWidth = this._getSliderWidth.bind(this);
        this._labelView = this._labelView.bind(this);

        const sliderRatio = props.maximumValue / (props.items.length - 1);
        const value = sliderRatio * props.defaultItem;
        const item = props.defaultItem;
        this.state = {
            sliderRatio: sliderRatio,
            value: value,
            item: item,
            adjustSign: 1,
            itemWidth: [],
            sliderWidth: 0,
            sliderLeft: 0,
        };
    }
    
    _sliderStyle() {
        return [defaultStyles.slider, {width: this.state.sliderWidth, left: this.state.sliderLeft}, this.props.style];
    }

    _onSlidingCompleteCallback(v) {
        //pad the value to the snap position
        const halfRatio = this.state.sliderRatio / 2;
        let i = 0;
        for (;;) {
            if ((v < this.state.sliderRatio) || (v <= 0)) {
                if (v >= halfRatio) {
                    i++;
                }
                break;
            }
            v = v - this.state.sliderRatio;
            i++;
        }
        let value = this.state.sliderRatio * i;

        //Move the slider
        value = value + (this.state.adjustSign * 0.000001);//enforce UI update
        if (this.state.adjustSign > 0) {
            this.setState({adjustSign: -1});
        } else {
            this.setState({adjustSign: 1});
        }
        this.setState({value: value, item: i}, () =>
            //callback
            this.props.onSlidingComplete(i)
        );
    }

    _getItemWidth(x) {
        const width = x.nativeEvent.layout.width;
        const itemWidth = this.state.itemWidth;
        itemWidth.push(width);
        this.setState({itemWidth: itemWidth});
        //we have all itemWidth determined, let's update the silder width
        if (this.state.itemWidth.length == this.props.items.length) {
            const max = Math.max.apply(null, this.state.itemWidth);
            if (this.refs.slider && this.state.sliderWidth > 0) {
                const that = this;
                let w, l;
                let buffer = 30;//add buffer for the slider 'ball' control
                if(buffer > w){
                    buffer = 0;
                }
                w = that.state.sliderWidth - max;
                w = w + buffer;
                l = max / 2;
                l = l - buffer / 2;
                that.setState({sliderWidth: w});
                that.setState({sliderLeft: l});
            }
        }
    }

    _getSliderWidth(e) {
        const {x, y, width, height} = e.nativeEvent.layout;
        this.setState({sliderWidth: width});
    }

    _labelView() {
        const itemStyle = [defaultStyles.item, this.props.itemStyle];
        let labels = this.props.items.map((i, j) => <Text key={i.value} ref={"t"+j} style={itemStyle} onLayout={this._getItemWidth}>{i.label}</Text>);
        return (
            <View style={[defaultStyles.itemWrapper, this.props.itemWrapperStyle]}>
            { labels }
            </View>
        );
    }

    render() {
        const that = this;
        return (
            <View onLayout={that._getSliderWidth} style={[defaultStyles.container, this.props.containerStyle]}>
                {this.props.labelPosition == 'top' ? this._labelView() : null}
                <Slider ref="slider" {...this.props} style={this._sliderStyle()} onSlidingComplete={(value) => this._onSlidingCompleteCallback(value)} value={this.state.value} />
                {this.props.labelPosition === undefined || this.props.labelPosition == 'bottom' ? this._labelView() : null}
            </View>
        );
    }
};

var defaultStyles = StyleSheet.create({
    container: {
        alignSelf: 'stretch',
    },
    slider: {
    },
    itemWrapper: {
        justifyContent: 'space-between',
        alignSelf: 'stretch',
        flexDirection: 'row',
    },
    item: {
    },
});

SnapSlider.propTypes = {
    onSlidingComplete: PropTypes.func,
    style: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
    containerStyle: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
    itemWrapperStyle: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
    itemStyle: Text.propTypes.style,
    items: PropTypes.array.isRequired,
    defaultItem: PropTypes.number,
    labelPosition: PropTypes.string
}

SnapSlider.defaultProps = {
    minimumValue: 0,
    maximumValue: 1,
}


module.exports = SnapSlider;
