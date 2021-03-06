import React, { Component } from 'react';
import { Select } from 'antd';
import './ModelDropdown.css';

const { Option } = Select;


export class ModelDropdown extends Component {
    constructor() {
        super();
        this.state = {
            model: '',
            models: [
                {
                    name: 'English',
                    value: 'en-US_BroadbandModel'
                },
                {
                    name: 'Japanese',
                    value: 'ja-JP_BroadbandModel'
                },
            ] ,
        };
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(value) {
        const model = value;
        if (model !== this.props.model && this.props.onChangeLanguage) {
            this.props.onChangeLanguage(value);
        }
    }

    render() {
        return (
            <Select
                showSearch
                className="model-selector"
                dropdownStyle={{background: 'rgba(26, 26, 26, 0.85)'}}
                placeholder="Language"
                optionFilterProp="children"
                filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                filterSort={(optionA, optionB) =>
                    optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                }
                onChange={this.handleChange}
                defaultValue="en-US_BroadbandModel"
            >
                <Option
                  className="model-option"
                  value="en-US_BroadbandModel"
                  // style={{background: 'rgba(102, 102, 102, 0.85)', color: 'white'}}
                >
                    English
                </Option>
                <Option
                  className="model-option"
                  value="ja-JP_BroadbandModel"
                  // style={{background: 'rgba(102, 102, 102, 0.85)', color: 'white'}}

                >Japanese</Option>
            </Select>
        );
    }
}

export default ModelDropdown;
