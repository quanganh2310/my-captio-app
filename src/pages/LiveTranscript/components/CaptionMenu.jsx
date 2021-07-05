/* eslint-disable react/no-array-index-key */
import React, { Component } from 'react';
import { Button, Row, Col } from 'antd';
import { Radio, Switch, Slider, Tooltip } from 'antd';
import { SettingFilled } from '@ant-design/icons';

import ModelDropdown from './ModelDropdown';
import CaptionSettingIcon from '../../../assets/icons/caption-setting-icon.svg';

const colorOptions = [
  { label: 'White', value: 'white' },
  { label: 'Black', value: 'rgba(8, 8, 8, 0.75)' },
  { label: 'Yellow', value: 'yellow' },
  { label: 'Blue', value: 'blue' },
  { label: 'Green', value: 'green' },
];

export class CaptionMenu extends Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      size: 1.5,
      color: 'white',
      backgroundColor: 'rgba(8, 8, 8, 0.75)',
      transparentBackground: false,
      showMenu: false,
    };
  }

  componentDidMount() {
    if (document.querySelector(".caption-segment")) {
      this.setState({
        oldBackground: document.querySelector(".caption-segment").style.background
      });
    }
  }

  handleClickMenu = () => {
    this.setState({
      showMenu: true
    });
  }

  handleOutsideClick =(e) => {
    if (this.node && this.node.contains(e.target)) {
      return;
    }

    this.handleClick();
  }

  handleClick = () => {
    if (!this.state.showMenu) {
      document.addEventListener('click', this.handleOutsideClick, false);
    } else {
      document.removeEventListener('click', this.handleOutsideClick, false);
    }
    this.setState(prevState => ({
      showMenu: !prevState.showMenu,
    }));
    this.props.handleShowMenu(!this.state.showMenu);
  }

  handleVisibleChange = flag => {
    this.setState({ visible: flag });
  };

  handleChange = (value) => {
    const model = value;
    if (model !== this.props.model && this.props.onChangeLanguage) {
      this.props.onChangeLanguage(value);
    }
  }

  handleSizeChange = value => {
    const captionSegment = document.querySelector(".caption-segment");
    this.setState({
      size: value,
    });
    captionSegment.style.fontSize = `${value}em`;
  };

  handleColorChange = (e) => {
    const captionSegment = document.querySelector(".caption-segment");
    this.setState({ color: e.target.value });
    captionSegment.style.color = e.target.value;
  };

  handleBackgroundColorChange = (e) => {
    const captionSegment = document.querySelector(".caption-segment");
    this.setState({
      backgroundColor: e.target.value,
      oldBackground: e.target.value,
    });
    if (!this.state.transparentBackground) {
      captionSegment.style.background = e.target.value;
    }
  };

  onChangeTransparent = (checked) => {
    const captionSegment = document.querySelector(".caption-segment");
    this.setState({ transparentBackground: checked });
    if (checked) {
      captionSegment.style.background = 'rgba(0, 0, 0, 0)';
    }
    else {
      captionSegment.style.background = this.state.oldBackground;
    }
  }

  render() {

    const { size, color, backgroundColor, showMenu } = this.state;
    const { onChangeLanguage, model } = this.props;

    const menu = (
      <div className="caption-menu">
        <div className="caption-menu-container">
        <Row className="caption-menu-item" justify="start">
          <Col span={8} className="menu-item-title">Language</Col>
          <Col span={16} className="menu-item-content">
            <ModelDropdown
              className="model-selector"
              onChangeLanguage={onChangeLanguage}
              model={model}
            />
          </Col>
        </Row>
        <Row className="caption-menu-item" justify="start">
          <Col span={8} className="menu-item-title">Text size</Col>
          <Col span={16} className="menu-item-content">
            <Slider
              className="font-slider"
              min={0.5}
              max={3}
              step={0.1}
              onChange={this.handleSizeChange}
              value={size}
            />
          </Col>
        </Row>
        <Row className="caption-menu-item" justify="start">
          <Col span={8} className="menu-item-title">Text color</Col>
          <Col span={16} className="menu-item-content">
            <Radio.Group
              size="small"
              className="color-group"
              value={color}
              onChange={this.handleColorChange}
            >
              {colorOptions.map((option, index) => {
                return (
                  <Radio.Button
                    className="font-color-radio-button"
                    key={`font-color-${index}`}
                    value={option.value}
                    style={{
                      borderColor: option.value,
                      backgroundColor: option.value
                    }}
                  >
                  </Radio.Button>
                );
              })}
            </Radio.Group>
          </Col>
        </Row>
        <Row className="caption-menu-item" justify="start">
          <Col span={8} className="menu-item-title">Background</Col>
          <Col span={16} className="menu-item-content">
            <Radio.Group
              size="small"
              value={backgroundColor}
              onChange={this.handleBackgroundColorChange}
            >
              {colorOptions.map((option, index) => {
                return (
                  <Radio.Button
                    className="font-color-radio-button"
                    key={index}
                    value={option.value}
                    style={{
                      borderColor: option.value,
                      backgroundColor: option.value
                    }}
                  >
                  </Radio.Button>
                );
              })}
            </Radio.Group>
          </Col>
        </Row>
        <Row className="caption-menu-item" justify="start">
          <Col span={14} className="menu-item-title">Transparent background</Col>
          <Col span={10} className="menu-item-content">
            <Switch onChange={this.onChangeTransparent} />
          </Col>
        </Row>
        <Row className="caption-menu-item" justify="start">
          <Col span={14} className="menu-item-title">Show full transcript</Col>
          <Col span={10} className="menu-item-content">
            <Switch onChange={this.props.onShowTextBox} />
          </Col>
        </Row>
        {/* <div className="caption-menu-button fullscreen-btn transcript-switch-container">
            <Switch className="transcript-swt-btn" onChange={this.props.onShowTextBox} />

        </div> */}
      </div>
      </div>
    );

    return (
      <div
      ref={node => { this.node = node; }}
      >
        <Tooltip placement="top" title="Caption Settings">
          <Button
            id='stopCapture'
            className="caption-menu-button"
            onClick={this.handleClick}
          >
            <img src={CaptionSettingIcon} alt="stopBtn"/>
          </Button>
        </Tooltip>
          {showMenu && menu}
      </div>
    );
  }
}

export default CaptionMenu;
