import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Entity } from 'draft-js';

import './styles.css';

function findLinkEntities(contentBlock, callback) {
    contentBlock.findEntityRanges(
        (character) => {
            const entityKey = character.getEntity();
            return (
                entityKey !== null &&
                Entity.get(entityKey).getType() === 'LINK'
            );
        },
        callback
    );
}

class Link extends PureComponent {
    static propTypes = {
        entityKey: PropTypes.string.isRequired,
        children: PropTypes.array
    };
    render() {
        const { children, entityKey } = this.props;
        const { url } = Entity.get(entityKey).getData();
        return (
            <span className="rde-link-decorator">
                <a href={url} title={url}>{children}</a>
            </span>
        );
    }
}

export default {
    strategy: findLinkEntities,
    component: Link
};
