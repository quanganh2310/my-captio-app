/* eslint-disable react/no-array-index-key */
import React, { Component } from 'react';
import { Button, Row, Col } from 'antd';
import { Radio, Switch, Slider, Tooltip } from 'antd';
import { SettingFilled } from '@ant-design/icons';

import './CaptureBtn.css';

import Union from '../../../../public/icons/Union.svg';
import Rectangle20 from '../../../../public/icons/Rectangle20.png';
import Rectangle21 from '../../../../public/icons/Rectangle 21.png';
import Rectangle22 from '../../../../public/icons/Rectangle 22.png';
import Rectangle23 from '../../../../public/icons/Rectangle 23.png';
import Rectangle24 from '../../../../public/icons/Rectangle 24.png';

export class CaptureBtn extends Component {

  constructor(props) {
    super(props);
    this.state = {
    };
  }


  render() {

    const {backgroundColor, RightIcon, Frame, LeftIcon, text, onClick} = this.props;

    return (
      <>
        <div id="captureBtn" onClick={onClick} className="capture-btn" style={{background: backgroundColor }}>
          <div id="rectangle20" className="rectangle-20">
            <img src={Rectangle20} alt="reactangle20"/>
          </div>
          <div id="rectangle21" className="rectangle-21">
            <img src={Rectangle21} alt="reactangle21"/>
          </div>
          <div id="rectangle24" className="rectangle-24">
            <img src={Rectangle24} alt="reactangle24"/>
          </div>
          <div id="captureBtnIcon" className="capture-btn-icon">
            <img src={Union} alt="Union"/>
          </div>
          <div id="captureBtnContent" className="capture-btn-contents">
            <span>{text}</span>
          </div>
          {/* <div id="rectangle22" className="rectangle-22">
            <img src={Rectangle22} alt="reactangle22"/>
          </div> */}
          <div id="rectangle23" className="rectangle-23">
            <img src={Rectangle23} alt="reactangle23"/>
          </div>
          <div id="captureBtnIcon" className="capture-btn-icon">
          </div>
          <div id="captureBtnImg" className="capture-btn-image">
            <div className="capture-btn-img-container">
              { LeftIcon && <img id="leftIcon" src={LeftIcon} alt="LeftIcon"/>}
              <img id="macBookFrame" src={Frame} alt="Frame"/>
              <img id="rightIcon" src={RightIcon} alt="RightIcon"/>
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default CaptureBtn;
