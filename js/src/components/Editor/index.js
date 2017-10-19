// @file: Editor component jsx file
// @auth: spc@data.me 2017/10/10

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
    Editor,
    EditorState,
    RichUtils,
    convertToRaw,
    convertFromRaw,
    CompositeDecorator,
    Modifier
} from 'draft-js';

import ToolBar from '../ToolBar';
import LinkDecorator from '../../decorators/Link';
import blockRendererFunc from '../../blocks';
import { blockStyleFunc, getCurrentBlock } from '../../utils';
import '../../Draft.css';
import './styles.css';

export default class DraftEditor extends Component {
    static propTypes = {
        initContentState: PropTypes.object,
        customBlockConfig: PropTypes.object,
        imageUploader: PropTypes.func.isRequired,
        readOnly: PropTypes.boolean,
        onChange: PropTypes.func,
        placeholder: PropTypes.string
    };
    constructor(props) {
        super(props);
        this.state = {
            editorState: undefined
        };
    }
    componentWillMount() {
        const editorState = this.createEditorState();
        this.setState({
            editorState
        });
    }
    // trigger when editorState change
    onChange: Function = (editorState) => {
        const { onChange } = this.props;
        if (onChange) {
            onChange(convertToRaw(editorState.getCurrentContent()));
        }
        if (getCurrentBlock(editorState).getKey() !== getCurrentBlock(this.state.editorState).getKey()) {
            this.setState({
                editorState: EditorState.forceSelection(editorState, editorState.getSelection())
            });
        } else {
            this.setState({
                editorState
            });
        }
    };
    onTab: Function = (event) => {
        const editorState = RichUtils.onTab(event, this.state.editorState, 4);
        if (editorState) {
            this.onChange(editorState);
            event.preventDefault();
        }
    };
    // get EditorState
    getEditorState: Function = () => this.state.editorState;
    // create default EditorState
    createEditorState: Function = () => {
        const decorator = new CompositeDecorator([LinkDecorator]);
        if (this.props.initContentState) {
            return EditorState.createWithContent(
                convertFromRaw(this.props.initContentState),
                decorator
            );
        }
        return EditorState.createEmpty(decorator);
    }
    // change EditorState
    changeEditorState: Function = (editorState) => {
        this.setState({
            editorState
        });
    }
    // handle return key
    handleReturn: Function = (event) => {
        const { editorState } = this.state;
        if (!event.altKey && !event.metaKey && !event.ctrlKey) {
            const currentBlock = getCurrentBlock(editorState);
            const blockType = currentBlock.getType();
            const blockDepth = currentBlock.getDepth();
            if (blockType === 'atomic') {
                return 'handled';
            }
            if (currentBlock.getLength() === 0) {
                switch (blockType) {
                    case 'unordered-list-item':
                    case 'ordered-list-item':
                        if (blockDepth > 0) {
                            const newBlock = currentBlock.set('depth', blockDepth - 1);
                            const contentState = editorState.getCurrentContent();
                            const blockMap = contentState.getBlockMap().set(newBlock.getKey(), newBlock);
                            const selection = editorState.getSelection();
                            const newContentState = contentState.merge({
                                blockMap,
                                selectionBefore: selection,
                                selectionAfter: selection
                            });
                            this.onChange(EditorState.push(
                                editorState,
                                newContentState,
                                'adjust-depth'
                            ));
                        } else {
                            this.onChange(RichUtils.toggleBlockType(
                                editorState,
                                'unstyled'
                            ));
                        }
                        return 'handled';
                    case 'header-three':
                        this.onChange(RichUtils.toggleBlockType(
                            editorState,
                            'unstyled'
                        ));
                        return 'handled';
                    default:
                        return 'not-handled';
                }
            }
            return 'not-handled';
        }
        return 'not-handled';
    }
    // key handle
    handleKeyCommand: Function = (command, editorState) => {
        console.log(command);
        const newState = RichUtils.handleKeyCommand(editorState, command);
        if (newState) {
            this.onChange(newState);
            return 'handled';
        }
        const currentBlock = getCurrentBlock(editorState);
        const blockType = currentBlock.getType();
        if (blockType === 'atomic') {
            if (command === 'delete' || command === 'backspace') {
                const contentState = editorState.getCurrentContent();
                const deletedState = EditorState.push(
                    editorState,
                    Modifier.removeRange(contentState, editorState.getSelection(), 'forward'),
                    'remove-range'
                );
                const unstyledState = EditorState.push(
                    deletedState,
                    Modifier.setBlockType(deletedState.getCurrentContent(), editorState.getSelection(), 'unstyled'),
                    'change-block-type',
                );
                if (unstyledState) {
                    this.onChange(unstyledState);
                    return 'handled';
                }
            }
        }
        return 'not-handled';
    };
    handleBeforeInput: Function = (chars, editorState) => {
        const currentBlock = getCurrentBlock(editorState);
        const blockType = currentBlock.getType();
        if (blockType === 'atomic') {
            return 'handled';
        }
        return 'not-handled';
    };
    handlePastedText: Function = (text, html, editorState) => {
        const currentBlock = getCurrentBlock(editorState);
        const blockType = currentBlock.getType();
        if (blockType === 'atomic') {
            return 'handled';
        }
        return 'not-handled';
    }
    render() {
        const {
            placeholder
        } = this.props;
        const {
            editorState
        } = this.state;
        return (
            <div className="rde-wrap">
                { !this.props.readOnly && <ToolBar
                    currentState={editorState}
                    imageUploader={this.props.imageUploader}
                    changeState={this.changeEditorState}
                    customBlockConfig={this.props.customBlockConfig}
                /> }
                <Editor
                    onTab={this.onTab}
                    blockRendererFn={blockRendererFunc(
                        this.changeEditorState,
                        this.getEditorState,
                        this.props.customBlockConfig,
                        this.props.imageUploader
                    )}
                    blockStyleFn={blockStyleFunc}
                    editorState={editorState}
                    onChange={this.onChange}
                    readOnly={this.props.readOnly}
                    handleKeyCommand={this.handleKeyCommand}
                    handleBeforeInput={this.handleBeforeInput}
                    handlePastedText={this.handlePastedText}
                    handleReturn={this.handleReturn}
                    placeholder={placeholder}
                />
            </div>
        );
    }
}
