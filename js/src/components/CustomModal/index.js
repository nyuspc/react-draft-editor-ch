// @file: Custom insert modal jsx file
// @auth: spc@data.me 2017/10/16

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import textIcon from '../../../../icon/text.svg';
import styles from './styles.css'; // eslint-disable-line no-unused-vars

export default class CustomModal extends Component {
    static propTypes = {
        customBlockConfig: PropTypes.object.isRequired,
        onSubmit: PropTypes.func,
        onCancel: PropTypes.func
    };
    constructor(props) {
        super(props);
        this.state = {
            keyword: '',
            data: undefined
        };
    }
    componentDidMount() {
        this.keyRef.focus();
    }
    onSearch: Function = () => {
        const { keyword } = this.state;
        if (keyword.length > 0) {
            this.props.customBlockConfig.suggestCustomData(keyword).then((values) => {
                this.setState({
                    data: values
                });
            });
        }
    }
    addCustom: Function = (data) => {
        this.props.onSubmit(data);
        this.props.onCancel();
    }
    updateKeyword: Function = (event) => {
        this.setState({
            keyword: event.target.value
        });
    }
    handleKeyDown: Function = (event) => {
        if (event.keyCode === 13) {
            this.onSearch();
            event.stopPropagation();
        }
    }
    render() {
        const config = this.props.customBlockConfig;
        return (
            <div className="rde-modal">
                <div className="rde-modal-body">
                    <div className="rde-modal-title">{config.customTitle}</div>
                    <div className="rde-modal-input-box">
                        <img src={textIcon} alt="" />
                        <input
                            className="rde-modal-input"
                            onChange={this.updateKeyword}
                            onKeyDown={this.handleKeyDown}
                            value={this.state.keyword}
                            ref={(ref) => { this.keyRef = ref; }}
                            placeholder="输入关键字搜索..."
                        />
                    </div>
                    <div className="rde-model-selector">
                        { this.state.data &&
                            this.state.data.map((value) => {
                                const card = (
                                    <div className="rde-model-select-item" onClick={() => this.addCustom(value)} key={value.key} role="presentation" >
                                        { config.renderCustomData(value) }
                                    </div>);
                                return card;
                            })
                        }
                        { (this.state.data && this.state.data.length === 0) &&
                            <div>对不起，没有找到结果</div>
                        }
                    </div>
                    <div className="rde-modal-btns">
                        <button className="rde-modal-btn-ok" onClick={this.onSearch}>搜索</button>
                        <button className="rde-modal-btn-cancel" onClick={this.props.onCancel}>取消</button>
                    </div>
                </div>
            </div>
        );
    }
}
