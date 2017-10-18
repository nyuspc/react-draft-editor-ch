import React, { Component } from 'react';
import {
    SelectionState,
    EditorState
} from 'draft-js';
import classnames from 'classnames';
import PropTypes from 'prop-types';

import { getCurrentBlock } from '../../utils';
import linkIcon from '../../../../icon/link.svg';
import styles from './styles.css'; // eslint-disable-line no-unused-vars


export default class Image extends Component {
    static propTypes: Object = {
        block: PropTypes.object,
        contentState: PropTypes.object,
        blockProps: PropTypes.object
    };
    state: Object = {
        isSelected: false,
        hovered: false
    };
    componentWillReceiveProps(props) {
        const { block, blockProps } = props;
        const { getEditorState } = blockProps;
        const key = block.getKey();
        const editorState = getEditorState();
        const currentblock = getCurrentBlock(editorState);
        this.setState({
            isSelected: currentblock.getKey() === key
        });
    }
    // 组件获取焦点
    focusBlock: Function = () => {
        const { block, blockProps } = this.props;
        const { getEditorState, setEditorState } = blockProps;
        const key = block.getKey();
        const editorState = getEditorState();
        const newSelection = new SelectionState({
            anchorKey: key,
            focusKey: key,
            anchorOffset: 0,
            focusOffset: 0
        });
        setEditorState(EditorState.forceSelection(editorState, newSelection));
    }
    toggleEnter: Function = (): void => {
        this.setState({
            hovered: true
        });
    };
    toggleLeave: Function = (): void => {
        this.setState({
            hovered: false
        });
    };
    renderLinkOption(customData) {
        return (
            <div className="rde-custom-toolbar">
                <button className="rde-block-button" title="查看原文" onClick={() => this.props.blockProps.customBlockConfig.goLink(customData)}>
                    <img src={linkIcon} alt="Left" />
                </button>
            </div>
        );
    }
    render(): Object {
        const { block, contentState } = this.props;
        const entityKey = block.getEntityAt(0);
        let blockData = {
            customData: undefined
        };
        if (entityKey) {
            const entity = contentState.getEntity(entityKey);
            blockData = entity.getData();
        }
        const { customData } = blockData;
        return (
            <div
                className="rde-custom-block"
                onClick={this.focusBlock}
                onMouseEnter={this.toggleEnter}
                onMouseLeave={this.toggleLeave}
                role="presentation"
            >
                <div className={classnames(
                    'rde-custom-wrapper',
                    { 'rde-custom-is-selected': this.state.isSelected }
                )}
                >
                    { this.props.blockProps.customBlockConfig.renderCustomBlock(customData) }
                    { this.state.hovered && this.renderLinkOption(customData) }
                </div>
            </div>
        );
    }
}
